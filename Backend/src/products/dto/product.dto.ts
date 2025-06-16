import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserDto {
  @ApiProperty({
    type: String,
    example: 'productId',
  })
  @IsNotEmpty()
  id: string | number;
}
