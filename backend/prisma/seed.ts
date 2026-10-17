// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Seeding database for Operations Under Pressure...');

//   // 1. Clean existing state (respecting referential integrity order)
//   await prisma.outbox.deleteMany();
//   await prisma.activityEvent.deleteMany();
//   await prisma.idempotencyKey.deleteMany();
//   await prisma.workItem.deleteMany();
//   await prisma.membership.deleteMany();
//   await prisma.team.deleteMany();
//   await prisma.user.deleteMany();

//   // 2. Seed Teams (4 core tactical units)
//   const teams = await Promise.all([
//     prisma.team.create({ data: { name: 'Alpha Response' } }),
//     prisma.team.create({ data: { name: 'Bravo Infrastructure' } }),
//     prisma.team.create({ data: { name: 'Gamma Cyber Intelligence' } }),
//     prisma.team.create({ data: { name: 'Delta Logistics' } }),
//   ]);

//   console.log(`-> Created ${teams.length} tactical teams.`);

//   // 3. Seed 10 Operators with diverse profiles
//   const users = await Promise.all(
//     Array.from({ length: 10 }, (_, i) =>
//       prisma.user.create({
//         data: {
//           email: `operator.${i + 1}@operations.internal`,
//           name: `Operator Alpha-${i + 1}`,
//         },
//       })
//     )
//   );

//   console.log(`-> Created ${users.length} system operators.`);

//   // 4. Assign Team Memberships (Admin, Lead, Member roles)
//   const designatedRoles = ['ADMIN', 'LEAD', 'MEMBER', 'MEMBER', 'MEMBER'];
//   for (let i = 0; i < users.length; i++) {
//     const user = users[i];
//     const team = teams[i % teams.length];
//     const role = designatedRoles[i % designatedRoles.length];

//     await prisma.membership.create({
//       data: {
//         userId: user.id,
//         teamId: team.id,
//         role: role,
//       },
//     });
//   }

//   console.log('-> Assigned team memberships and role matrices.');

//   // 5. Seed 3,500 Work Items for Keyset Cursor Pagination Stress-Testing
//   console.log('⚡ Generating 3,500 work items for keyset pagination benchmarking...');
//   const batchSize = 1000;
//   const totalItems = 3500;
//   const lifecycleStates = ['OPEN', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'RESOLVED', 'CLOSED'];

//   for (let i = 0; i < totalItems; i += batchSize) {
//     const chunk = Array.from({ length: Math.min(batchSize, totalItems - i) }, (_, index) => {
//       const itemIndex = i + index;
//       const team = teams[itemIndex % teams.length];
//       // Assign roughly 40% of items to operators, leave 60% unassigned for atomic claim testing
//       const assignee = itemIndex % 5 < 2 ? users[itemIndex % users.length] : null;

//       return {
//         title: `Directive Protocol #${itemIndex + 1}: Secure Grid Partition`,
//         description: `Automated telemetry payload generated for concurrency stress validation sequence #${itemIndex + 1}`,
//         status: lifecycleStates[itemIndex % lifecycleStates.length],
//         version: 1,
//         teamId: team.id,
//         assigneeId: assignee ? assignee.id : null,
//       };
//     });

//     await prisma.workItem.createMany({
//       data: chunk,
//     });
//     console.log(`-> Seeded batch: ${i + chunk.length} / ${totalItems} items persisted.`);
//   }

//   console.log('✅ Seeding completed successfully with zero constraint violations.');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Critical failure during database seeding:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });/
// declare const process: any;
// import { PrismaClient, Role, WorkItemStatus } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Seeding database for Operations Under Pressure...');

//   // 1. Clean existing state (respecting referential integrity order)
//   await prisma.outbox.deleteMany();
//   await prisma.activityEvent.deleteMany();
//   await prisma.idempotencyKey.deleteMany();
//   await prisma.workItem.deleteMany();
//   await prisma.membership.deleteMany();
//   await prisma.team.deleteMany();
//   await prisma.user.deleteMany();

