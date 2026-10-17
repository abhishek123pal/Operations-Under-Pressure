
declare const process: any; //to fix the  process error
import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL, 
  },
});
