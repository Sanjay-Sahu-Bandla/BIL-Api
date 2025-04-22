import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { FavoriteEntity } from './favorite.entity';
import { CartEntity } from './cart.entity';
import * as fs from 'fs';
import * as path from 'path';
import { APP_DROPDOWNS } from 'src/config/app.constants';
import { Expose, Transform } from 'class-transformer';

@Entity('leads')
export class LeadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  fileName: string;

  @Column()
  locationId: number;

  @Column()
  area: string;

  @Column()
  propertyType: string;

  @Column()
  propertyStatus: string;

  @Column()
  serviceRequiredOn: string;

  @Column()
  budget: string;

  @Column()
  country: string;

  @Column({ type: 'text' })
  requirement: string;

  @Column()
  mobile: string;

  @Column()
  whatsAppMobile: string;

  @Column()
  actualPrice: number;

  @Column()
  sellingPrice: number;

  @Column()
  discountPrice: number;

  @Column({ type: 'int', default: 1 })
  stockQty: number;

  @Column({ type: 'int' })
  availableQty: number;

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

  @Expose()
  get imageUrl(): string | null {
    const serverAddress = process.env.SERVER_ADDRESS || 'http://localhost:3000';
    const imagePath = `assets/leads/images/${this.id}/${this.fileName}`;
    const fullPath = path.join(__dirname, `../../${imagePath}`);

    return fs.existsSync(fullPath) ? `${serverAddress}/${imagePath}` : null;
  }

  @Expose()
  get locationName(): string | null {
    const locationOptions = APP_DROPDOWNS.LOCATION_OPTIONS;
    const location = locationOptions.find(
      (option) => option.value === this.locationId,
    );
    return location ? location.label : null;
  }

  @Expose()
  @Transform(({ obj }) => obj.cart && obj.cart.length > 0)
  get isInCart(): boolean {
    return this.cart && this.cart.length > 0;
  }

  @Expose()
  @Transform(({ obj }) => obj.favorites && obj.favorites.length > 0)
  get isFavorite(): boolean {
    return this.favorites && this.favorites.length > 0;
  }
}
