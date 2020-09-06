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
import { MerchantProfile } from './MerchantProfile';
import { MerchantGroup } from './MerchantGroup';
import { Expose } from 'class-transformer';

@Entity('MerchantProfileTemp', { schema: 'public' })
@Index('MerchantProfileTemp_idx_key', ['idx'], { unique: true })
export class MerchantProfileTemp {
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

  @Expose({ name: 'merchant' })
  @ManyToOne(
    () => MerchantProfile,
    (MerchantProfile: MerchantProfile) => MerchantProfile.merchantProfileTemps,
    {},
  )
  @JoinColumn({ name: 'merchant_id' })
  merchant_id: MerchantProfile | null;

  @Column('text', {
    nullable: true,
    name: 'mobile_number',
  })
  mobile_number: string | null;

  @Column('text', {
    nullable: true,
    name: 'company_name',
  })
  company_name: string | null;

  @Column('date', {
    nullable: true,
    name: 'issue_date',
  })
  issue_date: string | null;

  @Column('text', {
    nullable: true,
    name: 'merchant_nature',
  })
  merchant_nature: string | null;

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
    (MerchantGroup: MerchantGroup) => MerchantGroup.merchantProfileTemps,
    {},
  )
  @JoinColumn({ name: 'merchant_group_id' })
  merchant_group: MerchantGroup | null;

  @Column('text', {
    nullable: true,
    name: 'nationality',
  })
  nationality: string | null;

  @Column('text', {
    nullable: true,
    name: 'idpassport_no',
  })
  idpassport_no: string | null;

  @Column('text', {
    nullable: true,
    name: 'establishment_licence_no',
  })
  establishment_licence_no: string | null;

  @Column('text', {
    nullable: true,
    name: 'tax_code',
  })
  tax_code: string | null;

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
    nullable: true,
    name: 'phone_number',
  })
  phone_number: string | null;

  @Column('text', {
    nullable: true,
    name: 'bank_swift_code',
  })
  bank_swift_code: string | null;

  @Column('text', {
    nullable: true,
    name: 'bank_account_no',
  })
  bank_account_no: string | null;

  @Column('text', {
    nullable: true,
    name: 'branch_code',
  })
  branch_code: string | null;

  @Column('text', {
    nullable: true,
    name: 'bank_address',
  })
  bank_address: string | null;

  @Column('text', {
    nullable: true,
    name: 'bank_code',
  })
  bank_code: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'sweep_interval',
  })
  sweep_interval: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'refund_allowed_days',
  })
  refund_allowed_days: string | null;

  @Column('uuid', {
    nullable: true,
    name: 'created_by',
  })
  created_by: string | null;

  @Column('text', {
    nullable: false,
    name: 'status',
  })
  status: string;

  @Column('text', {
    nullable: false,
    name: 'operation',
  })
  operation: string;

  @Column('text', {
    nullable: true,
    name: 'rejection_reason',
  })
  rejection_reason: string | null;

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
}
