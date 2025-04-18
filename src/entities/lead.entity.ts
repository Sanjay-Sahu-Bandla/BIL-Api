import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { FavoriteEntity } from './favorite.entity';
import { CartEntity } from './cart.entity';

@Entity('leads')
export class LeadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  fileName: string;

  @Column()
  location: number;

  @Column()
  propertyType: string;

  @Column()
  propertyStatus: string;

  @Column({ type: 'date' })
  serviceRequiredOn: string;

  @Column()
  budget: number;

  @Column()
  country: string;

  @Column()
  requirement: string;

  @Column()
  tags: string;

  @Column()
  mobile: string;

  @Column()
  price: number;

  @Column()
  discountPrice: number;

  @Column()
  addressType: string;

  @Column()
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.lead, {
    cascade: true,
  })
  favorites: FavoriteEntity[];

  @OneToMany(() => CartEntity, (cart) => cart.lead, {
    cascade: true,
  })
  cart: CartEntity[];
}
