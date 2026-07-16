import { Injectable } from '@nestjs/common';
import { ControlStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const STATUS_SCORE: Record<ControlStatus, number | null> = {
  IMPLEMENTED: 1,
  IN_PROGRESS: 0.5,
  OPEN: 0,
  NOT_APPLICABLE: null, // fließt nicht in den Score ein
};

export interface AreaScore {
  key: string;
  name: string;
  score: number; // 0–100
  implemented: number;
  inProgress: number;
  open: number;
  notApplicable: number;
  total: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Gewichteter Compliance-Score: implemented = 100 %, in Arbeit = 50 %, offen = 0 %. */
  async computeSummary() {
    const areas = await this.prisma.measureArea.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { controls: true },
    });

    let weightSum = 0;
    let weightedScore = 0;
    const areaScores: AreaScore[] = [];
    const gaps: Array<{
      code: string;
      title: string;
      area: string;
      weight: number;
      status: ControlStatus;
      guidance: string;
    }> = [];

    for (const area of areas) {
      let aWeight = 0;
      let aScore = 0;
      const counts = { implemented: 0, inProgress: 0, open: 0, notApplicable: 0 };
      for (const c of area.controls) {
        const s = STATUS_SCORE[c.status];
        if (s === null) {
          counts.notApplicable++;
          continue;
        }
        aWeight += c.weight;
        aScore += c.weight * s;
        if (c.status === 'IMPLEMENTED') counts.implemented++;
        else if (c.status === 'IN_PROGRESS') counts.inProgress++;
        else counts.open++;
        if (c.status !== 'IMPLEMENTED') {
          gaps.push({
            code: c.code,
            title: c.title,
            area: area.name,
            weight: c.weight,
            status: c.status,
            guidance: c.guidance,
          });
        }
      }
      weightSum += aWeight;
      weightedScore += aScore;
      areaScores.push({
        key: area.key,
        name: area.name,
        score: aWeight > 0 ? Math.round((aScore / aWeight) * 100) : 100,
        ...counts,
        total: area.controls.length,
      });
    }

    const risks = await this.prisma.risk.findMany({
      where: { status: { in: ['OPEN', 'MITIGATING'] } },
    });
    const highRisks = risks
      .map((r) => ({
        id: r.id,
        title: r.title,
        score: r.likelihood * r.impact,
        likelihood: r.likelihood,
        impact: r.impact,
        status: r.status,
        owner: r.owner,
      }))
      .sort((a, b) => b.score - a.score);

    gaps.sort((a, b) => b.weight - a.weight || (a.status === 'OPEN' ? -1 : 1));

    return {
      generatedAt: new Date().toISOString(),
      complianceScore: weightSum > 0 ? Math.round((weightedScore / weightSum) * 100) : 0,
      areas: areaScores,
      topGaps: gaps.slice(0, 6),
      totalGaps: gaps.length,
      openRisks: highRisks.slice(0, 6),
      totalOpenRisks: highRisks.length,
    };
  }
}
