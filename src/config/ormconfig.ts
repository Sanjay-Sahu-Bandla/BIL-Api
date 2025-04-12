import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmConfig = new DataSource({
  type: (process.env.DB_TYPE || 'mysql') as 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [`${__dirname}/../**/**.entity{.ts,.js}`],
  // migrations: [`${__dirname}/../migrations/*{.ts,.js}`], // Add this
});
