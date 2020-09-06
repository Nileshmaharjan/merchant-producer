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
import { MerchantGroupTemp } from './MerchantGroupTemp';
import { MerchantProfile } from './MerchantProfile';
import { MerchantProfileTemp } from './MerchantProfileTemp';

@Entity('MerchantGroup', { schema: 'public' })
@Index('MerchantGroup_idx_key', ['idx'], { unique: true })
export class MerchantGroup {
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

  @OneToMany(
    () => MerchantGroupTemp,
    (MerchantGroupTemp: MerchantGroupTemp) => MerchantGroupTemp.merchant_group,
  )
  merchantGroupTemps: MerchantGroupTemp[];

  @OneToMany(
    () => MerchantProfile,
    (MerchantProfile: MerchantProfile) => MerchantProfile.merchant_group,
  )
  merchantProfiles: MerchantProfile[];

  @OneToMany(
    () => MerchantProfileTemp,
    (MerchantProfileTemp: MerchantProfileTemp) =>
      MerchantProfileTemp.merchant_group,
  )
  merchantProfileTemps: MerchantProfileTemp[];
}
