import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { MerchantGroup } from './MerchantGroup';
import { Exclude } from 'class-transformer';

@Entity('MerchantGroupTemp', { schema: 'public' })
@Index('MerchantGroupTemp_idx_key', ['idx'], { unique: true })
export class MerchantGroupTemp {
  @Exclude({ toPlainOnly: true })
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

  @ManyToOne(
    () => MerchantGroup,
    (MerchantGroup: MerchantGroup) => MerchantGroup.merchantGroupTemps,
    {},
  )
  @JoinColumn({ name: 'merchant_group_id' })
  merchant_group: MerchantGroup | null;

  @Column('text', {
    nullable: true,
    name: 'username',
  })
  username: string | null;

  @Column('text', {
    nullable: true,
    name: 'password',
  })
  password: string | null;

  @Column('text', {
    nullable: true,
    name: 'group_name',
  })
  group_name: string | null;

  @Column('uuid', {
    nullable: false,
    name: 'created_by',
  })
  created_by: string;

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

  @Exclude({ toPlainOnly: true })
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

  @Column('text', {
    nullable: true,
    name: 'rejection_reason',
  })
  rejection_reason: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_on',
  })
  created_on: Date;

  @Exclude({ toPlainOnly: true })
  @Column('timestamp without time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'modified_on',
  })
  modified_on: Date | null;
}
