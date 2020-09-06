import { ApiModelPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsInt,
  IsAlphanumeric,
  IsAlpha,
} from 'class-validator';
import { IsOptional } from '@common/others/customOptional';

export class CreateMerchantGroupDto {
  id?: number;
  idx?: string;

  @ApiModelPropertyOptional({
    description: 'Group name of the merchant group',
    example: 'AEON-INDIA',
  })
  @IsNotEmpty({ message: 'Group name is required' })
  @Length(6, 30, {
    message: 'Group name username must be between 6 to 30 characters long',
  })
  @Matches(/^[0-9a-zA-Z\s]+$/m, { message: 'Group name is invalid' })
  group_name: string;

  // @IsNotEmpty({ message: 'Created by is required' })
  // @IsString({ message: 'Value must be string' })
  created_by?: string;

  // @IsNotEmpty({ message: 'Status is required' })
  // @IsString({ message: 'Value must be string' })
  status?: string;

  operation?: string;
}
