import { Injectable, NotFoundException } from '@nestjs/common';
import { RiskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { CreateRiskDto, UpdateRiskDto } from './dto';

@Injectable()
export class RisksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list() {
    return this.prisma.risk.findMany({
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      include: { control: { select: { code: true, title: true } } },
    });
  }

  async create(dto: CreateRiskDto, actor: AuthUser) {
    const risk = await this.prisma.risk.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        likelihood: dto.likelihood,
        impact: dto.impact,
        owner: dto.owner ?? '',
        controlId: dto.controlId || null,
      },
    });
    await this.audit.log({
      actor,
      action: 'risk.created',
      entityType: 'Risk',
      entityId: risk.id,
      newValue: {
        title: risk.title,
        likelihood: risk.likelihood,
        impact: risk.impact,
        status: risk.status,
      },
    });
    return risk;
  }

  async update(id: string, dto: UpdateRiskDto, actor: AuthUser) {
    const existing = await this.prisma.risk.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Risiko ${id} nicht gefunden`);

    const updated = await this.prisma.risk.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.likelihood !== undefined && { likelihood: dto.likelihood }),
        ...(dto.impact !== undefined && { impact: dto.impact }),
        ...(dto.status !== undefined && { status: dto.status as RiskStatus }),
        ...(dto.owner !== undefined && { owner: dto.owner }),
      },
    });

    const changed: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of ['title', 'likelihood', 'impact', 'status', 'owner'] as const) {
      if ((existing as any)[key] !== (updated as any)[key]) {
        changed[key] = { old: (existing as any)[key], new: (updated as any)[key] };
      }
    }
    if (Object.keys(changed).length > 0) {
      await this.audit.log({
        actor,
        action: 'risk.updated',
        entityType: 'Risk',
        entityId: id,
        oldValue: Object.fromEntries(Object.entries(changed).map(([k, v]) => [k, v.old])),
        newValue: Object.fromEntries(Object.entries(changed).map(([k, v]) => [k, v.new])),
      });
    }
    return updated;
  }
}
