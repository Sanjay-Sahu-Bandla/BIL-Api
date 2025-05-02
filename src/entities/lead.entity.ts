import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { FavoriteEntity } from './favorite.entity';
import { CartEntity } from './cart.entity';
import * as fs from 'fs';
import * as path from 'path';
import { APP_DROPDOWNS } from 'src/config/app.constants';
import { Exclude, Expose } from 'class-transformer';

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
  @Exclude()
  favorites: FavoriteEntity[];

  @OneToMany(() => CartEntity, (cart) => cart.lead, {
    cascade: true,
  })
  @Exclude()
  cart: CartEntity[];

  @Expose()
  get imageUrl(): string | null {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const filePath = `images/${this.id}/${this.fileName}`;

    if (!bucketName || !this.fileName || !this.id) {
      return null;
    }

    return `https://${bucketName}.s3.${region}.amazonaws.com/${filePath}`;
  }

  @Expose()
  get locationName(): string | null {
    const locationOptions = APP_DROPDOWNS.LOCATION_OPTIONS;
    const location = locationOptions.find(
      (option) => option.value === this.locationId,
    );
    return location ? location.label : null;
  }
}
