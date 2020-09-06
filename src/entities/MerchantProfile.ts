import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { MerchantGroup } from './MerchantGroup';
import { MerchantProfileTemp } from './MerchantProfileTemp';

@Entity('MerchantProfile', { schema: 'public' })
@Index('MerchantProfile_idx_key', ['idx'], { unique: true })
export class MerchantProfile {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'id',
  })
  id: number;

  @Column('uuid', {
    nullable: false,
    unique: true,
    default: () => 'uuid_generate_v1()',
    name: 'idx',
  })
  idx: string;

  @Column('text', {
    nullable: false,
    name: 'mobile_number',
  })
  mobile_number: string;

  @Column('text', {
    nullable: false,
    name: 'company_name',
  })
  company_name: string;

  @Column('date', {
    nullable: true,
    name: 'issue_date',
  })
  issue_date: string | null;

  @Column('text', {
    nullable: false,
    name: 'merchant_nature',
  })
  merchant_nature: string;

  @Column('text', {
    nullable: true,
    name: 'merchant_code',
  })
  merchant_code: string | null;

  @Column('text', {
    nullable: true,
    name: 'id_type',
  })
  id_type: string | null;

  @Column('date', {
    nullable: true,
    name: 'id_expiry',
  })
  id_expiry: string | null;

  @ManyToOne(
    () => MerchantGroup,
    (MerchantGroup: MerchantGroup) => MerchantGroup.merchantProfiles,
    {},
  )
  @JoinColumn({ name: 'merchant_group_id' })
  merchant_group: MerchantGroup | null;

  @Column('text', {
    nullable: false,
    name: 'nationality',
  })
  nationality: string;

  @Column('text', {
    nullable: true,
    name: 'idpassport_no',
  })
  idpassport_no: string | null;

  @Column('text', {
    nullable: false,
    name: 'establishment_licence_no',
  })
  establishment_licence_no: string;

  @Column('text', {
    nullable: false,
    name: 'tax_code',
  })
  tax_code: string;

  @Column('text', {
    nullable: true,
    name: 'company_website',
  })
  company_website: string | null;

  @Column('text', {
    nullable: true,
    name: 'email',
  })
  email: string | null;

  @Column('text', {
    nullable: false,
    name: 'phone_number',
  })
  phone_number: string;

  @Column('text', {
    nullable: false,
    name: 'bank_swift_code',
  })
  bank_swift_code: string;

  @Column('text', {
    nullable: false,
    name: 'bank_account_no',
  })
  bank_account_no: string;

  @Column('text', {
    nullable: false,
    name: 'branch_code',
  })
  branch_code: string;

  @Column('text', {
    nullable: false,
    name: 'bank_address',
  })
  bank_address: string;

  @Column('text', {
    nullable: true,
    name: 'bank_code',
  })
  bank_code: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'sweep_interval',
  })
  sweep_interval: string;

  @Column('bigint', {
    nullable: false,
    name: 'refund_allowed_days',
  })
  refund_allowed_days: string;

  @Column('uuid', {
    nullable: false,
    name: 'created_by',
  })
  created_by: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_obsolete',
  })
  is_obsolete: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'true',
    name: 'is_active',
  })
  is_active: boolean;

  @Column('timestamp without time zone', {
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_on',
  })
  created_on: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'modified_on',
  })
  modified_on: Date | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_blocked',
  })
  is_blocked: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_initiated',
  })
  is_initiated: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_security_set',
  })
  is_security_set: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_mpin_set',
  })
  is_mpin_set: boolean | null;

  @OneToMany(
    () => MerchantProfileTemp,
    (MerchantProfileTemp: MerchantProfileTemp) =>
      MerchantProfileTemp.merchant_id,
  )
  merchantProfileTemps: MerchantProfileTemp[];
}
