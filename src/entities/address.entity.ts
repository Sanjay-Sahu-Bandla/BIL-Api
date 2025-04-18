import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from './user.entity'; // Adjust the import path as needed
import { OrderEntity } from './order.entity'; // Import OrderEntity
import { Expose } from 'class-transformer';

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'office' })
  addressType: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column()
  streetAddress: string;

  @Column()
  country: string;

  @Column()
  state: string;

  @Column()
  city: string;

  @Column()
  postcode: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => OrderEntity, (order) => order.address, {
    cascade: true,
  })
  orders: OrderEntity[];

  @Expose()
  get fullAddress(): string {
    return `${this.streetAddress}, ${this.city}, ${this.state} ${this.postcode}, ${this.country}`;
  }
}
