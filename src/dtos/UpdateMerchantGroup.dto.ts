import { ApiModelPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsInt,
  IsAlphanumeric,
} from 'class-validator';
import { IsOptional } from '@common/others/customOptional';

export class UpdateMerchantGroupDto {
  id?: number;
  idx?: string;

  @Length(6, 30, {
    message: 'Group name username must be between 6 to 30 characters long',
  })
  @Matches(/^[0-9a-zA-Z\s]+$/m, { message: 'Group name is invalid' })
  group_name?: string;

  created_by: string;

  merchant_group?: any;

  status?: string;

  operation?: string;
}