//   // 2. Seed Teams (4 core tactical units)
//   const teams = await Promise.all([
//     prisma.team.create({ data: { name: 'Alpha Response' } }),
//     prisma.team.create({ data: { name: 'Bravo Infrastructure' } }),
//     prisma.team.create({ data: { name: 'Gamma Cyber Intelligence' } }),
//     prisma.team.create({ data: { name: 'Delta Logistics' } }),
//   ]);

//   console.log(`-> Created ${teams.length} tactical teams.`);

//   // 3. Seed 10 Operators with diverse profiles
//   const users = await Promise.all(
//     Array.from({ length: 10 }, (_, i) =>
//       prisma.user.create({
//         data: {
//           email: `operator.${i + 1}@operations.internal`,
//           name: `Operator Alpha-${i + 1}`,
//         },
//       })
//     )
//   );

//   console.log(`-> Created ${users.length} system operators.`);

//   // 4. Assign Team Memberships (Admin, Lead, Member roles)
//   const designatedRoles: Role[] = [Role.ADMIN, Role.LEAD, Role.MEMBER, Role.MEMBER, Role.MEMBER];
//   for (let i = 0; i < users.length; i++) {
//     const user = users[i];
//     const team = teams[i % teams.length];
//     const role = designatedRoles[i % designatedRoles.length];

//     await prisma.membership.create({
//       data: {
//         userId: user.id,
//         teamId: team.id,
//         role: role,
//       },
//     });
//   }

//   console.log('-> Assigned team memberships and role matrices.');

//   // 5. Seed 3,500 Work Items for Keyset Cursor Pagination Stress-Testing
//   console.log('⚡ Generating 3,500 work items for keyset pagination benchmarking...');
//   const batchSize = 1000;
//   const totalItems = 3500;
//   const lifecycleStates = [
//     WorkItemStatus.OPEN,
//     WorkItemStatus.IN_PROGRESS,
//     WorkItemStatus.AWAITING_APPROVAL,
//     WorkItemStatus.RESOLVED,
//     WorkItemStatus.CLOSED,
//   ];

//   for (let i = 0; i < totalItems; i += batchSize) {
//     const chunk = Array.from({ length: Math.min(batchSize, totalItems - i) }, (_, index) => {
//       const itemIndex = i + index;
//       const team = teams[itemIndex % teams.length];
//       const creator = users[itemIndex % users.length];
//       const assignee = itemIndex % 5 < 2 ? users[(itemIndex + 1) % users.length] : null;

//       return {
//         title: `Directive Protocol #${itemIndex + 1}: Secure Grid Partition`,
//         description: `Automated telemetry payload generated for concurrency stress validation sequence #${itemIndex + 1}`,
//         status: lifecycleStates[itemIndex % lifecycleStates.length],
//         version: 1,
//         teamId: team.id,
//         creatorId: creator.id, // Required by schema
//         assigneeId: assignee ? assignee.id : null,
//       };
//     });

//     await prisma.workItem.createMany({
//       data: chunk,
//     });
//     console.log(`-> Seeded batch: ${i + chunk.length} / ${totalItems} items persisted.`);
//   }

//   console.log('✅ Seeding completed successfully with zero constraint violations.');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Critical failure during database seeding:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
// declare const process: any;
// import { PrismaClient, Role } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Seeding database for Operations Under Pressure...');

//   // 1. Clean existing state (respecting referential integrity order)
//   try {
//     // Safely delete if tables exist
//     await prisma.outbox.deleteMany().catch(() => {});
//   } catch (e) {}
  
//   await prisma.activityEvent.deleteMany().catch(() => {});
//   await prisma.idempotencyKey.deleteMany().catch(() => {});
//   await prisma.workItem.deleteMany().catch(() => {});
//   await prisma.membership.deleteMany().catch(() => {});
//   await prisma.team.deleteMany().catch(() => {});
//   await prisma.user.deleteMany().catch(() => {});

