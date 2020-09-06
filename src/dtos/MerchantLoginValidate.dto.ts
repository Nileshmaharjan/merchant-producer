import { IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class MerchantLoginValidateDTO {
  @ApiModelProperty()
  @IsNotEmpty({ message: 'Otp is required' })
  @IsNumberString({ message: 'Otp must be numeric' })
  otp: string;

  @ApiModelProperty()
  @IsNotEmpty({ message: 'Mobile Number is required' })
  @IsNumberString({ message: 'Mobile number must be numeric' })
  @Length(10, 10, {
    message: 'Mobile Number must be 10 digit',
  })
  mobile_number: string;

  @ApiModelProperty()
  @IsNotEmpty({ message: 'Phone extension is required' })
  phone_ext: string;
}
