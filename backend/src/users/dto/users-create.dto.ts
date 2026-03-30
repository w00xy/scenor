import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Alex',
    description: 'User display name',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'alex@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

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
