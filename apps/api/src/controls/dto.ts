import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const CONTROL_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'IMPLEMENTED',
  'NOT_APPLICABLE',
] as const;

export class UpdateControlDto {
  @IsOptional()
  @IsIn(CONTROL_STATUSES as unknown as string[])
  status?: (typeof CONTROL_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
