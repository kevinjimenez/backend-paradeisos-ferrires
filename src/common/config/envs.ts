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

  TAXES_VALUE: number;
  SERVICE_FEE_VALUE: number;
  DISCOUNT_VALUE: number;

  HOLD_EXPIRATION_MINUTES: number;

  CHECK_IN_TIME: number;

  TICKET_CODE_PREFIX: string;
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

    TAXES_VALUE: joi.number().default(0),
    SERVICE_FEE_VALUE: joi.number().default(0),
    DISCOUNT_VALUE: joi.number().default(0),

    HOLD_EXPIRATION_MINUTES: joi.number().default(15),

    CHECK_IN_TIME: joi.number().required(),

    TICKET_CODE_PREFIX: joi.string().default('TKT'),
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

  taxesValue: envVars.TAXES_VALUE,
  serviceFeeValue: envVars.SERVICE_FEE_VALUE,
  discountValue: envVars.DISCOUNT_VALUE,

  holdExpirationMinutes: envVars.HOLD_EXPIRATION_MINUTES,

  checkInTime: envVars.CHECK_IN_TIME,

  ticketCodePrefix: envVars.TICKET_CODE_PREFIX,
};
