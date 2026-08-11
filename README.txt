TH15 TOURNAMENT CALCULATOR v4

CHANGES:
- Added master checkboxes for every equipment/spell:
  Earthquake, Giant Arrow, Rocket Backpack, Fireball, Lightning.
- Unchecked equipment/spell contributes ZERO damage.
- Hit Map columns appear only for equipment/spells that are enabled.
- Equipment level still changes damage.
- Esports mode uses Common Lv15 and Epic Lv18.
- Lightning is fixed to TH15 maximum: Lv10, 600 damage, 2-tile radius.
- Builder's Hut and Clan Castle included.
- Clan Castle Lightning allocation is disabled.
- EQ is applied separately to each defense only when EQ Hit is checked.

TH15 LIGHTNING:
Level 10
Damage 600
Radius 2 tiles

This is the TH15 max Lightning level, not the higher Lightning levels
unlocked at TH16+.

Accuracy:
The calculator does not guess base geometry. Confirm actual hit paths/radii
from the base. Lightning allocation is per defense and does not simulate
the exact multi-building placement of the in-game spell.

Local test:
python -m http.server 8000
Open http://localhost:8000

GitHub Pages:
Replace the previous web files with these files and commit them.
The service-worker cache name is v4.


LIGHTNING COUNT UPDATE:
Lightning is allocated separately per defense.
Example:
  Air Defense   = 2 Lightning
  Inferno Tower = 1 Lightning
  Monolith      = 0 Lightning

The calculator multiplies each defense's individual count by 600 damage.
The total Lightning count is also shown in the result summary.


EARTHQUAKE COUNT UPDATE:
Earthquake is now allocated separately per defense, just like Lightning.

Example:
  Air Defense   = 2 EQ
  Inferno Tower = 3 EQ
  Scattershot   = 1 EQ
  Monolith      = 0 EQ

The calculator uses each defense's own EQ count when calculating its damage.
The global EQ count is no longer used.
