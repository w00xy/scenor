import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldStrongPass123',
    minLength: 6,
    description: 'Current password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @ApiProperty({
    example: 'newStrongPass123',
    minLength: 6,
    description: 'New password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