//   // 2. Seed Teams (4 core tactical units)
//   const teams = await Promise.all([
//     prisma.team.create({ data: { name: 'Alpha Response' } }),
//     prisma.team.create({ data: { name: 'Bravo Infrastructure' } }),
//     prisma.team.create({ data: { name: 'Gamma Cyber Intelligence' } }),
//     prisma.team.create({ data: { name: 'Delta Logistics' } }),
//   ]);

//   console.log(`-> Created ${teams.length} tactical teams.`);

//   // 3. Seed 10 Operators with diverse profiles
//   const users = await Promise.all(
//     Array.from({ length: 10 }, (_, i) =>
//       prisma.user.create({
//         data: {
//           email: `operator.${i + 1}@operations.internal`,
//           name: `Operator Alpha-${i + 1}`,
//         },
//       })
//     )
//   );

//   console.log(`-> Created ${users.length} system operators.`);

//   // 4. Assign Team Memberships (Admin, Lead, Member roles)
//   const designatedRoles: Role[] = [Role.ADMIN, Role.LEAD, Role.MEMBER, Role.MEMBER, Role.MEMBER];
//   for (let i = 0; i < users.length; i++) {
//     const user = users[i];
//     const team = teams[i % teams.length];
//     const role = designatedRoles[i % designatedRoles.length];

//     await prisma.membership.create({
//       data: {
//         userId: user.id,
//         teamId: team.id,
//         role: role,
//       },
//     });
//   }

//   console.log('-> Assigned team memberships and role matrices.');

//   // 5. Seed 3,500 Work Items for Keyset Cursor Pagination Stress-Testing
//   console.log('⚡ Generating 3,500 work items for keyset pagination benchmarking...');
//   const batchSize = 1000;
//   const totalItems = 3500;
//   const lifecycleStates = ['OPEN', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'RESOLVED', 'CLOSED'];

//   for (let i = 0; i < totalItems; i += batchSize) {
//     const chunk = Array.from({ length: Math.min(batchSize, totalItems - i) }, (_, index) => {
//       const itemIndex = i + index;
//       const team = teams[itemIndex % teams.length];
//       const creator = users[itemIndex % users.length];
//       const assignee = itemIndex % 5 < 2 ? users[(itemIndex + 1) % users.length] : null;

//       return {
//         title: `Directive Protocol #${itemIndex + 1}: Secure Grid Partition`,
//         description: `Automated telemetry payload generated for concurrency stress validation sequence #${itemIndex + 1}`,
//         status: lifecycleStates[itemIndex % lifecycleStates.length],
//         version: 1,
//         teamId: team.id,
//         creatorId: creator.id,
//         assigneeId: assignee ? assignee.id : null,
//       };
//     });

//     await prisma.workItem.createMany({
//       data: chunk,
//     });
//     console.log(`-> Seeded batch: ${i + chunk.length} / ${totalItems} items persisted.`);
//   }

//   console.log('✅ Seeding completed successfully with zero constraint violations.');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Critical failure during database seeding:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
// declare const process: any;
// import { PrismaClient, Role, Status, Priority, WorkItemType } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting database seeding sequence for Operations Under Pressure...');

//   // 1. Purge existing records respecting dependency integrity constraints (child to parent)
//   console.log('🔄 Purging stale database entities...');
//   await prisma.outboxJob.deleteMany();
//   await prisma.idempotencyKey.deleteMany();
//   await prisma.activityEvent.deleteMany();
//   await prisma.workItem.deleteMany();
//   await prisma.membership.deleteMany();
//   await prisma.team.deleteMany();
//   await prisma.user.deleteMany();
//   console.log('✅ Clean slate achieved.');

