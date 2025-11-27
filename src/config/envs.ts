// npm i dotenv joi
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NODE_ENV: string;

  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DATABASE_URL: string;

  PAGINATION_LIMIT: number;
  PAGINATION_PAGE: number;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NODE_ENV: joi.string().default('local'),

    DB_NAME: joi.string().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DATABASE_URL: joi.string().required(),

    PAGINATION_LIMIT: joi.number().required(),
    PAGINATION_PAGE: joi.number().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
}) as {
  error?: joi.ValidationError;
  value: EnvVars;
};

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars = value;

export const envs = {
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,

  dbName: envVars.DB_NAME,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbUsername: envVars.DB_USERNAME,
  dbPassword: envVars.DB_PASSWORD,
  databaseUrl: envVars.DATABASE_URL,

  paginationLimit: envVars.PAGINATION_LIMIT,
  paginationPage: envVars.PAGINATION_PAGE,
};
