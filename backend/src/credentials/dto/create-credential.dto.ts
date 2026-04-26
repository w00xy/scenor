import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateCredentialDto {
  @ApiProperty({
    description: 'Credential type (oauth2, api_key, basic_auth, custom)',
    example: 'api_key',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Credential name',
    example: 'GitHub API Token',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Credential data (will be encrypted)',
    example: { apiKey: 'ghp_xxxxxxxxxxxx' },
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, unknown>;
}
