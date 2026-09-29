# Image prompts: Emigreren naar Paraguay (`emigreren`), text only

For Anton to run in Higgsfield himself (same settings as the overhaul set: GPT Image 2.5 Sunburst; hero 16:9 high 2k,
tile 4:5 medium 1k, hub 16:9 medium 1k). Nothing here was generated. Record results in `docs/imagery-manifest.json`
with `"set": "nl-2026-10"`.

## Rules (same as `docs/design/image-shotlist-2026-10.md`)

Paraguay is landlocked and flat: no sea, beach, mountains or hills on the horizon. Red earth, mango, palms, yellow
lapacho, colonial and modernist Asunción. No text, letters, signage, logos, flags or watermarks (so no Dutch flags).
No pink, including pink lapacho. No generated face presented as staff, a client or a reviewer (people are shown from
behind, at a distance or as silhouettes). No generated cédula, certificate or office presented as ours. No bicycles.

## Palette and style tail (distinct from the other seven brands)

Cool early-morning light, sage green and warm terracotta, off-white lime-washed walls, weathered wood, a little
deep-green foliage and one yellow lapacho at most. Soft overcast-clear sky, long gentle shadows, quiet and
unhurried. Photographic, natural colour, shallow depth of field, no HDR, no oversaturation.

Append to every prompt: `Cool soft morning light, sage green and warm terracotta palette, lime-washed walls,
red earth, flat horizon, natural photographic look, no text, no letters, no signage, no logos, no flags, no
watermark, no pink, no bicycles, no sea or mountains.`

## Hero (16:9)

### `emigreren-hero-couple-arriving-colonial-house`
- Page: home (`/`), also the source of the 1200x630 OG crop.
- Aspect: 16:9.
- Prompt: A mixed-age couple, a man and a woman in their fifties and sixties, seen from behind and slightly from the
  side at some distance, walking up a red-earth path towards a whitewashed single-storey Paraguayan house with a
  deep terracotta-tiled veranda, a wooden door standing open, sage-green shutters, a mango tree and two royal palms
  in the garden. One carries a small canvas bag, the other a folded linen jacket over the arm. Early morning, cool
  clear light, a little mist on the flat grass, a yellow lapacho in bloom far to one side, empty flat horizon.
  Calm, arrival, no hurry. Faces not visible. [style tail]
- alt nl: Een echtpaar van middelbare leeftijd loopt in de vroege ochtend over een rood zandpad naar een wit huis met veranda en mangoboom.
- alt en: A middle-aged couple walking at dawn along a red-earth path towards a whitewashed house with a veranda and a mango tree.

## Tiles (4:5)

### `emigreren-tile-route-papers-desk`
- Page: `/verblijfsvergunning` and the home route card (route / papers).
- Prompt: Top-down close view of a plain wooden table in morning light: a closed dark passport with no marking, a
  blank cream document folder, a fountain pen, a small glass of water and a sprig of green leaves, on a folded sage
  linen cloth. The papers are blank and unreadable; no official seals or stamps. Terracotta cup at the edge. [style tail]
- alt nl: Een gesloten paspoort, een lege documentenmap en een pen op een houten tafel met een saliegroene linnen doek.
- alt en: A closed passport, a blank document folder and a pen on a wooden table over a sage linen cloth.

### `emigreren-tile-cost-market-basket`
- Page: `/kosten` (cost of living).
- Prompt: A woven basket on a market stall counter holding mangoes, cassava, tomatoes, green peppers and fresh
  bread, beside a small brass hand scale, under a canvas awning in cool morning light. Terracotta pots and sage
  leaves in the background, a flat street of low colonial buildings out of focus. No prices, no signs, no labels. [style tail]
- alt nl: Een mand met mango, cassave, tomaten en brood op een marktkraam in het ochtendlicht.
- alt en: A basket of mangoes, cassava, tomatoes and bread on a market stall in morning light.

### `emigreren-tile-tax-money-desk`
- Page: `/belasting` (tax and money).
- Prompt: A tidy desk by a window: a closed laptop, a plain calculator, a blank ruled notebook with a pencil, a
  cup of black coffee and a small green plant, a terracotta pot in the corner. Cool morning light across the
  desk, out-of-focus red-earth garden and palm outside. No numbers or writing visible on any surface. No person. [style tail]
- alt nl: Een opgeruimd bureau bij een raam met een rekenmachine, een leeg notitieboek en een kop koffie.
- alt en: A tidy desk by a window with a calculator, a blank notebook and a cup of coffee.

### `emigreren-tile-family-garden-morning`
- Page: `/gezin` (family).
- Prompt: A family seen from behind at a distance, two adults and two children of about six and ten, sitting on a
  low veranda step at breakfast, a wooden table with fruit and a thermos for tereré, a large mango tree and red-earth
  yard ahead of them, whitewashed wall and sage shutters. Faces not visible, soft cool morning light, a small dog
  asleep on the terracotta tiles. [style tail]
- alt nl: Een gezin met twee kinderen zit 's ochtends op de veranda voor een tuin met een mangoboom, gezien van achteren.
- alt en: A family with two children seen from behind, having breakfast on a veranda facing a garden with a mango tree.

## Hub images (16:9)

### `emigreren-hub-gidsen-reading-veranda`
- Page: `/gidsen` (guides hub), and the default article hero for guides.
- Prompt: A wooden chair and small table on a shaded veranda in morning light, an open blank-paged book, a
  terracotta mug and a thermos, a sage cushion, a garden of palms and a mango tree beyond, low lime-washed wall.
  No people, nothing written on the pages. [style tail]
- alt nl: Een stoel en tafeltje op een veranda met een opengeslagen leeg boek en een mok, met palmen op de achtergrond.
- alt en: A chair and small table on a veranda with an open blank book and a mug, palms in the background.

### `emigreren-hub-steden-asuncion-street-morning`
- Page: `/steden` (cities hub).
- Prompt: A quiet Asunción street early in the morning, a row of Spanish-colonial facades in off-white and ochre
  with sage shutters beside one low modernist concrete building, lapacho in yellow bloom, wet
  pavement drying in the sun, a few parked cars far off, no people in focus. Flat skyline, no hills, no river view,
  no signage on any building. [style tail]
- alt nl: Een rustige straat in Asunción in de ochtend met koloniale gevels, een modernistisch gebouw en een gele lapachoboom.
- alt en: A quiet Asunción street in the morning with colonial facades, a modernist building and a yellow lapacho tree.

### `emigreren-hub-media-living-room-window`
- Page: the factual media page hub (the article about the TV series, `gidsen`/media). Chosen to show "watching
  vs. living": a calm neutral scene, no screen content and no reference to any programme.
- Prompt: A quiet living room seen through an open window from the veranda: a wooden table with a blank notebook, a
  thermos and a cup, a plain sofa with a sage throw, a dark television screen switched off, and beyond the window
  a red-earth garden with a mango tree and palms in cool morning light. No people, no text on any surface. [style tail]
- alt nl: Een rustige woonkamer met uitzicht op een tuin met palmen en een mangoboom in het ochtendlicht.
- alt en: A quiet living room looking out to a garden with palms and a mango tree in morning light.
