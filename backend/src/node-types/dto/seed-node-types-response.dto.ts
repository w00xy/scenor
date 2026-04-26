import { ApiProperty } from '@nestjs/swagger';

export class SeedNodeTypesResponseDto {
  @ApiProperty({
    example: true,
    description: 'Результат инициализации типов узлов',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Node types seeded successfully',
    description: 'Сообщение об успешной инициализации',
  })
  message!: string;

  @ApiProperty({
    example: 8,
    description: 'Количество созданных типов узлов',
  })
  count!: number;
}
