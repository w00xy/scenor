import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateCredentialDto {
  @ApiProperty({
    description: 'Credential type',
    example: 'api_key',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Credential name',
    example: 'GitHub API Token',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Credential data (will be encrypted)',
    example: { apiKey: 'ghp_xxxxxxxxxxxx' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}
