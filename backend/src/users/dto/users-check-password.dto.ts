import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CheckPasswordDto {
  @ApiProperty({
    example: 'strongPass123',
    minLength: 6,
    description: 'Password to verify',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}
