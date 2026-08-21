#!/usr/bin/env node
/**
 * Seed 30 parking slots into Convex for Central Mall Grand
 * Run: node scripts/seed-slots.js
 */
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) { console.error("Missing NEXT_PUBLIC_CONVEX_URL"); process.exit(1); }
const client = new ConvexHttpClient(CONVEX_URL);

const floors = ["B2","B1","G"];
const zones  = ["Zone A","Zone B","Zone C"];
const slots  = [];

floors.forEach((floor,fi) => {
  zones.forEach((zone,zi) => {
    for(let i=1;i<=5;i++){
      const slotId = `${floor.toLowerCase().replace(" ","")}-${zone.replace(/\s/g,"").toLowerCase()}-${String(i).padStart(2,"0")}`;
      const slotNum = `${String.fromCharCode(65+zi)}-${String(i).padStart(2,"0")}`;
      slots.push({
        slotId,
        mallId:"cm-grand",
        mallName:"Central Mall Grand",
        floor,
        zone,
        pillar:`Pillar ${(zi*5+i).toString().padStart(2,"0")}`,
        slotNumber:slotNum,
        status:"available",
        positionX:(i-3)*3.2,
        positionY:0,
        positionZ:(zi-1)*4.5,
        rotationY:0,
        distanceFromEntrance:20+(fi*15)+(zi*10)+(i*3),
        walkingDirections:[
          `Exit Elevator Lobby ${floor}`,
          `Walk ${zi===0?"left":"right"} into ${zone}`,
          `Slot ${slotNum} at Pillar ${(zi*5+i).toString().padStart(2,"0")}`
        ]
      });
    }
  });
});

async function main(){
  console.log(`Inserting ${slots.length} slots...`);
  for(const s of slots){
    try{
      await client.mutation("slots:upsertSlot", s);
      process.stdout.write(".");
    } catch(e){ console.error(`\nFailed ${s.slotId}:`,e.message); }
  }
  console.log(`\nDone! Inserted ${slots.length} slots.`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
