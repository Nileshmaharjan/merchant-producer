import { IsIn } from 'class-validator';

export class ApproveRejectDto {
  @IsIn(['APPROVED', 'REJECTED'], {
    message: 'Value must be either APPROVED or REJECTED',
  })
  status: string;
}
