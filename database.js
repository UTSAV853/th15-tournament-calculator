/*
TH15 TOURNAMENT CALCULATOR v4

Tournament equipment caps requested for this calculator:
  Common = Lv15
  Epic   = Lv18

TH15 Home Village Lightning:
  Max TH15 level = Lv10
  Damage = 600
  Radius = 2 tiles

Supercell's TH15 release notes introduced Lightning Spell level 10.
The published current TH15 table lists Lv10 as 600 damage.
*/

const DEFENSES = {
  "Air Defense": {hp:1750, lightning:true},
  "Air Sweeper": {hp:1050, lightning:true},
  "Inferno Tower": {hp:4000, lightning:true},
  "X-Bow": {hp:4400, lightning:true},
  "Monolith": {hp:5050, lightning:true},
  "Scattershot": {hp:5100, lightning:true},
  "Spell Tower": {hp:3100, lightning:true},
  "Eagle Artillery": {hp:5900, lightning:true},
  "Builder's Hut": {hp:1800, lightning:true},
  "Clan Castle": {hp:5400, lightning:false}
};

const GIANT_ARROW = {
  1:750,2:750,3:800,4:800,5:900,6:900,7:1000,8:1000,
  9:1100,10:1100,11:1100,12:1200,13:1200,14:1200,
  15:1350,16:1350,17:1350,18:1500
};

const ROCKET_BACKPACK = {
  1:575,2:575,3:750,4:750,5:750,6:950,7:950,8:950,
  9:1125,10:1125,11:1125,12:1325,13:1325,14:1325,
  15:1500,16:1500,17:1500,18:1700
};

const FIREBALL = {
  1:{damage:1500,radius:4},2:{damage:1500,radius:4},
  3:{damage:1700,radius:4},4:{damage:1700,radius:4},
  5:{damage:1800,radius:4},6:{damage:1950,radius:4},
  7:{damage:1950,radius:4},8:{damage:2050,radius:4},
  9:{damage:2200,radius:5},10:{damage:2200,radius:5},
  11:{damage:2350,radius:5},12:{damage:2650,radius:5},
  13:{damage:2650,radius:5},14:{damage:2750,radius:5},
  15:{damage:3100,radius:5},16:{damage:3100,radius:5},
  17:{damage:3250,radius:5},18:{damage:3400,radius:6}
};

const TOURNAMENT = {common:15, epic:18};
const EARTHQUAKE_PERCENT = 0.29;

const LIGHTNING = {
  level:10,
  damage:600,
  radius:2
};
