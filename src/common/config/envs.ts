// npm i dotenv joi
import 'dotenv/config';
import * as joi from 'joi';

// type LogLevel = 'verbose' | 'debug' | 'log' | 'warn' | 'error' | 'fatal';

enum LogLevel {
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

interface EnvVars {
  // App
  PORT: number;
  NODE_ENV: string;
  API_PREFIX: string;
  LOG_LEVEL: LogLevel;
  CORS_ORIGIN: string;

  // Database
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DATABASE_URL: string;

  // Rate limiting
  RATE_LIMIT_TTL: number;
  RATE_LIMIT_MAX: number;

  // Pagination
  PAGINATION_LIMIT: number;
  PAGINATION_MAX: number;
  PAGINATION_PAGE: number;

  // Business
  TAXES_VALUE: number;
  SERVICE_FEE_VALUE: number;
  DISCOUNT_VALUE: number;
  HOLD_EXPIRATION_MINUTES: number;
  CHECK_IN_TIME: number;
  TICKET_CODE_PREFIX: string;
}

const envsSchema = joi
  .object({
    // App
    PORT: joi.number().required(),
    NODE_ENV: joi.string().default('local'),
    API_PREFIX: joi.string().default('api'),
    LOG_LEVEL: joi
      .string()
      .valid(...Object.values(LogLevel))
      .default(LogLevel.LOG),
    CORS_ORIGIN: joi.string(),

    // Database
    DB_NAME: joi.string().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DATABASE_URL: joi.string().required(),

    // Rate limiting
    RATE_LIMIT_TTL: joi.number().default(60),
    RATE_LIMIT_MAX: joi.number().default(100),

    // Pagination
    PAGINATION_LIMIT: joi.number().required(),
    PAGINATION_MAX: joi.number().required(),
    PAGINATION_PAGE: joi.number().required(),

    // Business
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
  // App
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,
  apiPrefix: envVars.API_PREFIX,
  logLevel: envVars.LOG_LEVEL,
  corsOrigin: envVars.CORS_ORIGIN,

  // Database
  dbName: envVars.DB_NAME,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbUsername: envVars.DB_USERNAME,
  dbPassword: envVars.DB_PASSWORD,
  databaseUrl: envVars.DATABASE_URL,

  // Rate limiting
  rateLimitTtl: envVars.RATE_LIMIT_TTL,
  rateLimitMax: envVars.RATE_LIMIT_MAX,

  // Pagination
  paginationLimit: envVars.PAGINATION_LIMIT,
  paginationMax: envVars.PAGINATION_MAX,
  paginationPage: envVars.PAGINATION_PAGE,

  // Business
  taxesValue: envVars.TAXES_VALUE,
  serviceFeeValue: envVars.SERVICE_FEE_VALUE,
  discountValue: envVars.DISCOUNT_VALUE,
  holdExpirationMinutes: envVars.HOLD_EXPIRATION_MINUTES,
  checkInTime: envVars.CHECK_IN_TIME,
  ticketCodePrefix: envVars.TICKET_CODE_PREFIX,
};
