import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/auth-user';

export interface AuditEntryInput {
  actor: AuthUser;
  action: string; // z. B. "control.status.changed"
  entityType: string; // "Control" | "Risk"
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}

/**
 * Unveränderbares Audit-Log ("Immutable Audit Log"):
 *  1. Die Tabelle ist per DB-Trigger append-only (kein UPDATE/DELETE/TRUNCATE).
 *  2. Jeder Eintrag ist über eine SHA-256-Hash-Kette mit seinem Vorgänger
 *     verknüpft – nachträgliche Manipulation ist damit nachweisbar.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  private computeHash(prevHash: string, payload: string): string {
    return createHash('sha256').update(`${prevHash}|${payload}`).digest('hex');
  }

  /**
   * Kanonisches JSON (rekursiv sortierte Schlüssel): PostgreSQL speichert
   * jsonb ohne Schlüsselreihenfolge – ohne Kanonisierung wäre der Hash beim
   * Verifizieren nicht reproduzierbar.
   */
  private canonicalize(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((v) => this.canonicalize(v));
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(([k, v]) => [k, this.canonicalize(v)]),
      );
    }
    return value;
  }

  private serialize(entry: {
    ts: Date;
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue: unknown;
    newValue: unknown;
  }): string {
    return JSON.stringify([
      entry.ts.toISOString(),
      entry.actorId,
      entry.action,
      entry.entityType,
      entry.entityId,
      this.canonicalize(entry.oldValue ?? null),
      this.canonicalize(entry.newValue ?? null),
    ]);
  }

  async log(input: AuditEntryInput) {
    return this.prisma.$transaction(async (tx) => {
      const last = await tx.auditLog.findFirst({
        orderBy: { id: 'desc' },
        select: { hash: true },
      });
      const prevHash = last?.hash ?? 'GENESIS';
      const ts = new Date();
      const payload = this.serialize({
        ts,
        actorId: input.actor.id,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValue: input.oldValue,
        newValue: input.newValue,
      });
      return tx.auditLog.create({
        data: {
          ts,
          actorId: input.actor.id,
          actorName: input.actor.name,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          oldValue: (input.oldValue ?? undefined) as any,
          newValue: (input.newValue ?? undefined) as any,
          prevHash,
          hash: this.computeHash(prevHash, payload),
        },
      });
    });
  }

  async list(params: { page?: number; pageSize?: number; entityType?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, params.pageSize ?? 50));
    const where = params.entityType ? { entityType: params.entityType } : {};
    const [total, items] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      total,
      page,
      pageSize,
      items: items.map((e) => ({ ...e, id: e.id.toString() })),
    };
  }

  /** Prüft die gesamte Hash-Kette – der "Knopfdruck-Nachweis" für Auditoren. */
  async verifyChain(): Promise<{ valid: boolean; checked: number; brokenAtId?: string }> {
    const entries = await this.prisma.auditLog.findMany({ orderBy: { id: 'asc' } });
    let prevHash = 'GENESIS';
    for (const e of entries) {
      const payload = this.serialize({
        ts: e.ts,
        actorId: e.actorId,
        action: e.action,
        entityType: e.entityType,
        entityId: e.entityId,
        oldValue: e.oldValue,
        newValue: e.newValue,
      });
      if (e.prevHash !== prevHash || e.hash !== this.computeHash(prevHash, payload)) {
        return { valid: false, checked: entries.length, brokenAtId: e.id.toString() };
      }
      prevHash = e.hash;
    }
    return { valid: true, checked: entries.length };
  }

  async exportAll() {
    const entries = await this.prisma.auditLog.findMany({ orderBy: { id: 'asc' } });
    return entries.map((e) => ({ ...e, id: e.id.toString() }));
  }
}
