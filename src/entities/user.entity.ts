import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FavoriteEntity } from './favorite.entity';
import { AddressEntity } from './address.entity'; // Adjust the import path as needed
import { CartEntity } from './cart.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.user, {
    cascade: true,
  })
  favorites: FavoriteEntity[];

  @OneToMany(() => CartEntity, (cart) => cart.user, {
    cascade: true,
  })
  cart: CartEntity[];

  @OneToMany(() => AddressEntity, (address) => address.user, {
    cascade: true,
  })
  addresses: AddressEntity[];
}
