import { Injectable, NotFoundException } from '@nestjs/common';
import { ControlStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { UpdateControlDto } from './dto';

@Injectable()
export class ControlsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listGroupedByArea() {
    return this.prisma.measureArea.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { controls: { orderBy: { code: 'asc' } } },
    });
  }

  async update(id: string, dto: UpdateControlDto, actor: AuthUser) {
    const existing = await this.prisma.control.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Maßnahme ${id} nicht gefunden`);

    const updated = await this.prisma.control.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as ControlStatus }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
    });

    if (dto.status !== undefined && dto.status !== existing.status) {
      await this.audit.log({
        actor,
        action: 'control.status.changed',
        entityType: 'Control',
        entityId: existing.code,
        oldValue: { status: existing.status },
        newValue: { status: updated.status },
      });
    }
    if (dto.note !== undefined && dto.note !== existing.note) {
      await this.audit.log({
        actor,
        action: 'control.note.changed',
        entityType: 'Control',
        entityId: existing.code,
        oldValue: { note: existing.note },
        newValue: { note: updated.note },
      });
    }
    return updated;
  }
}
