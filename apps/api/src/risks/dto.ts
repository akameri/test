import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const RISK_STATUSES = ['OPEN', 'MITIGATING', 'MITIGATED', 'ACCEPTED'] as const;

export class CreateRiskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  likelihood!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  impact!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  owner?: string;

  @IsOptional()
  @IsString()
  controlId?: string;
}

export class UpdateRiskDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  likelihood?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  impact?: number;

  @IsOptional()
  @IsIn(RISK_STATUSES as unknown as string[])
  status?: (typeof RISK_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  owner?: string;
}
