import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';
import { IsOptional } from '@common/others/customOptional';
import { Transform } from 'class-transformer';

export class UpdateMerchantDto {
  @IsOptional()
  @IsInt({ message: 'Value must be a string' })
  merchant_id?: any;

  @IsOptional()
  @IsNumberString({ message: 'Mobile number must be numeric' })
  @Length(10, 10, {
    message: 'Mobile Number must be 10 digit',
  })
  mobile_number?: string;

  @IsOptional()
  @IsIn(['BUSINESS', 'INDIVIDUAL'], {
    message: 'Merchant nature must be either BUSINESS or INDIVIDUAL',
  })
  merchant_nature?: string;

  @IsOptional()
  @Length(3, 64, {
    message: 'Merchant Company Name must be between 3 and 64 characters long',
  })
  @Matches(/^[#&.0-9a-zA-Z\s,-]+$/m, { message: 'Company name is invalid' })
  company_name?: string;

  @IsOptional()
  @Transform(value => (value === '' ? null : value))
  @Matches(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, {
    message: 'Issue date must be of format yyyy/mm/dd',
  })
  issue_date?: string;

  @IsOptional()
  @IsNumberString({ message: 'Merchant code must be a number' })
  @Length(3, 16, {
    message: 'Merchant code must be between 3 and 16 characters long',
  })
  merchant_code?: string;

  @IsOptional()
  @IsIn(['NATIONAL_ID', 'PASSPORT'], {
    message: 'Id type must be either NATIONAL_ID and PASSPORT',
  })
  id_type?: string;

  @IsOptional()
  @Transform(value => (value === '' ? null : value))
  @Matches(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, {
    message: 'Id expiry date must be of format yyyy/mm/dd',
  })
  id_expiry?: string;

  @IsOptional()
  @Transform(value => (value === '' ? null : value))
  @IsString({ message: 'Merchant group must be string' })
  merchant_group?: any;

  @IsOptional()
  @IsAlpha('en-US', { message: 'Nationality must be alphabetic string' })
  nationality?: string;

  @IsOptional()
  @IsNumberString({
    message: 'Id card/passport no code  must be valid number string',
  })
  @Length(3, 30, {
    message: 'Id card/passport no must be between 3 and 30 characters long',
  })
  idpassport_no?: string;

  @IsOptional()
  @IsNumberString({ message: 'Establishment licence no must be numeric' })
  @Length(3, 30, {
    message:
      'Establishement licence no must be between 3 and 30 characters long',
  })
  establishment_licence_no?: string;

  @IsOptional()
  @IsNumberString({ message: 'Tax must be numeric' })
  @Length(3, 30, {
    message: 'Tax code must be between 3 and 30 characters long',
  })
  tax_code?: string;

  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'] },
    { message: 'Company Website must be a valid url' },
  )
  company_website?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Business Contact Email must be a valid email' })
  email?: string;

  @IsOptional()
  @IsNumberString({ message: 'Phone number must be numeric' })
  @Length(8, 16, {
    message: 'Business Phone Number must be between 8 and 16 characters long',
  })
  phone_number?: string;

  @IsOptional()
  @IsAlphanumeric('en-US', { message: 'Bank swift code must be alphanumeric' })
  @Length(3, 30, {
    message: 'Bank swift code must be between 3 and 30 characters long',
  })
  bank_swift_code?: string;

  @IsOptional()
  @IsNumberString({ message: 'Bank account number must be numeric' })
  bank_account_no?: string;

  @IsOptional()
  @IsAlphanumeric('en-US', { message: 'Branch code must be alphanumeric' })
  @Length(3, 30, {
    message: 'Bank code must be between 3 and 30 characters long',
  })
  branch_code?: string;

  @IsOptional()
  @Length(3, 30, {
    message: 'Bank address must be between 3 and 30 characters long',
  })
  @Matches(/^[#&.0-9a-zA-Z\s,-]+$/m, { message: 'Bank address is invalid' })
  bank_address?: string;

  @IsOptional()
  @IsAlphanumeric('en-US', { message: 'Bank code must be alphanumeric' })
  @Length(3, 30, {
    message: 'Bank code must be between 3 and 30 characters long',
  })
  bank_code?: string;

  @IsOptional()
  @IsNumberString({ message: 'Sweep interval  must be numeric' })
  @Length(1, 4, {
    message: 'Sweep interval must be between 1 and 4 characters long',
  })
  sweep_interval?: string;

  @IsOptional()
  @IsNumberString({ message: 'Refund allowed days must be numeric' })
  @Length(1, 4, {
    message: 'Refund allowed days must be between 1 and 4 characters long',
  })
  refund_allowed_days?: string;

  created_by?: string;

  status?: string;
  operation?: string;
}
