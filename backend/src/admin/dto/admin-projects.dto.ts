import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProjectsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['PERSONAL', 'TEAM'])
  type?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

export class TransferOwnershipDto {
  @IsString()
  newOwnerId!: string;
}
