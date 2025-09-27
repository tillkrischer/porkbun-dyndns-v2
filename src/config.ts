import { z } from 'zod';

const envSchema = z.object({
  DOMAIN: z.string().min(1, "DOMAIN is required"),
  APIKEY: z.string().min(1, "APIKEY is required"),
  SECRETAPIKEY: z.string().min(1, "SECRETAPIKEY is required"),
});


export const config = envSchema.parse(process.env);