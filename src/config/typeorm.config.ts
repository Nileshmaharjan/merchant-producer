import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import config from '@config/index';
import { join } from 'path';

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  logging: true,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  entities: [join(__dirname, '../**/**{.ts,.js}')],
  synchronize: false,
};
