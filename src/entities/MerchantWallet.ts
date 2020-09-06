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

@Entity('MerchantWallet', { schema: 'public' })
@Index('MerchantWallet_idx_key', ['idx'], { unique: true })
export class MerchantWallet {
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

  @Column('bigint', {
    nullable: true,
    name: 'merchant_id',
  })
  merchant_id: string | null;

  @Column('double precision', {
    nullable: true,
    precision: 53,
    name: 'balance',
  })
  balance: number | null;

  @Column('text', {
    nullable: true,
    name: 'mpin',
  })
  mpin: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_obsolete',
  })
  is_obsolete: boolean;

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
