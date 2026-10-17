
// declare const process: any; //to fix the  process error
// import 'dotenv/config';
// import { defineConfig } from '@prisma/config';

// export default defineConfig({
//   schema: 'prisma/schema.prisma',
//   datasource: {
//     url: process.env.DATABASE_URL, 
//   },
// });
declare const process: any; // to fix the process error
import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    //seed: 'npx ts-node prisma/seed.ts',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL, 
  },
});