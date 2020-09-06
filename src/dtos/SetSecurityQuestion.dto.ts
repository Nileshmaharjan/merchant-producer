import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SetSecurityQuestionDto {
  @ApiModelProperty()
  @IsNotEmpty({ message: 'Answers is required' })
  answers: Array<string>;
}
