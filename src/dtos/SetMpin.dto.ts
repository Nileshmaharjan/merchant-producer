import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, IsNumberString } from 'class-validator';

export class SetMpinDto {
  @ApiModelProperty({
    description: 'mpin of user',
    example: 'hAfsFA$%770',
  })
  @Length(4, 4, {
    message: 'MPIN must be 4 digits',
  })
  @IsNumberString({ message: 'Mobile PIN must be numeric' })
  @IsNotEmpty({ message: 'MPIN cannot be empty' })
  mpin: string;

  @IsNumberString({ message: 'Mobile number must be numeric' })
  @Length(4, 4, {
    message: 'MPIN must be 4 digits',
  })
  @IsNotEmpty({ message: 'Confirm MPIN cannot be empty' })
  confirm_mpin: string;
}