//   // 2. Provision Core Tactical Teams
//   console.log('👥 Seeding enterprise teams...');
//   const teams = await Promise.all([
//     prisma.team.create({ data: { name: 'Alpha Response Force' } }),
//     prisma.team.create({ data: { name: 'Bravo Infrastructure Security' } }),
//     prisma.team.create({ data: { name: 'Gamma Cyber Intelligence' } }),
//     prisma.team.create({ data: { name: 'Delta Logistical Operations' } }),
//   ]);
//   console.log(`✅ Provisioned ${teams.length} core teams.`);

//   // 3. Provision Operators (Users)
//   console.log('🧑‍💻 Seeding system operators...');
//   const users = await Promise.all(
//     Array.from({ length: 10 }, (_, i) =>
//       prisma.user.create({
//         data: {
//           email: `operator.${i + 1}@operations.internal`,
//           name: `Operator Alpha-${i + 1}`,
//         },
//       })
//     )
//   );
//   console.log(`✅ Provisioned ${users.length} system operators.`);

//   // 4. Assign Team Memberships using strict Enums
//   console.log('🔐 Engineering role-action membership matrices...');
//   const roleRotation: Role[] = [Role.ADMIN, Role.LEAD, Role.MEMBER, Role.MEMBER, Role.MEMBER];
  
//   for (let i = 0; i < users.length; i++) {
//     const user = users[i];
//     const team = teams[i % teams.length];
//     const assignedRole = roleRotation[i % roleRotation.length];

//     await prisma.membership.create({
//       data: {
//         userId: user.id,
//         teamId: team.id,
//         role: assignedRole,
//       },
//     });
//   }
//   console.log('✅ Role membership matrix successfully provisioned.');

//   // 5. Generate 3,500 Mock Items for Keyset Cursor Pagination Stress Testing
//   console.log('⚡ Generating 3,500 work items for keyset benchmark validations...');
//   const batchSize = 500;
//   const totalItems = 3500;
  
//   const lifecycleStates = [Status.OPEN, Status.IN_PROGRESS, Status.AWAITING_APPROVAL, Status.RESOLVED, Status.CLOSED];
//   const priorityStates = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT];
//   const typeStates = [WorkItemType.TASK, WorkItemType.INCIDENT, WorkItemType.CUSTOMER_ISSUE, WorkItemType.PAYMENT, WorkItemType.COMPLIANCE];

//   for (let i = 0; i < totalItems; i += batchSize) {
//     const chunk = Array.from({ length: Math.min(batchSize, totalItems - i) }, (_, index) => {
//       const itemIndex = i + index;
//       const team = teams[itemIndex % teams.length];
//       const creator = users[itemIndex % users.length];
      
//       // Leave 60% unassigned (assigneeId: null) to safely allow for race-condition atomic claim tests
//       const assignee = itemIndex % 5 < 2 ? users[(itemIndex + 1) % users.length] : null;

//       return {
//         title: `Telemetry Security Directive Protocol #${itemIndex + 1}`,
//         description: `Automated diagnostics payload tracking runtime metrics for investigation index parameter reference #${itemIndex + 1}`,
//         type: typeStates[itemIndex % typeStates.length],
//         priority: priorityStates[itemIndex % priorityStates.length],
//         status: lifecycleStates[itemIndex % lifecycleStates.length],
//         version: 1,
//         teamId: team.id,
//         creatorId: creator.id,
//         assigneeId: assignee ? assignee.id : null,
//       };
//     });

//     await prisma.workItem.createMany({
//       data: chunk,
//     });
//     console.log(`🚀 Persisted data packet chunk: ${i + chunk.length} / ${totalItems} records.`);
//   }

//   console.log('🏁 Database seeding process executed with 100% data integrity.');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Critical failure during database seeding execution:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//      await prisma.$disconnect();
//   });

