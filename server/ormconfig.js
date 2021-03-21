require('dotenv').config();

const urlConfig =
  process.env.NODE_ENV === 'production'
    ? {
        url: process.env.DATABASE_URL,
      }
    : {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'insta-clone-1',
      };

module.exports = {
  type: 'postgres',
  ...urlConfig,
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  synchronize: false,
  logging: false,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/*.js'],
  seeds: ['dist/seeds/**/*.js'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers',
  },
};
