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

@Entity('MerchantSecurityQuestion', { schema: 'public' })
@Index('MerchantSecurityQuestion_idx_key', ['idx'], { unique: true })
export class MerchantSecurityQuestion {
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
    name: 'questions',
  })
  questions: string;

  @Column('text', {
    nullable: true,
    default: () => "'Superadmin'",
    name: 'created_by',
  })
  created_by: string | null;

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
