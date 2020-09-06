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

@Entity('MerchantDevice', { schema: 'public' })
@Index('MerchantDevice_idx_key', ['idx'], { unique: true })
export class MerchantDevice {
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
    name: 'phone_ext',
  })
  phone_ext: string;

  @Column('text', {
    nullable: false,
    name: 'mobile_number',
  })
  mobile_number: string;

  @Column('text', {
    nullable: true,
    name: 'phone_brand',
  })
  phone_brand: string | null;

  @Column('text', {
    nullable: true,
    name: 'phone_os',
  })
  phone_os: string | null;

  @Column('text', {
    nullable: true,
    name: 'os_version',
  })
  os_version: string | null;

  @Column('text', {
    nullable: false,
    name: 'deviceid',
  })
  deviceid: string;

  @Column('text', {
    nullable: false,
    name: 'otp',
  })
  otp: string;

  @Column('text', {
    nullable: true,
    name: 'fcm_token',
  })
  fcm_token: string | null;

  @Column('text', {
    nullable: true,
    name: 'otp_type',
  })
  otp_type: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'otp_status',
  })
  otp_status: boolean;

  @Column('bigint', {
    nullable: true,
    default: () => '0',
    name: 'total_attempt',
  })
  total_attempt: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_obsolete',
  })
  is_obsolete: boolean;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'otp_created_at',
  })
  otp_created_at: Date;

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

  @Column('bigint', {
    nullable: false,
    name: 'merchant_id',
  })
  merchant_id: string;
}