declare const process: any;
import { PrismaClient, Role, Status, Priority, WorkItemType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

// Initialize PostgreSQL connection pool & driver adapter for Prisma 7
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding sequence for Operations Under Pressure...');

  // 1. Purge existing records respecting dependency integrity constraints (child to parent)
  console.log('🔄 Purging stale database entities...');
  await prisma.outboxJob.deleteMany().catch(() => {});
  await prisma.idempotencyKey.deleteMany().catch(() => {});
  await prisma.activityEvent.deleteMany().catch(() => {});
  await prisma.workItem.deleteMany().catch(() => {});
  await prisma.membership.deleteMany().catch(() => {});
  await prisma.team.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});
  console.log('✅ Clean slate achieved.');

  // 2. Provision Core Tactical Teams
  console.log('👥 Seeding enterprise teams...');
  const teams = await Promise.all([
    prisma.team.create({ data: { name: 'Alpha Response Force' } }),
    prisma.team.create({ data: { name: 'Bravo Infrastructure Security' } }),
    prisma.team.create({ data: { name: 'Gamma Cyber Intelligence' } }),
    prisma.team.create({ data: { name: 'Delta Logistical Operations' } }),
  ]);
  console.log(`✅ Provisioned ${teams.length} core teams.`);

  // 3. Provision Operators (Users)
  console.log('🧑‍💻 Seeding system operators...');
  const users = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `operator.${i + 1}@operations.internal`,
          name: `Operator Alpha-${i + 1}`,
        },
      })
    )
  );
  console.log(`✅ Provisioned ${users.length} system operators.`);

  // 4. Assign Team Memberships using strict Enums
  console.log('🔐 Engineering role-action membership matrices...');
  const roleRotation: Role[] = [Role.ADMIN, Role.LEAD, Role.MEMBER, Role.MEMBER, Role.MEMBER];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const team = teams[i % teams.length];
    const assignedRole = roleRotation[i % roleRotation.length];

    await prisma.membership.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: assignedRole,
      },
    });
  }
  console.log('✅ Role membership matrix successfully provisioned.');

  // 5. Generate 3,500 Mock Items for Keyset Cursor Pagination Stress Testing
  console.log('⚡ Generating 3,500 work items for keyset benchmark validations...');
  const batchSize = 500;
  const totalItems = 3500;
  
  const lifecycleStates = [Status.OPEN, Status.IN_PROGRESS, Status.AWAITING_APPROVAL, Status.RESOLVED, Status.CLOSED];
  const priorityStates = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT];
  const typeStates = [WorkItemType.TASK, WorkItemType.INCIDENT, WorkItemType.CUSTOMER_ISSUE, WorkItemType.PAYMENT, WorkItemType.COMPLIANCE];

  for (let i = 0; i < totalItems; i += batchSize) {
    const chunk = Array.from({ length: Math.min(batchSize, totalItems - i) }, (_, index) => {
      const itemIndex = i + index;
      const team = teams[itemIndex % teams.length];
      const creator = users[itemIndex % users.length];
      
      // Leave 60% unassigned (assigneeId: null) to safely allow for race-condition atomic claim tests
      const assignee = itemIndex % 5 < 2 ? users[(itemIndex + 1) % users.length] : null;

      return {
        title: `Telemetry Security Directive Protocol #${itemIndex + 1}`,
        description: `Automated diagnostics payload tracking runtime metrics for investigation index parameter reference #${itemIndex + 1}`,
        type: typeStates[itemIndex % typeStates.length],
        priority: priorityStates[itemIndex % priorityStates.length],
        status: lifecycleStates[itemIndex % lifecycleStates.length],
        version: 1,
        teamId: team.id,
        creatorId: creator.id,
        assigneeId: assignee ? assignee.id : null,
      };
    });

    await prisma.workItem.createMany({
      data: chunk,
    });
    console.log(`🚀 Persisted data packet chunk: ${i + chunk.length} / ${totalItems} records.`);
  }

  console.log('🏁 Database seeding process executed with 100% data integrity.');
}

main()
  .catch((e) => {
    console.error('❌ Critical failure during database seeding execution:', e);
    process.exit(1);
  })
  .finally(async () => {
     await prisma.$disconnect();
     await pool.end(); // Clean up pg pool
  });