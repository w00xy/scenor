import { ApiProperty } from '@nestjs/swagger';
import { CredentialResponseDto } from './credential-response.dto.js';

export class CredentialsListResponseDto {
  @ApiProperty({
    type: [CredentialResponseDto],
    description: 'Список учётных данных в проекте',
  })
  credentials!: CredentialResponseDto[];
}
