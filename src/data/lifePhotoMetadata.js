const makeImageSrc = (index) =>
    `/images/beyond-work/life/Life-${String(index).padStart(2, "0")}.jpg`;
  
  export const lifePhotoMetadata = [
    {
      id: "life_01",
      fileName: "Life-01.jpg",
      imageSrc: makeImageSrc(1),
      title: "Volcano-like office architecture",
      visualSummary:
        "Berlin office exterior architecture with a volcano-like form contrasted against rectangular structures behind it.",
      userContext:
        "Berlin office exterior; noticed the contrast in form, color, and spatial layering.",
      attentionType: "architecture / contrast",
      cluster: "architecture_spatial_observation",
      motifs: ["volcano-like form", "rectangular contrast", "urban structure", "color contrast"],
      emotionalTone: ["observational", "structural", "calm"],
      personalMeaning:
        "A moment of noticing spatial contrast in an everyday work environment.",
      tags: ["berlin", "office", "architecture", "contrast", "urban-form"],
      queryHooks: ["architecture I noticed", "Berlin office surroundings", "shape and color contrast"],
    },
    {
      id: "life_02",
      fileName: "Life-02.jpg",
      imageSrc: makeImageSrc(2),
      title: "Gesture blessing prototype",
      visualSummary:
        "A hand reaching toward a glowing digital object on a screen.",
      userContext:
        "Gemini gesture interaction experiment: each hand grab returns a personalized belief-energy blessing.",
      attentionType: "AI interaction / prototype",
      cluster: "ai_interaction_experiments",
      motifs: ["hand gesture", "screen glow", "human-machine contact", "digital ritual"],
      emotionalTone: ["experimental", "curious", "magical"],
      personalMeaning:
        "An early interaction experiment connecting gesture, AI, belief, and emotional feedback.",
      tags: ["gemini", "gesture", "AI", "prototype", "blessing", "interaction"],
      queryHooks: ["AI interaction experiments", "gesture-based prototype", "belief and blessing interface"],
    },
    {
      id: "life_03",
      fileName: "Life-03.jpg",
      imageSrc: makeImageSrc(3),
      title: "Copenhagen museum installation",
      visualSummary:
        "A museum installation with strong form, light, shadow, and background contrast.",
      userContext:
        "Installation in a Copenhagen museum; noticed its form, light-shadow relation, and contrast with the background.",
      attentionType: "installation / light-form",
      cluster: "art_exhibition_visual_culture",
      motifs: ["light", "shadow", "transparency", "circular form", "spatial contrast"],
      emotionalTone: ["quiet", "aesthetic", "precise"],
      personalMeaning:
        "A visual reference for how object, light, and background can create atmosphere.",
      tags: ["copenhagen", "museum", "installation", "light", "shadow"],
      queryHooks: ["museum installations I liked", "light and shadow objects", "visual inspiration from Copenhagen"],
    },
    {
      id: "life_04",
      fileName: "Life-04.jpg",
      imageSrc: makeImageSrc(4),
      title: "Designed snowman",
      visualSummary:
        "A small snowman-like figure with a red accent standing on winter pavement.",
      userContext:
        "Captured during heavy snow in winter 2025; felt unusually designed and charming.",
      attentionType: "small being / found design",
      cluster: "small_beings_urban_finds",
      motifs: ["snow", "small figure", "red scarf", "temporary sculpture", "street design"],
      emotionalTone: ["playful", "tender", "slightly lonely"],
      personalMeaning:
        "A small designed presence appearing unexpectedly in ordinary winter life.",
      tags: ["snowman", "winter-2025", "found-object", "small-being", "street"],
      queryHooks: ["small beings I noticed", "winter street discoveries", "objects that looked alive"],
    },
    {
      id: "life_05",
      fileName: "Life-05.jpg",
      imageSrc: makeImageSrc(5),
      title: "Friendly roadside sheep",
      visualSummary:
        "Close-up of a sheep by the roadside, calm and unafraid.",
      userContext:
        "Roadside sheep in a good mood, not afraid of people.",
      attentionType: "animal encounter",
      cluster: "animal_presence",
      motifs: ["animal face", "soft texture", "direct presence", "roadside encounter"],
      emotionalTone: ["warm", "light", "open"],
      personalMeaning:
        "A small moment of relaxed contact with non-human presence.",
      tags: ["sheep", "animal", "roadside", "friendly", "encounter"],
      queryHooks: ["friendly animal encounters", "animals that felt open", "calm animal photos"],
    },
    {
      id: "life_06",
      fileName: "Life-06.jpg",
      imageSrc: makeImageSrc(6),
      title: "Manchester hanging sculpture",
      visualSummary:
        "A human-like suspended sculpture hanging from the ceiling inside an art museum.",
      userContext:
        "A ceiling-hung sculpture in an art museum in Manchester.",
      attentionType: "body inside structure",
      cluster: "art_exhibition_visual_culture",
      motifs: ["suspension", "human figure", "ceiling", "museum space", "scale"],
      emotionalTone: ["uncanny", "still", "restrained"],
      personalMeaning:
        "A staged body or form inside institutional space; connected to systems, suspension, and scale.",
      tags: ["manchester", "museum", "sculpture", "hanging", "body-in-space"],
      queryHooks: ["suspended artworks", "museum bodies inside structures", "Manchester museum memory"],
    },
    {
      id: "life_07",
      fileName: "Life-07.jpg",
      imageSrc: makeImageSrc(7),
      title: "Xi'an New Year local food",
      visualSummary:
        "A traditional Xi'an soup or noodle-based dish with regional ingredients.",
      userContext:
        "Returning to Xi'an for New Year and eating local food; possibly 水盆羊肉 or 葫芦头.",
      attentionType: "food / homecoming",
      cluster: "food_ritual_sensory_memory",
      motifs: ["broth", "local food", "homecoming", "regional taste"],
      emotionalTone: ["grounded", "warm", "familial"],
      personalMeaning:
        "Food as a marker of return, place, and New Year atmosphere.",
      tags: ["xian", "new-year", "local-food", "homecoming", "traditional-food"],
      queryHooks: ["food from home", "Xi'an New Year memories", "traditional local dishes"],
    },
    {
      id: "life_08",
      fileName: "Life-08.jpg",
      imageSrc: makeImageSrc(8),
      title: "New Year fish",
      visualSummary:
        "A cooked fish dish prepared for a New Year meal.",
      userContext:
        "Fish cooked by uncle for New Year; culturally connected to 年年有余, auspicious abundance.",
      attentionType: "food / cultural symbol",
      cluster: "food_ritual_sensory_memory",
      motifs: ["fish", "family meal", "New Year", "abundance", "auspicious symbol"],
      emotionalTone: ["familial", "ritual", "warm"],
      personalMeaning:
        "A family dish carrying cultural blessing and symbolic continuity.",
      tags: ["fish", "new-year", "family", "年年有余", "abundance"],
      queryHooks: ["symbolic food photos", "New Year family dishes", "food with cultural meaning"],
    },
    {
      id: "life_09",
      fileName: "Life-09.jpg",
      imageSrc: makeImageSrc(9),
      title: "Poisonous Lanzarote jellyfish",
      visualSummary:
        "A blue-purple jellyfish-like sea creature found on stones by the sea.",
      userContext:
        "A poisonous jellyfish discovered by the sea in Lanzarote.",
      attentionType: "strange natural form",
      cluster: "strange_nature_edge",
      motifs: ["jellyfish", "poison", "sea edge", "fragility", "alien beauty"],
      emotionalTone: ["curious", "alert", "delicate"],
      personalMeaning:
        "Beauty and danger appearing together in a fragile natural form.",
      tags: ["lanzarote", "jellyfish", "poisonous", "sea", "strange-organism"],
      queryHooks: ["strange natural discoveries", "beautiful but dangerous organisms", "Lanzarote sea memory"],
    },
    {
      id: "life_10",
      fileName: "Life-10.jpg",
      imageSrc: makeImageSrc(10),
      title: "Mushroom varieties",
      visualSummary:
        "Different edible mushrooms with varied shapes and textures.",
      userContext:
        "Different delicious mushroom varieties.",
      attentionType: "food texture / organic form",
      cluster: "food_ritual_sensory_memory",
      motifs: ["mushrooms", "organic repetition", "texture", "ingredient variety"],
      emotionalTone: ["earthy", "tactile", "curious"],
      personalMeaning:
        "Attention to edible forms, variety, and organic texture.",
      tags: ["mushrooms", "food", "texture", "ingredients", "organic-form"],
      queryHooks: ["food textures", "organic forms I noticed", "ingredient photos"],
    },
    {
      id: "life_11",
      fileName: "Life-11.jpg",
      imageSrc: makeImageSrc(11),
      title: "Urban alpaca",
      visualSummary:
        "An alpaca kept in or near a city shop with a pink bowl.",
      userContext:
        "A city shop alpaca, seemingly enclosed or kept in the urban commercial setting.",
      attentionType: "animal in urban system",
      cluster: "animal_presence",
      motifs: ["alpaca", "shop", "pink bowl", "urban captivity", "odd juxtaposition"],
      emotionalTone: ["strange", "soft", "slightly uncomfortable"],
      personalMeaning:
        "An animal placed inside a human commercial system; cute but also odd.",
      tags: ["alpaca", "city", "shop", "animal", "captivity"],
      queryHooks: ["animals in urban settings", "things that felt out of place", "odd city encounters"],
    },
    {
      id: "life_12",
      fileName: "Life-12.jpg",
      imageSrc: makeImageSrc(12),
      title: "Kraftwerk — We Felt a Star Dying",
      visualSummary:
        "A dark immersive industrial exhibition space with large-scale installation atmosphere.",
      userContext:
        "Berlin Kraftwerk exhibition 'We Felt a Star Dying', involving AI, sound, and quantum entanglement.",
      attentionType: "AI / sound / immersive system",
      cluster: "ai_interaction_experiments",
      motifs: ["Kraftwerk", "dark space", "AI", "sound", "quantum entanglement", "industrial atmosphere"],
      emotionalTone: ["immersive", "intense", "speculative"],
      personalMeaning:
        "A cultural reference connecting AI, sensory experience, science, and system atmosphere.",
      tags: ["berlin", "kraftwerk", "AI", "sound", "quantum", "installation"],
      queryHooks: ["AI-related exhibitions", "immersive tech art", "sound and system experiences"],
    },
    {
      id: "life_13",
      fileName: "Life-13.jpg",
      imageSrc: makeImageSrc(13),
      title: "Paris marshmallow traffic light",
      visualSummary:
        "A traffic light altered with a humorous sticker illustration.",
      userContext:
        "Paris street traffic light with an illustration of a robbed marshmallow.",
      attentionType: "urban graphic intervention",
      cluster: "small_beings_urban_finds",
      motifs: ["traffic light", "sticker", "illustration", "public sign", "urban humor"],
      emotionalTone: ["playful", "graphic", "unexpected"],
      personalMeaning:
        "A rigid city object softened by narrative and humor.",
      tags: ["paris", "traffic-light", "sticker", "illustration", "street-art"],
      queryHooks: ["street graphic interventions", "Paris details", "funny altered public signs"],
    },
    {
      id: "life_14",
      fileName: "Life-14.jpg",
      imageSrc: makeImageSrc(14),
      title: "Paris fashion brand shoot",
      visualSummary:
        "People gathered in an interior setting during a creative shoot.",
      userContext:
        "Helping photograph a friend's fashion brand in Paris.",
      attentionType: "creative collaboration",
      cluster: "human_scene_creative_work",
      motifs: ["fashion", "friend", "photography", "brand", "behind the scenes"],
      emotionalTone: ["social", "creative", "collaborative"],
      personalMeaning:
        "A working friendship moment around visual production and brand building.",
      tags: ["paris", "fashion", "photography", "friend", "brand-shoot"],
      queryHooks: ["creative collaborations", "fashion photography moments", "Paris work memories"],
    },
    {
      id: "life_15",
      fileName: "Life-15.jpg",
      imageSrc: makeImageSrc(15),
      title: "3D-printed blue cat",
      visualSummary:
        "A small blue 3D-printed cat attached to a street railing.",
      userContext:
        "A small blue cat someone stuck on a roadside railing.",
      attentionType: "small being / urban found object",
      cluster: "small_beings_urban_finds",
      motifs: ["blue cat", "3D print", "railing", "street intervention", "tiny character"],
      emotionalTone: ["playful", "curious", "tender"],
      personalMeaning:
        "A small artificial creature inserted into the city, carrying personality.",
      tags: ["blue-cat", "3d-print", "railing", "street", "found-object"],
      queryHooks: ["tiny objects in the city", "small beings I found", "street objects with personality"],
    },
    {
      id: "life_16",
      fileName: "Life-16.jpg",
      imageSrc: makeImageSrc(16),
      title: "Women in tech event",
      visualSummary:
        "A tech or community event setting with audience and presentation.",
      userContext:
        "Attending a women in tech event.",
      attentionType: "professional community",
      cluster: "ai_interaction_experiments",
      motifs: ["women in tech", "talk", "community", "networking", "audience"],
      emotionalTone: ["professional", "social", "attentive"],
      personalMeaning:
        "Participation in a professional community and tech discourse space.",
      tags: ["women-in-tech", "event", "community", "networking", "talk"],
      queryHooks: ["tech community events", "women in tech moments", "professional gatherings"],
    },
    {
      id: "life_17",
      fileName: "Life-17.jpg",
      imageSrc: makeImageSrc(17),
      title: "Calm pigeon",
      visualSummary:
        "A pigeon standing calmly against an open sky or outdoor background.",
      userContext:
        "A very calm pigeon.",
      attentionType: "animal presence",
      cluster: "animal_presence",
      motifs: ["pigeon", "stillness", "calm animal", "simple composition"],
      emotionalTone: ["calm", "unbothered", "light"],
      personalMeaning:
        "A small animal presence with unusual composure.",
      tags: ["pigeon", "calm", "animal", "stillness", "quiet"],
      queryHooks: ["calm animal photos", "quiet animal moments", "unbothered presence"],
    },
    {
      id: "life_18",
      fileName: "Life-18.jpg",
      imageSrc: makeImageSrc(18),
      title: "Vivid seafood forms",
      visualSummary:
        "Brightly colored seafood or fish close-up with strong organic form and texture.",
      userContext:
        "Colorful seafood noticed for its vivid color and shape.",
      attentionType: "food texture / organic form",
      cluster: "food_ritual_sensory_memory",
      motifs: ["seafood", "red color", "organic texture", "marine form", "biological form"],
      emotionalTone: ["sensory", "vivid", "direct"],
      personalMeaning:
        "Attention to food as material, color, and biological form.",
      tags: ["seafood", "color", "texture", "organic", "food"],
      queryHooks: ["vivid food textures", "seafood forms", "colorful organic closeups"],
    },
    {
      id: "life_19",
      fileName: "Life-19.jpg",
      imageSrc: makeImageSrc(19),
      title: "Exhibition graphic",
      visualSummary:
        "A graphic piece or poster-like visual inside an exhibition.",
      userContext:
        "Graphic work seen in an exhibition.",
      attentionType: "graphic design / exhibition",
      cluster: "art_exhibition_visual_culture",
      motifs: ["graphic", "poster", "exhibition text", "visual language"],
      emotionalTone: ["observational", "design-aware"],
      personalMeaning:
        "Saved as a reference for exhibition graphic language.",
      tags: ["graphic", "exhibition", "poster", "design"],
      queryHooks: ["graphic inspiration from exhibitions", "poster-like exhibition objects", "visual culture references"],
    },
    {
      id: "life_20",
      fileName: "Life-20.jpg",
      imageSrc: makeImageSrc(20),
      title: "Spider sculpture",
      visualSummary:
        "A large dark spider-like sculpture with long legs standing against an architectural background.",
      userContext:
        "The famous spider sculpture captured as an iconic art and architecture moment.",
      attentionType: "iconic sculpture",
      cluster: "art_exhibition_visual_culture",
      motifs: ["spider", "large sculpture", "long legs", "iconic artwork", "scale"],
      emotionalTone: ["monumental", "uncanny", "recognizable"],
      personalMeaning:
        "An iconic artwork registered through scale, body, and cultural recognition.",
      tags: ["spider", "sculpture", "iconic-art", "scale"],
      queryHooks: ["iconic sculptures", "famous spider artwork", "large artworks I photographed"],
    },
    {
      id: "life_21",
      fileName: "Life-21.jpg",
      imageSrc: makeImageSrc(21),
      title: "Geometric pool architecture",
      visualSummary:
        "A geometric outdoor pool or water-courtyard space with pale green water, beige stone, and structured garden surroundings.",
      userContext:
        "Architecture / designed outdoor space; noticed the geometry, water color, and spatial order.",
      attentionType: "architecture / designed landscape",
      cluster: "architecture_spatial_observation",
      motifs: ["pool", "green water", "geometric layout", "stone", "designed landscape"],
      emotionalTone: ["calm", "ordered", "sunlit"],
      personalMeaning:
        "A spatial composition where water, architecture, and geometry create a quiet designed atmosphere.",
      tags: ["architecture", "pool", "water", "geometry", "designed-space"],
      queryHooks: ["architectural water spaces", "geometric pool architecture", "designed outdoor spaces"],
    },
    {
      id: "life_22",
      fileName: "Life-22.jpg",
      imageSrc: makeImageSrc(22),
      title: "Yellow light installation",
      visualSummary:
        "A yellow linear light installation or spatial light work inside an exhibition-like environment.",
      userContext:
        "A spatial light installation noticed for its bright linear structure and atmospheric presence.",
      attentionType: "light installation / spatial graphic",
      cluster: "art_exhibition_visual_culture",
      motifs: ["yellow light", "linear form", "installation", "spatial drawing", "glow"],
      emotionalTone: ["electric", "spatial", "immersive"],
      personalMeaning:
        "A light-based spatial moment where lines, movement, and atmosphere become the main subject.",
      tags: ["light", "yellow", "installation", "exhibition", "spatial"],
      queryHooks: ["light installations", "yellow spatial lines", "exhibition light works"],
    },
    {
      id: "life_23",
      fileName: "Life-23.jpg",
      imageSrc: makeImageSrc(23),
      title: "Green cat wall graphic",
      visualSummary:
        "A simple green cat-like drawing or graphic mark on a wall or poster surface.",
      userContext:
        "A wall graphic or urban mark with a cat-like form.",
      attentionType: "urban graphic mark",
      cluster: "small_beings_urban_finds",
      motifs: ["green cat", "wall drawing", "graphic mark", "urban sign", "small character"],
      emotionalTone: ["playful", "minimal", "unexpected"],
      personalMeaning:
        "A small graphic presence in the city that behaves like a tiny character or sign.",
      tags: ["cat", "green", "graphic", "wall", "urban-mark"],
      queryHooks: ["small graphic marks", "cat-like urban drawings", "street graphics with personality"],
    },
    {
      id: "life_24",
      fileName: "Life-24.jpg",
      imageSrc: makeImageSrc(24),
      title: "Pink architectural building",
      visualSummary:
        "A pink architectural building or courtyard-like exterior with clean geometry.",
      userContext:
        "Architecture noticed through color, flat surfaces, and spatial composition.",
      attentionType: "architecture / color structure",
      cluster: "architecture_spatial_observation",
      motifs: ["pink building", "courtyard", "flat facade", "geometry", "color field"],
      emotionalTone: ["quiet", "designed", "sunlit"],
      personalMeaning:
        "A building remembered through color, proportion, and calm spatial order.",
      tags: ["architecture", "pink", "building", "courtyard", "color"],
      queryHooks: ["pink architecture", "colorful buildings", "quiet architectural spaces"],
    },
    {
      id: "life_25",
      fileName: "Life-25.jpg",
      imageSrc: makeImageSrc(25),
      title: "Green building facade",
      visualSummary:
        "A green building facade with exterior stairs or structural layers.",
      userContext:
        "Architecture noticed through color, stairs, and facade structure.",
      attentionType: "architecture / facade",
      cluster: "architecture_spatial_observation",
      motifs: ["green facade", "stairs", "building layers", "urban structure"],
      emotionalTone: ["curious", "graphic", "observational"],
      personalMeaning:
        "A city structure noticed through color and exposed circulation.",
      tags: ["architecture", "green", "facade", "stairs", "building"],
      queryHooks: ["green architecture", "facade structures", "buildings with external stairs"],
    },
    {
      id: "life_26",
      fileName: "Life-26.jpg",
      imageSrc: makeImageSrc(26),
      title: "Red bridge structure",
      visualSummary:
        "A bridge or large red structural element viewed from below or at an angle.",
      userContext:
        "Architecture or infrastructure observation from the photo sequence.",
      attentionType: "infrastructure / structure",
      cluster: "architecture_spatial_observation",
      motifs: ["bridge", "red structure", "engineering", "angle", "scale"],
      emotionalTone: ["bold", "structural", "dynamic"],
      personalMeaning:
        "Attention to engineered form and strong color in public space.",
      tags: ["bridge", "red", "infrastructure", "architecture", "structure"],
      queryHooks: ["bridges I photographed", "red architectural structures", "infrastructure forms"],
    },
    {
      id: "life_27",
      fileName: "Life-27.jpg",
      imageSrc: makeImageSrc(27),
      title: "Green volcanic pool",
      visualSummary:
        "A volcanic or coastal landscape with a bright green pool or lagoon.",
      userContext:
        "Lanzarote volcanic landscape memory with strange green water.",
      attentionType: "landscape / strange nature",
      cluster: "strange_nature_edge",
      motifs: ["green water", "volcanic land", "coast", "mineral color", "edge"],
      emotionalTone: ["otherworldly", "open", "quiet"],
      personalMeaning:
        "A landscape where color makes nature feel almost artificial.",
      tags: ["lanzarote", "volcanic", "green-water", "landscape", "coast"],
      queryHooks: ["strange landscapes", "green volcanic pools", "nature that looks unreal"],
    },
    {
      id: "life_28",
      fileName: "Life-28.jpg",
      imageSrc: makeImageSrc(28),
      title: "Group conversation at event",
      visualSummary:
        "A group of women in conversation at an event or professional setting.",
      userContext:
        "Human or professional scene from the photo archive.",
      attentionType: "human scene / exchange",
      cluster: "human_scene_creative_work",
      motifs: ["conversation", "women", "event", "exchange", "professional space"],
      emotionalTone: ["social", "attentive", "engaged"],
      personalMeaning:
        "A captured moment of people exchanging ideas or presence.",
      tags: ["event", "conversation", "women", "professional", "community"],
      queryHooks: ["people in conversation", "professional event photos", "community moments"],
    },
    {
      id: "life_29",
      fileName: "Life-29.jpg",
      imageSrc: makeImageSrc(29),
      title: "Women at booth",
      visualSummary:
        "Women standing and talking around a booth, table, or display area.",
      userContext:
        "Event or exhibition-related human scene.",
      attentionType: "human scene / presentation",
      cluster: "human_scene_creative_work",
      motifs: ["booth", "conversation", "presentation", "people", "display"],
      emotionalTone: ["professional", "observational", "social"],
      personalMeaning:
        "A moment of social-professional interaction and presentation.",
      tags: ["event", "booth", "people", "conversation", "display"],
      queryHooks: ["event booth moments", "women in professional spaces", "presentation scenes"],
    },
    {
      id: "life_30",
      fileName: "Life-30.jpg",
      imageSrc: makeImageSrc(30),
      title: "Conference talk",
      visualSummary:
        "A presentation or talk projected in a room with audience seating.",
      userContext:
        "Conference or women in tech event context.",
      attentionType: "professional event",
      cluster: "ai_interaction_experiments",
      motifs: ["screen", "audience", "talk", "conference", "presentation", "women in tech"],
      emotionalTone: ["professional", "attentive"],
      personalMeaning:
        "A documented learning or networking environment.",
      tags: ["conference", "talk", "presentation", "audience", "event", "women-in-tech"],
      queryHooks: ["conference photos", "talks I attended", "professional learning spaces"],
    },
    {
      id: "life_31",
      fileName: "Life-31.jpg",
      imageSrc: makeImageSrc(31),
      title: "Green toy creature",
      visualSummary:
        "A small green toy-like creature placed on a metallic surface.",
      userContext:
        "Small object or visual find from the archive.",
      attentionType: "small being / toy-like object",
      cluster: "small_beings_urban_finds",
      motifs: ["green creature", "toy", "metal surface", "small presence", "playfulness"],
      emotionalTone: ["cute", "playful", "slightly absurd"],
      personalMeaning:
        "A tiny character-like object carrying presence through minimal form.",
      tags: ["green-toy", "small-being", "creature", "playful", "object"],
      queryHooks: ["small toy-like beings", "objects that look alive", "playful small things"],
    },
    {
      id: "life_32",
      fileName: "Life-32.jpg",
      imageSrc: makeImageSrc(32),
      title: "Night city view",
      visualSummary:
        "A cityscape at night viewed from a distance.",
      userContext:
        "Night urban view from the archive.",
      attentionType: "city atmosphere",
      cluster: "architecture_spatial_observation",
      motifs: ["night lights", "city", "distance", "darkness", "urban horizon"],
      emotionalTone: ["quiet", "distant", "reflective"],
      personalMeaning:
        "A night view that records distance, city scale, and atmosphere.",
      tags: ["night", "city", "lights", "distance", "urban"],
      queryHooks: ["night city photos", "urban distance", "city atmosphere at night"],
    },
    {
      id: "life_33",
      fileName: "Life-33.jpg",
      imageSrc: makeImageSrc(33),
      title: "Small figure with orange sphere",
      visualSummary:
        "A tiny figure standing near or pushing a large orange spherical object.",
      userContext:
        "Small figure and oversized object with strong visual contrast.",
      attentionType: "small being / scale contrast",
      cluster: "small_beings_urban_finds",
      motifs: ["tiny figure", "orange sphere", "scale contrast", "play", "surreal object"],
      emotionalTone: ["whimsical", "absurd", "curious"],
      personalMeaning:
        "A strong small-versus-large image, almost like a miniature story.",
      tags: ["orange-sphere", "small-figure", "scale", "playful", "surreal"],
      queryHooks: ["small beings with large objects", "surreal scale photos", "playful visual contrasts"],
    },
    {
      id: "life_34",
      fileName: "Life-34.jpg",
      imageSrc: makeImageSrc(34),
      title: "White sculptural courtyard",
      visualSummary:
        "A white outdoor courtyard or garden with sculptural landscaping and round forms.",
      userContext:
        "Architecture or spatial atmosphere from the archive.",
      attentionType: "architecture / designed landscape",
      cluster: "architecture_spatial_observation",
      motifs: ["white walls", "garden", "round forms", "designed space", "courtyard"],
      emotionalTone: ["calm", "designed", "clean"],
      personalMeaning:
        "A spatial composition where architecture and landscape feel curated.",
      tags: ["garden", "white", "architecture", "courtyard", "landscape"],
      queryHooks: ["designed outdoor spaces", "white architectural gardens", "calm spatial compositions"],
    },
    {
      id: "life_35",
      fileName: "Life-35.jpg",
      imageSrc: makeImageSrc(35),
      title: "White deer",
      visualSummary:
        "A pale or white deer standing in a grassy area.",
      userContext:
        "Animal encounter from the archive.",
      attentionType: "animal encounter",
      cluster: "animal_presence",
      motifs: ["white deer", "grass", "stillness", "rare animal presence"],
      emotionalTone: ["quiet", "gentle", "slightly magical"],
      personalMeaning:
        "A calm animal image with a rare, almost symbolic quality.",
      tags: ["deer", "white-deer", "animal", "grass", "stillness"],
      queryHooks: ["rare animal encounters", "quiet animal photos", "animals that felt symbolic"],
    },
    {
      id: "life_36",
      fileName: "Life-36.jpg",
      imageSrc: makeImageSrc(36),
      title: "Orange tulips",
      visualSummary:
        "Orange tulips standing against a simple outdoor background.",
      userContext:
        "Flower or nature detail from the archive.",
      attentionType: "nature detail / color",
      cluster: "strange_nature_edge",
      motifs: ["orange flowers", "tulips", "green stems", "color accent"],
      emotionalTone: ["fresh", "simple", "alive"],
      personalMeaning:
        "A small color signal from nature.",
      tags: ["tulips", "orange", "flowers", "nature", "color"],
      queryHooks: ["flower photos", "orange color moments", "small nature details"],
    },
    {
      id: "life_37",
      fileName: "Life-37.jpg",
      imageSrc: makeImageSrc(37),
      title: "Cloud over city",
      visualSummary:
        "A warm-toned cloud above a dark city silhouette.",
      userContext:
        "Sky and city atmosphere from the archive.",
      attentionType: "sky / atmosphere",
      cluster: "architecture_spatial_observation",
      motifs: ["cloud", "sunset light", "city silhouette", "sky", "distance"],
      emotionalTone: ["soft", "distant", "melancholic"],
      personalMeaning:
        "A quiet sky moment above the city, more atmosphere than event.",
      tags: ["cloud", "sky", "city", "sunset", "atmosphere"],
      queryHooks: ["cloud photos", "city sky moments", "soft atmosphere images"],
    },
    {
      id: "life_38",
      fileName: "Life-38.jpg",
      imageSrc: makeImageSrc(38),
      title: "Gothic church interior",
      visualSummary:
        "A gothic or church interior with arches, stained-glass-like light, and vertical structure.",
      userContext:
        "Historical or sacred architectural space from the archive.",
      attentionType: "sacred architecture / interior",
      cluster: "architecture_spatial_observation",
      motifs: ["arches", "gothic", "interior", "vertical structure", "sacred space"],
      emotionalTone: ["reverent", "quiet", "historical"],
      personalMeaning:
        "A space where architecture carries ritual and historical atmosphere.",
      tags: ["gothic", "church", "interior", "architecture", "sacred"],
      queryHooks: ["sacred architecture", "gothic interiors", "historical spaces I photographed"],
    },
    {
      id: "life_39",
      fileName: "Life-39.jpg",
      imageSrc: makeImageSrc(39),
      title: "Garden table courtyard",
      visualSummary:
        "A garden or courtyard table scene with plants and objects.",
      userContext:
        "Quiet garden or courtyard atmosphere from the archive.",
      attentionType: "lived space / courtyard",
      cluster: "architecture_spatial_observation",
      motifs: ["garden", "table", "plants", "courtyard", "domestic outdoor space"],
      emotionalTone: ["quiet", "slow", "slightly nostalgic"],
      personalMeaning:
        "A lived-in outdoor space that feels paused and atmospheric.",
      tags: ["garden", "courtyard", "table", "plants", "atmosphere"],
      queryHooks: ["quiet courtyard photos", "lived outdoor spaces", "garden tables"],
    },
    {
      id: "life_40",
      fileName: "Life-40.jpg",
      imageSrc: makeImageSrc(40),
      title: "Small animal on gravel",
      visualSummary:
        "A small animal standing on gravel.",
      userContext:
        "Small animal observation from the archive.",
      attentionType: "animal encounter",
      cluster: "animal_presence",
      motifs: ["small animal", "gravel", "ground-level view", "quiet presence"],
      emotionalTone: ["small", "quiet", "observational"],
      personalMeaning:
        "Another small non-human presence noticed at ground level.",
      tags: ["animal", "small-animal", "gravel", "ground", "quiet"],
      queryHooks: ["small animal observations", "ground-level animal photos", "quiet non-human presence"],
    },
    {
      id: "life_41",
      fileName: "Life-41.jpg",
      imageSrc: makeImageSrc(41),
      title: "Black volcanic coastline",
      visualSummary:
        "A dark volcanic coastline with waves and cliff-like terrain.",
      userContext:
        "Lanzarote or volcanic coastal landscape.",
      attentionType: "landscape / edge",
      cluster: "strange_nature_edge",
      motifs: ["black coast", "waves", "volcanic rock", "shoreline", "edge"],
      emotionalTone: ["vast", "raw", "elemental"],
      personalMeaning:
        "A landscape where land, sea, and geological force meet.",
      tags: ["coast", "volcanic", "waves", "black-rock", "lanzarote"],
      queryHooks: ["volcanic coastline", "sea edge photos", "raw landscapes"],
    },
    {
      id: "life_42",
      fileName: "Life-42.jpg",
      imageSrc: makeImageSrc(42),
      title: "Orange spiral structure",
      visualSummary:
        "A large orange spiral architectural or sculptural structure.",
      userContext:
        "Spatial or architectural form from the archive.",
      attentionType: "architecture / sculptural form",
      cluster: "architecture_spatial_observation",
      motifs: ["orange", "spiral", "curve", "scale", "architectural object"],
      emotionalTone: ["warm", "designed", "spatial"],
      personalMeaning:
        "A strong formal object defined by curve, color, and movement.",
      tags: ["orange", "spiral", "architecture", "sculptural", "curve"],
      queryHooks: ["spiral structures", "orange architectural forms", "curved spatial objects"],
    },
    {
      id: "life_43",
      fileName: "Life-43.jpg",
      imageSrc: makeImageSrc(43),
      title: "Balcony sculpture facade",
      visualSummary:
        "A building facade with a sculptural or decorative figure near a balcony.",
      userContext:
        "Architectural or street detail from the archive.",
      attentionType: "architecture / facade detail",
      cluster: "architecture_spatial_observation",
      motifs: ["balcony", "sculpture", "facade", "street detail", "vertical wall"],
      emotionalTone: ["curious", "observational", "historical"],
      personalMeaning:
        "A facade detail where architecture and figure merge.",
      tags: ["facade", "balcony", "sculpture", "architecture", "street-detail"],
      queryHooks: ["facade details", "architecture with figures", "street architectural observations"],
    },
    {
      id: "life_44",
      fileName: "Life-44.jpg",
      imageSrc: makeImageSrc(44),
      title: "Large wall artwork",
      visualSummary:
        "A person standing near a large wall artwork or mural-like surface.",
      userContext:
        "Exhibition or public artwork from the archive.",
      attentionType: "artwork / scale relation",
      cluster: "art_exhibition_visual_culture",
      motifs: ["large wall", "person for scale", "abstract surface", "exhibition"],
      emotionalTone: ["quiet", "spatial", "observational"],
      personalMeaning:
        "A human figure used as scale against a large visual surface.",
      tags: ["wall-art", "mural", "person", "scale", "exhibition"],
      queryHooks: ["large artworks with people", "art and scale", "wall-based exhibition photos"],
    },
    {
      id: "life_45",
      fileName: "Life-45.jpg",
      imageSrc: makeImageSrc(45),
      title: "Guggenheim exterior",
      visualSummary:
        "A sculptural iconic architectural exterior with metallic or stone-like curved surfaces.",
      userContext:
        "Guggenheim or iconic architectural exterior.",
      attentionType: "architecture / landmark",
      cluster: "architecture_spatial_observation",
      motifs: ["iconic building", "curved surface", "museum architecture", "landmark", "exterior"],
      emotionalTone: ["monumental", "bright", "spatial"],
      personalMeaning:
        "A landmark architecture image registered through form, surface, and recognition.",
      tags: ["guggenheim", "architecture", "museum", "landmark", "exterior"],
      queryHooks: ["iconic museum architecture", "Guggenheim exterior", "landmark buildings"],
    },
    {
      id: "life_46",
      fileName: "Life-46.jpg",
      imageSrc: makeImageSrc(46),
      title: "Plated egg and meat dish",
      visualSummary:
        "A plated dish with egg, meat, greens, and warm restaurant lighting.",
      userContext:
        "Food image from the archive.",
      attentionType: "food / sensory anchor",
      cluster: "food_ritual_sensory_memory",
      motifs: ["egg", "meat", "greens", "plate", "warm food"],
      emotionalTone: ["sensory", "warm", "direct"],
      personalMeaning:
        "A food memory anchored by color, texture, and plating.",
      tags: ["food", "egg", "meat", "greens", "plate"],
      queryHooks: ["plated food", "warm food memories", "food color and texture"],
    },
    {
      id: "life_47",
      fileName: "Life-47.jpg",
      imageSrc: makeImageSrc(47),
      title: "Rocky volcanic terrain",
      visualSummary:
        "A dark rocky mountain or volcanic slope landscape.",
      userContext:
        "Rocky natural landscape from the archive.",
      attentionType: "landscape / geology",
      cluster: "strange_nature_edge",
      motifs: ["rocks", "slope", "dark terrain", "geology", "vastness"],
      emotionalTone: ["stark", "distant", "raw"],
      personalMeaning:
        "A terrain image focused on raw material and geological force.",
      tags: ["rock", "mountain", "volcanic", "landscape", "terrain"],
      queryHooks: ["rocky landscapes", "geological texture", "raw terrain photos"],
    },
    {
      id: "life_48",
      fileName: "Life-48.jpg",
      imageSrc: makeImageSrc(48),
      title: "Octopus dish",
      visualSummary:
        "A plate with octopus or seafood, strong organic texture and shape.",
      userContext:
        "Seafood dish from the archive.",
      attentionType: "food texture / marine form",
      cluster: "food_ritual_sensory_memory",
      motifs: ["octopus", "seafood", "tentacles", "plate", "texture"],
      emotionalTone: ["sensory", "visceral", "curious"],
      personalMeaning:
        "Food registered through biological form and tactile texture.",
      tags: ["octopus", "seafood", "food", "texture", "marine"],
      queryHooks: ["seafood textures", "octopus dish", "food as organic form"],
    },
    {
      id: "life_49",
      fileName: "Life-49.jpg",
      imageSrc: makeImageSrc(49),
      title: "Theatre interior",
      visualSummary:
        "A dark theatre or opera-like interior with balconies and warm lights.",
      userContext:
        "Historical performance-space interior from the archive.",
      attentionType: "cultural architecture / interior",
      cluster: "architecture_spatial_observation",
      motifs: ["theatre", "balcony", "dark interior", "warm light", "ornament"],
      emotionalTone: ["dramatic", "historical", "contained"],
      personalMeaning:
        "A cultural space where architecture frames spectatorship and ritual.",
      tags: ["theatre", "interior", "balcony", "architecture", "performance-space"],
      queryHooks: ["theatre interiors", "cultural architecture", "historical interior spaces"],
    },
    {
      id: "life_50",
      fileName: "Life-50.jpg",
      imageSrc: makeImageSrc(50),
      title: "White cheese or dessert plate",
      visualSummary:
        "A plated white cheese or dessert-like food item with garnish.",
      userContext:
        "Food image from the archive.",
      attentionType: "food / sensory anchor",
      cluster: "food_ritual_sensory_memory",
      motifs: ["white texture", "plate", "garnish", "soft food", "small dish"],
      emotionalTone: ["soft", "sensory", "delicate"],
      personalMeaning:
        "A small food memory centered on texture and visual softness.",
      tags: ["food", "white-texture", "plate", "dessert", "sensory"],
      queryHooks: ["delicate food photos", "white textured food", "small plated dishes"],
    },
  ];
