import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class LoginUserDto {
  @ApiPropertyOptional({
    example: 'Alex',
    description: 'Username for login (use either username or email)',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o: LoginUserDto) => !o.email)
  @IsNotEmpty()
  username?: string;

  @ApiPropertyOptional({
    example: 'alex@example.com',
    description: 'Email for login (use either email or username)',
  })
  @IsOptional()
  @ValidateIf((o: LoginUserDto) => !o.username)
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'strongpass123',
    minLength: 6,
    description: 'User password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}
