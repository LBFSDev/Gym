import 'dotenv/config';

export default {
  development: {
    client: 'pg',

    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'Ecommerce',
      port: Number(process.env.DB_PORT) || 5432,
    },

    migrations: {
      directory: './src/db/migrations',
    },

    seeds: {
      directory: './src/db/seeds',
    },
  },

  production: {
    client: 'pg',

    connection: {
      host: process.env.DB_HOST ,
      user: process.env.DB_USER ,
      password: process.env.DB_PASSWORD ,
      database: process.env.DB_NAME ,
      port: Number(process.env.DB_PORT) 
    },

    migrations: {
      directory: './src/db/migrations',
    },

    seeds: {
      directory: './src/db/seeds',
    },
  },
};