import * as Joi from '@hapi/joi';

export const configSchema = Joi.object({
  // ENV
  ENV: Joi.string().valid('local', 'test', 'prod').required(),
  HOST_PORT: Joi.number().required(),

  // AUTH
  JWT_SECRET_KEY: Joi.string().required(),

  // DB
  DATASOURCE_URL: Joi.string().required(),
  DATASOURCE_PORT: Joi.number().required(),
  DATASOURCE_USERNAME: Joi.string().required(),
  DATASOURCE_PASSWORD: Joi.string().required(),
  DATASOURCE_NAME: Joi.string().required(),
});