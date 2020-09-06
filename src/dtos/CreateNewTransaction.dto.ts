import { IsIn } from 'class-validator';

export class CreateNewTransaction {
  customer_idx: string;
  first_name: string;
  transaction_date: Date;
  borrowed_amount: string;
  mpin: string;
}
