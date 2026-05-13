import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DeleteOwnAccountDto {
  @ApiProperty({
    example: 'strongPass123',
    minLength: 6,
    description: 'Current password for confirmation',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}
