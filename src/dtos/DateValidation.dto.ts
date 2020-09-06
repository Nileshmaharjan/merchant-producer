import { IsNotEmpty, Matches } from 'class-validator';

export class MerchantTrnsactionDetails {
  @IsNotEmpty({ message: 'To Date is required' })
  @Matches(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, {
    message: 'To date must be of format yyyy-mm-dd',
  })
  to_date: string;

  @IsNotEmpty({ message: 'From Date is required' })
  @Matches(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, {
    message: 'From Date must be of format yyyy-mm-dd',
  })
  from_date: string;
}
