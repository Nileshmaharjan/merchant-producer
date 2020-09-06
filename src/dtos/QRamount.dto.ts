import { IsNumberString, IsOptional } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

export class QRAmount {
  @ApiModelPropertyOptional()
  @IsOptional()
  @IsNumberString({ message: 'Amount must be numeric' })
  amount?: string;
}
