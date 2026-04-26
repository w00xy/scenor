import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ShareAccessType } from '@prisma/client';

export class CreateWorkflowShareDto {
  @ApiProperty({
    description: 'Access type for the share',
    enum: ShareAccessType,
    example: 'view',
    default: 'view',
  })
  @IsEnum(ShareAccessType)
  @IsOptional()
  accessType?: ShareAccessType;

  @ApiProperty({
    description: 'Expiration date for the share (ISO 8601 format)',
    example: '2026-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
