import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
  type: 'mariadb', // 예시로 postgres를 사용합니다. 데이터베이스에 따라 변경해야 합니다.
  host: process.env.DATASOURCE_URL,
  port: 3306,
  username: process.env.DATASOURCE_USERNAME,
  password: process.env.DATASOURCE_PASSWORD,
  database: 'carwarshingday_dev',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true, // 개발 환경에서만 사용하세요. 프로덕션에서는 사용하지 마세요.
  logging: false,
};

export default config;
