import { seedFirestore } from './seedFirestore';

console.log('🌱 Starting Nexus Syndicate Firestore seeding process...');

seedFirestore()
  .then((result) => {
    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Seeded data summary:`);
    console.log(`   - ${result.factions.length} Factions`);
    console.log(`   - ${result.territories.length} Territories`);
    console.log(`   - ${result.assets.length} Assets`);
    console.log(`   - ${result.missions.length} Missions`);
    console.log(`   - ${result.gameEvents.length} Game Events`);
    process.exit(0);
  })
  .catch((error: Error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
