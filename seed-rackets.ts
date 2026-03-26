import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PRESETS = [
  // Head
  { brand: 'Head', model: 'Speed Pro' },
  { brand: 'Head', model: 'Speed MP' },
  { brand: 'Head', model: 'Radical Pro' },
  { brand: 'Head', model: 'Radical MP' },
  { brand: 'Head', model: 'Prestige Pro' },
  { brand: 'Head', model: 'Prestige MP' },
  { brand: 'Head', model: 'Extreme Pro' },
  { brand: 'Head', model: 'Extreme MP' },
  { brand: 'Head', model: 'Gravity Pro' },
  { brand: 'Head', model: 'Gravity MP' },
  { brand: 'Head', model: 'Boom Pro' },
  { brand: 'Head', model: 'Boom MP' },
  // Wilson
  { brand: 'Wilson', model: 'Pro Staff 97' },
  { brand: 'Wilson', model: 'Blade 98' },
  { brand: 'Wilson', model: 'Blade 104' },
  { brand: 'Wilson', model: 'Clash 100' },
  { brand: 'Wilson', model: 'Clash 98' },
  { brand: 'Wilson', model: 'Ultra 100' },
  { brand: 'Wilson', model: 'Shift 99' },
  // Babolat
  { brand: 'Babolat', model: 'Pure Drive' },
  { brand: 'Babolat', model: 'Pure Aero' },
  { brand: 'Babolat', model: 'Pure Strike' },
  // Yonex
  { brand: 'Yonex', model: 'Ezone 98' },
  { brand: 'Yonex', model: 'Ezone 100' },
  { brand: 'Yonex', model: 'Vcore 98' },
  { brand: 'Yonex', model: 'Vcore 100' },
  { brand: 'Yonex', model: 'Percept 97' },
  // Technifibre
  { brand: 'Tecnifibre', model: 'TFight 305' },
  { brand: 'Tecnifibre', model: 'TF40' },
];

async function main() {
  for (const preset of PRESETS) {
    try {
      await prisma.racketPreset.upsert({
        where: { brand_model: { brand: preset.brand, model: preset.model } },
        update: {},
        create: preset
      });
      console.log(`✅ ${preset.brand} ${preset.model}`);
    } catch(e) {
      console.error(`Error with ${preset.brand}`, e);
    }
  }
  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
