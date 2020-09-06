import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class MerchantLogin {
  id?: number;
  idx?: string;

  @ApiModelProperty()
  @IsNotEmpty({ message: 'Phone Extension is required' })
  phone_ext: string;

  @ApiModelProperty()
  @IsNotEmpty({ message: 'Mobile Number is required' })
  @IsNumberString({ message: 'Mobile number must be numeric' })
  @Length(10, 10, {
    message: 'Mobile Number must be 10 digit',
  })
  mobile_number: string;

  @ApiModelProperty()
  phone_brand?: string;

  @ApiModelProperty()
  phone_os?: string;

  @ApiModelProperty()
  os_version?: string;

  @ApiModelProperty()
  @IsNotEmpty({ message: 'Device ID is required' })
  deviceid: string;

  @ApiModelProperty()
  fcm_token: string;

  @ApiModelProperty()
  otp_type?: string;
}
