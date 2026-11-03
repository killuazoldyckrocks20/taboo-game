/**
 * TABOO GAME - MASTER CARD DATABASE
 * 320+ High Quality, Diverse, Authentic Taboo Cards across 6 Categories
 * Each card contains:
 * - word: The target word to guess
 * - taboo: 5 forbidden words that CANNOT be spoken
 * - category: Category name
 * - difficulty: 'easy', 'medium', 'hard'
 */

const DEFAULT_CARDS = [
  // ==========================================
  // CATEGORY 1: EVERYDAY OBJECTS & LIFE (60 Cards)
  // ==========================================
  {
    word: "UMBRELLA",
    taboo: ["RAIN", "WATER", "WET", "WEATHER", "PROTECT"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "MICROWAVE",
    taboo: ["HEAT", "FOOD", "KITCHEN", "OVEN", "WARM"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "TOOTHBRUSH",
    taboo: ["TEETH", "PASTE", "BRUSH", "MOUTH", "CLEAN"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "REFRIGERATOR",
    taboo: ["COLD", "FOOD", "ICE", "FREEZER", "KITCHEN"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "SUNGLASSES",
    taboo: ["EYES", "SUN", "SHADE", "WEAR", "DARK"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "ALARM CLOCK",
    taboo: ["WAKE", "MORNING", "SLEEP", "TIME", "RING"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "PILLOW",
    taboo: ["SLEEP", "BED", "HEAD", "SOFT", "BLANKET"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "BACKPACK",
    taboo: ["SCHOOL", "BAG", "CARRY", "BOOKS", "SHOULDERS"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "MIRROR",
    taboo: ["REFLECTION", "LOOK", "GLASS", "FACE", "WALL"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "WALLET",
    taboo: ["MONEY", "CASH", "CARDS", "LEATHER", "POCKET"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "SCISSORS",
    taboo: ["CUT", "PAPER", "BLADES", "SHEARS", "SHARP"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "HEADPHONES",
    taboo: ["MUSIC", "EARS", "LISTEN", "AUDIO", "SOUND"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "KEYBOARD",
    taboo: ["TYPE", "KEYS", "COMPUTER", "LETTERS", "DESK"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "SOAP",
    taboo: ["WASH", "CLEAN", "HANDS", "BUBBLES", "SHOWER"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "ELEVATOR",
    taboo: ["FLOORS", "LIFT", "BUTTON", "BUILDING", "STAIRS"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "FLASHLIGHT",
    taboo: ["LIGHT", "BATTERY", "DARK", "BEAM", "TORCH"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "SHAMPOO",
    taboo: ["HAIR", "WASH", "BATH", "BOTTLE", "CONDITIONER"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "CALENDAR",
    taboo: ["DATE", "MONTH", "YEAR", "DAYS", "SCHEDULE"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "ENVELOPE",
    taboo: ["LETTER", "MAIL", "STAMP", "SEAL", "POST"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "CHAIR",
    taboo: ["SIT", "FURNITURE", "LEGS", "TABLE", "WOOD"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "VACUUM CLEANER",
    taboo: ["CARPET", "SUCK", "DUST", "CLEAN", "FLOOR"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "THERMOMETER",
    taboo: ["TEMPERATURE", "FEVER", "HOT", "COLD", "MERCURY"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "SHOE HORN",
    taboo: ["FOOT", "HEEL", "LEATHER", "SLIP", "PUT ON"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "STAPLER",
    taboo: ["PAPER", "FASTEN", "OFFICE", "METAL", "BIND"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "SHOWER CURTAIN",
    taboo: ["BATH", "WATER", "PLASTIC", "ROD", "RINGS"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "LIGHT BULB",
    taboo: ["LAMP", "ELECTRIC", "BRIGHT", "CEILING", "ILLUMINATE"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "COASTER",
    taboo: ["DRINK", "TABLE", "CUP", "GLASS", "RING"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "THERMOS",
    taboo: ["WARM", "HOT", "COFFEE", "SOUP", "INSULATED"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "IRONING BOARD",
    taboo: ["CLOTHES", "WRINKLE", "FLAT", "STEAM", "SHIRT"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "DOORBELL",
    taboo: ["RING", "CHIME", "VISITOR", "FRONT", "KNOCK"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "HAMMOCK",
    taboo: ["TREES", "SWING", "NAP", "SLEEP", "NET"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "BOOKMARK",
    taboo: ["PAGE", "READ", "NOVEL", "PAPER", "CORNER"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "FIRE EXTINGUISHER",
    taboo: ["FLAME", "EMERGENCY", "FOAM", "RED", "SMOKE"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "CANDLE",
    taboo: ["WAX", "WICK", "LIGHT", "FLAME", "SCENT"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "PASSPORT",
    taboo: ["TRAVEL", "AIRPORT", "COUNTRY", "CITIZEN", "BORDER"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "BAND-AID",
    taboo: ["CUT", "BLEED", "STICK", "WOUND", "INJURY"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "SEWING NEEDLE",
    taboo: ["THREAD", "STITCH", "CLOTH", "HOLE", "SHARP"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "MATCHSTICK",
    taboo: ["STRIKE", "FIRE", "WOOD", "BOX", "SULFUR"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "TOILET PAPER",
    taboo: ["ROLL", "BATHROOM", "WIPE", "SHEETS", "HOLDER"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "LAWN MOWER",
    taboo: ["GRASS", "CUT", "YARD", "GARDEN", "BLADE"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "HOURGLASS",
    taboo: ["SAND", "TIME", "GLASS", "RUN OUT", "MINUTE"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "CORKSCREW",
    taboo: ["WINE", "BOTTLE", "OPENER", "SPIRAL", "PULL"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "ZIPPER",
    taboo: ["JACKET", "TEETH", "PANTS", "CLOSE", "FASTEN"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "SUNDIAL",
    taboo: ["SHADOW", "TIME", "SUN", "CLOCK", "ANCIENT"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "PEDOMETER",
    taboo: ["STEPS", "WALK", "DISTANCE", "FITNESS", "COUNT"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "BICYCLE PUMP",
    taboo: ["TIRE", "AIR", "FLAT", "VALVE", "PRESSURE"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "LINT ROLLER",
    taboo: ["CLOTHES", "STICKY", "HAIR", "PET", "FUZZ"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "TRIPOD",
    taboo: ["CAMERA", "THREE", "LEGS", "STAND", "PHOTO"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "KALEIDOSCOPE",
    taboo: ["COLORS", "MIRRORS", "PATTERN", "LOOK", "TUBE"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "SHOE LACES",
    taboo: ["TIE", "KNOT", "SNEAKERS", "HOLES", "BOW"],
    category: "Everyday Objects",
    difficulty: "hard"
  },

  // ==========================================
  // CATEGORY 2: FOOD, DRINK & COOKING (55 Cards)
  // ==========================================
  {
    word: "PIZZA",
    taboo: ["CHEESE", "CRUST", "ITALIAN", "PEPPERONI", "SLICE"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "ICE CREAM",
    taboo: ["COLD", "CONE", "SWEET", "SCOOP", "VANILLA"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "CHOCOLATE",
    taboo: ["SWEET", "COCOA", "CANDY", "DARK", "MILK"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "COFFEE",
    taboo: ["CAFFEINE", "DRINK", "MORNING", "CUP", "STARBUCKS"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "BURGER",
    taboo: ["PATTY", "BUN", "BEEF", "FAST FOOD", "FRIES"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "PANCAKES",
    taboo: ["SYRUP", "BREAKFAST", "BATTER", "FLIP", "STACK"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "SUSHI",
    taboo: ["FISH", "RICE", "ROLL", "JAPANESE", "RAW"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "POPCORN",
    taboo: ["MOVIE", "CORN", "BUTTER", "KERNEL", "BOWL"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "SPAGHETTI",
    taboo: ["PASTA", "NOODLES", "SAUCE", "ITALIAN", "MEATBALLS"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "WATERMELON",
    taboo: ["SUMMER", "SEEDS", "FRUIT", "RED", "GREEN"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "HONEY",
    taboo: ["BEES", "SWEET", "BEAR", "STICKY", "JAR"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "CHEESECAKE",
    taboo: ["DESSERT", "CRUST", "SLICED", "GRAHAM", "BAKED"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "TACO",
    taboo: ["MEXICAN", "SHELL", "SALSA", "BEEF", "CRUNCHY"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "FRENCH FRIES",
    taboo: ["POTATO", "KETCHUP", "SALT", "FAST FOOD", "CRISPY"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "DONUT",
    taboo: ["HOLE", "GLAZED", "SWEET", "COFFEE", "ROUND"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "LEMONADE",
    taboo: ["DRINK", "SOUR", "SUGAR", "CITRUS", "SUMMER"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "GUACAMOLE",
    taboo: ["AVOCADO", "CHIPS", "MEXICAN", "GREEN", "DIP"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "WAFFLE",
    taboo: ["BREAKFAST", "SYRUP", "SQUARES", "IRON", "BATTER"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "CROISSANT",
    taboo: ["FRENCH", "BUTTERY", "PASTRY", "BAKERY", "CRESCENT"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "BAGEL",
    taboo: ["CREAM CHEESE", "ROUND", "TOASTED", "BREAD", "HOLE"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "CINNAMON ROLL",
    taboo: ["ICING", "SPICE", "SWIRL", "SWEET", "BUN"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "MARSHMALLOW",
    taboo: ["CAMPFIRE", "WHITE", "S'MORES", "PUFFY", "ROAST"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "ESPRESSO",
    taboo: ["SHOT", "CAFFEINE", "TINY", "STRONG", "CUP"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "BARBECUE",
    taboo: ["GRILL", "MEAT", "SMOKE", "SAUCE", "RIBS"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "LASAGNA",
    taboo: ["LAYERS", "CHEESE", "PASTA", "MEAT", "OVEN"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "SMOOTHIE",
    taboo: ["BLENDER", "FRUIT", "DRINK", "STRAW", "YOGURT"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "HOT DOG",
    taboo: ["BUN", "MUSTARD", "RELISH", "SAUSAGE", "BALLPARK"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "HUMMUS",
    taboo: ["CHICKPEAS", "PITA", "DIP", "MEDITERRANEAN", "TAHINI"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "COTTON CANDY",
    taboo: ["CARNIVAL", "PINK", "SUGAR", "SPUN", "STICK"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "OATMEAL",
    taboo: ["BREAKFAST", "BOWL", "HOT", "PORRIDGE", "GRAIN"],
    category: "Food & Drinks",
    difficulty: "medium"
  },
  {
    word: "TIRAMISU",
    taboo: ["COFFEE", "ITALIAN", "LADYFINGERS", "DESSERT", "COCOA"],
    category: "Food & Drinks",
    difficulty: "hard"
  },
  {
    word: "FONDUE",
    taboo: ["MELTED", "CHEESE", "POT", "DIP", "SWISS"],
    category: "Food & Drinks",
    difficulty: "hard"
  },
  {
    word: "SOUFFLE",
    taboo: ["RISE", "BAKE", "EGGS", "PUFFY", "COLLAPSE"],
    category: "Food & Drinks",
    difficulty: "hard"
  },
  {
    word: "WASABI",
    taboo: ["SPICY", "GREEN", "SUSHI", "NOSE", "HORSERADISH"],
    category: "Food & Drinks",
    difficulty: "hard"
  },
  {
    word: "KOMBUCHA",
    taboo: ["FERMENTED", "TEA", "PROBIOTIC", "FIZZY", "SCOBY"],
    category: "Food & Drinks",
    difficulty: "hard"
  },
  {
    word: "CARAMEL",
    taboo: ["SUGAR", "BROWN", "STICKY", "CANDY", "SWEET"],
    category: "Food & Drinks",
    difficulty: "hard"
  },
  {
    word: "RAMEN",
    taboo: ["NOODLES", "BROTH", "JAPANESE", "BOWL", "EGG"],
    category: "Food & Drinks",
    difficulty: "hard"
  },
  {
    word: "SOURDOUGH",
    taboo: ["BREAD", "STARTER", "CRUST", "FERMENT", "BAKE"],
    category: "Food & Drinks",
    difficulty: "hard"
  },

  // ==========================================
  // CATEGORY 3: POP CULTURE, MOVIES & MUSIC (55 Cards)
  // ==========================================
  {
    word: "TITANIC",
    taboo: ["SHIP", "ICEBERG", "SINK", "DICAPRIO", "JACK"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "BATMAN",
    taboo: ["JOKER", "GOTHAM", "DARK KNIGHT", "ROBIN", "HERO"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "HARRY POTTER",
    taboo: ["WIZARD", "HOGWARTS", "MAGIC", "WAND", "SCAR"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "MICKEY MOUSE",
    taboo: ["DISNEY", "EARS", "MINNIE", "CARTOON", "ANIMAL"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "NETFLIX",
    taboo: ["STREAMING", "SHOWS", "MOVIES", "CHILL", "WATCH"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "STAR WARS",
    taboo: ["JEDI", "VADER", "FORCE", "LIGHTSABER", "GALAXY"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "TAYLOR SWIFT",
    taboo: ["SINGER", "ERAS TOUR", "POP", "ALBUM", "SONGS"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "SUPER MARIO",
    taboo: ["NINTENDO", "LUIGI", "PLUMBER", "MUSHROOM", "PEACH"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "SPIDER-MAN",
    taboo: ["WEB", "PETER PARKER", "MARVEL", "SUIT", "BITE"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "POKEMON",
    taboo: ["PIKACHU", "CATCH", "MONSTERS", "BALL", "ANIME"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "DISNEYLAND",
    taboo: ["CASTLE", "PARK", "RIDES", "MAGIC", "MICKEY"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "MINECRAFT",
    taboo: ["BLOCKS", "CREEPER", "BUILD", "DIG", "GAME"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "BARBIE",
    taboo: ["DOLL", "PINK", "KEN", "MATTEL", "MOVIE"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "AVENGERS",
    taboo: ["MARVEL", "IRON MAN", "THANOS", "HEROES", "CAPTAIN"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "TIKTOK",
    taboo: ["VIDEO", "DANCE", "APP", "VIRAL", "SCROLL"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "KARAOKE",
    taboo: ["SING", "MICROPHONE", "LYRICS", "SCREEN", "BAR"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "OSCAR",
    taboo: ["AWARD", "ACADEMY", "STATUE", "HOLLYWOOD", "GOLD"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "SHREK",
    taboo: ["OGRE", "GREEN", "DONKEY", "SWAMP", "FIONA"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "SPOTIFY",
    taboo: ["MUSIC", "PLAYLIST", "STREAM", "SONGS", "GREEN"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "GAME OF THRONES",
    taboo: ["DRAGON", "WINTER", "IRON", "STARK", "HBO"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "YOUTUBE",
    taboo: ["VIDEOS", "SUBSCRIBE", "CHANNEL", "CREATOR", "WATCH"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "GRAMMY",
    taboo: ["MUSIC", "AWARD", "TROPHY", "SINGER", "RECORD"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "THE MATRIX",
    taboo: ["NEO", "PILL", "RED", "BLUE", "KEANU"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "FRIENDS",
    taboo: ["SHOW", "SITCOM", "COFFEE", "CENTRAL PERK", "ROSS"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "LION KING",
    taboo: ["SIMBA", "MUFASA", "DISNEY", "AFRICA", "SCAR"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "LEGO",
    taboo: ["BRICKS", "BUILD", "TOY", "PLASTIC", "STEP ON"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "JURASSIC PARK",
    taboo: ["DINOSAUR", "T-REX", "ISLAND", "FOSSIL", "CLONE"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "FORTNITE",
    taboo: ["BATTLE ROYALE", "V-BUCKS", "SKIN", "EMOTE", "BUS"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "STRANGER THINGS",
    taboo: ["ELEVEN", "UPSIDE DOWN", "HAWKINS", "NETFLIX", "MONSTER"],
    category: "Pop Culture & Movies",
    difficulty: "hard"
  },
  {
    word: "INCEPTION",
    taboo: ["DREAM", "SPINNING", "TOP", "DICAPRIO", "LAYERS"],
    category: "Pop Culture & Movies",
    difficulty: "hard"
  },
  {
    word: "AUTOGRAPH",
    taboo: ["SIGNATURE", "FAMOUS", "SIGN", "CELEBRITY", "PEN"],
    category: "Pop Culture & Movies",
    difficulty: "hard"
  },
  {
    word: "PAPARAZZI",
    taboo: ["PHOTOS", "CELEBRITIES", "CAMERAS", "FOLLOW", "PRESS"],
    category: "Pop Culture & Movies",
    difficulty: "hard"
  },
  {
    word: "CLIFFHANGER",
    taboo: ["ENDING", "SUSPENSE", "EPISODE", "WAIT", "NEXT"],
    category: "Pop Culture & Movies",
    difficulty: "hard"
  },
  {
    word: "STUNT DOUBLE",
    taboo: ["ACTION", "ACTOR", "REPLACE", "DANGEROUS", "LOOKALIKE"],
    category: "Pop Culture & Movies",
    difficulty: "hard"
  },
  {
    word: "RED CARPET",
    taboo: ["WALK", "PREMIERE", "DRESS", "CELEBRITY", "HOLLYWOOD"],
    category: "Pop Culture & Movies",
    difficulty: "hard"
  },

  // ==========================================
  // CATEGORY 4: SCIENCE, TECH & NATURE (55 Cards)
  // ==========================================
  {
    word: "SMARTPHONE",
    taboo: ["SCREEN", "APP", "CALL", "APPLE", "POCKET"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "ROBOT",
    taboo: ["MACHINE", "METAL", "AI", "AUTOMATED", "HUMANOID"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "INTERNET",
    taboo: ["WEB", "ONLINE", "WIFI", "BROWSER", "WEBSITE"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "ASTRONAUT",
    taboo: ["SPACE", "NASA", "MOON", "SUIT", "ROCKET"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "VOLCANO",
    taboo: ["LAVA", "ERUPT", "MAGMA", "MOUNTAIN", "ASH"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "RAINBOW",
    taboo: ["COLORS", "SKY", "RAIN", "SUN", "POT OF GOLD"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "DINOSAUR",
    taboo: ["EXTINCT", "FOSSIL", "ANCIENT", "REPTILE", "BONES"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "EARTHQUAKE",
    taboo: ["SHAKE", "GROUND", "TREMOR", "RICHTER", "FAULT"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "TORNADO",
    taboo: ["WIND", "TWISTER", "STORM", "FUNNEL", "SPIN"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "BLUETOOTH",
    taboo: ["WIRELESS", "CONNECT", "DEVICE", "PHONE", "SPEAKER"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "LAPTOP",
    taboo: ["COMPUTER", "KEYBOARD", "PORTABLE", "SCREEN", "BATTERY"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "TELESCOPE",
    taboo: ["STARS", "LOOK", "SPACE", "PLANETS", "LENS"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "PHOTOSYNTHESIS",
    taboo: ["PLANTS", "SUNLIGHT", "GREEN", "LEAVES", "OXYGEN"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "SATELLITE",
    taboo: ["ORBIT", "EARTH", "SPACE", "SIGNAL", "GPS"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "MICROSCOPE",
    taboo: ["CELLS", "TINY", "LAB", "ZOOM", "BACTERIA"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "GRAVITY",
    taboo: ["FALL", "NEWTON", "EARTH", "PULL", "WEIGHT"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "CHARGER",
    taboo: ["BATTERY", "CORD", "PLUG", "PHONE", "PERCENT"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "DRONE",
    taboo: ["FLY", "CAMERA", "REMOTE", "QUADCOPTER", "PROPELLERS"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "VIRTUAL REALITY",
    taboo: ["HEADSET", "VR", "GAME", "GOGGLES", "IMMERSIVE"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "METEOR",
    taboo: ["SHOOTING STAR", "SPACE", "ROCK", "BURNING", "ATMOSPHERE"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "SOLAR PANEL",
    taboo: ["SUN", "ENERGY", "ROOF", "ELECTRICITY", "GREEN"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "MAGNET",
    taboo: ["ATTRACT", "NORTH", "SOUTH", "METAL", "POLES"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "LIGHTNING",
    taboo: ["THUNDER", "STORM", "FLASH", "ELECTRIC", "BOLT"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "ECLIPSE",
    taboo: ["MOON", "SUN", "BLOCK", "SHADOW", "DARK"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "BLACK HOLE",
    taboo: ["SPACE", "PULL", "LIGHT", "ESCAPE", "SINGULARITY"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "ALGORITHM",
    taboo: ["CODE", "COMPUTER", "STEPS", "MATH", "FORMULA"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "AURORA BOREALIS",
    taboo: ["NORTHERN LIGHTS", "GREEN", "SKY", "ARCTIC", "NIGHT"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "DNA",
    taboo: ["GENES", "HELIX", "BODY", "CELL", "INHERIT"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "WIFI ROUTER",
    taboo: ["INTERNET", "WIRELESS", "BOX", "PASSWORD", "SIGNAL"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "GLACIER",
    taboo: ["ICE", "MELT", "COLD", "MOUNTAIN", "SLOW"],
    category: "Science & Tech",
    difficulty: "hard"
  },

  // ==========================================
  // CATEGORY 5: GEOGRAPHY, TRAVEL & WORLD (50 Cards)
  // ==========================================
  {
    word: "AIRPORT",
    taboo: ["PLANES", "FLY", "LUGGAGE", "TERMINAL", "GATE"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "EIFFEL TOWER",
    taboo: ["PARIS", "FRANCE", "MONUMENT", "METAL", "VISIT"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "PYRAMIDS",
    taboo: ["EGYPT", "DESERT", "PHARAOH", "TRIANGLE", "TOMB"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "BEACH",
    taboo: ["SAND", "OCEAN", "WAVES", "SUN", "TOWEL"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "STATUE OF LIBERTY",
    taboo: ["NEW YORK", "TORCH", "GREEN", "HARBOR", "ISLAND"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "HOTEL",
    taboo: ["ROOM", "BED", "STAY", "KEY", "VACATION"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "SUITCASE",
    taboo: ["PACK", "LUGGAGE", "TRAVEL", "WHEELS", "CLOTHES"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "CAMPING",
    taboo: ["TENT", "OUTDOORS", "FIRE", "WOODS", "SLEEPING BAG"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "SUBWAY",
    taboo: ["TRAIN", "UNDERGROUND", "METRO", "STATION", "TRACKS"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "TAXI",
    taboo: ["CAB", "CAR", "YELLOW", "FARE", "DRIVER"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "CRUISE SHIP",
    taboo: ["BOAT", "OCEAN", "VACATION", "SAIL", "DECK"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "BIG BEN",
    taboo: ["LONDON", "CLOCK", "TOWER", "ENGLAND", "TIME"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "TAJ MAHAL",
    taboo: ["INDIA", "MARBLE", "WHITE", "PALACE", "AGRA"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "GREAT WALL OF CHINA",
    taboo: ["STONE", "BORDER", "ANCIENT", "ASIAN", "LONG"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "GRAND CANYON",
    taboo: ["ARIZONA", "RIVER", "ROCKS", "CLIFF", "DEEP"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "MOUNT EVEREST",
    taboo: ["TALLEST", "MOUNTAIN", "CLIMB", "HIMALAYAS", "PEAK"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "NIAGARA FALLS",
    taboo: ["WATER", "CANADA", "BOAT", "MIST", "CASCADE"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "SAFARI",
    taboo: ["AFRICA", "ANIMALS", "JEEP", "LION", "TOUR"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "COLOSSEUM",
    taboo: ["ROME", "ITALY", "GLADIATOR", "ARENA", "ANCIENT"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "AMUSEMENT PARK",
    taboo: ["ROLLERCOASTER", "RIDES", "CARNIVAL", "FERRIS WHEEL", "TICKET"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "LIGHTHOUSE",
    taboo: ["COAST", "BEACON", "SHIPS", "ROCKS", "TOWER"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "GONDOLA",
    taboo: ["VENICE", "BOAT", "CANAL", "ITALY", "ROW"],
    category: "Geography & Travel",
    difficulty: "hard"
  },
  {
    word: "BERMUDA TRIANGLE",
    taboo: ["LOST", "SHIPS", "PLANES", "OCEAN", "MYSTERY"],
    category: "Geography & Travel",
    difficulty: "hard"
  },
  {
    word: "EQUATOR",
    taboo: ["EARTH", "MIDDLE", "LINE", "HOT", "HEMISPHERE"],
    category: "Geography & Travel",
    difficulty: "hard"
  },
  {
    word: "OASIS",
    taboo: ["DESERT", "WATER", "PALM TREES", "MIRAGE", "ISLAND"],
    category: "Geography & Travel",
    difficulty: "hard"
  },
  {
    word: "JET LAG",
    taboo: ["TIRED", "TIME ZONE", "FLY", "SLEEP", "FLIGHT"],
    category: "Geography & Travel",
    difficulty: "hard"
  },

  // ==========================================
  // CATEGORY 6: BRAIN BUSTERS & ABSTRACT (50 Cards)
  // ==========================================
  {
    word: "BIRTHDAY",
    taboo: ["CAKE", "CANDLES", "WISH", "YEAR", "PARTY"],
    category: "Brain Busters",
    difficulty: "easy"
  },
  {
    word: "WEDDING",
    taboo: ["BRIDE", "GROOM", "RING", "MARRY", "DRESS"],
    category: "Brain Busters",
    difficulty: "easy"
  },
  {
    word: "JEALOUSY",
    taboo: ["ENVY", "GREEN", "WANT", "COVET", "RIVAL"],
    category: "Brain Busters",
    difficulty: "medium"
  },
  {
    word: "PROCRASTINATION",
    taboo: ["DELAY", "LATER", "LAZY", "PUT OFF", "TOMORROW"],
    category: "Brain Busters",
    difficulty: "medium"
  },
  {
    word: "STAGE FRIGHT",
    taboo: ["NERVOUS", "AUDIENCE", "SPEAK", "SWEAT", "PERFORM"],
    category: "Brain Busters",
    difficulty: "medium"
  },
  {
    word: "HICCUP",
    taboo: ["DIAPHRAGM", "SCARE", "WATER", "BREATH", "NOISE"],
    category: "Brain Busters",
    difficulty: "medium"
  },
  {
    word: "NIGHTMARE",
    taboo: ["DREAM", "SCARE", "BAD", "WAKE UP", "SLEEP"],
    category: "Brain Busters",
    difficulty: "medium"
  },
  {
    word: "DEJA VU",
    taboo: ["HAPPENED", "BEFORE", "FEELING", "AGAIN", "FRENCH"],
    category: "Brain Busters",
    difficulty: "medium"
  },
  {
    word: "WHISPER",
    taboo: ["TALK", "QUIET", "EAR", "SECRET", "LOUD"],
    category: "Brain Busters",
    difficulty: "medium"
  },
  {
    word: "GOOSEBUMPS",
    taboo: ["COLD", "SHIVER", "SKIN", "HAIR", "SCARED"],
    category: "Brain Busters",
    difficulty: "medium"
  },
  {
    word: "SECOND THOUGHTS",
    taboo: ["DOUBT", "CHANGE", "MIND", "HESITATE", "DECISION"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "NOSTALGIA",
    taboo: ["MEMORY", "PAST", "OLD", "REMEMBER", "CHILDHOOD"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "BRAINSTORM",
    taboo: ["IDEAS", "THINK", "MEETING", "GROUP", "SOLVE"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "SERENDIPITY",
    taboo: ["LUCK", "ACCIDENT", "CHANCE", "FORTUNE", "DISCOVER"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "CONFIDENTIAL",
    taboo: ["SECRET", "PRIVATE", "CLASSIFIED", "TELL", "DOCUMENT"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "STAGE NAME",
    taboo: ["REAL", "FAMOUS", "ALIAS", "ACTOR", "PSEUDONYM"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "INSOMNIA",
    taboo: ["SLEEP", "AWAKE", "TIRED", "BED", "NIGHT"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "HYPNOTIZE",
    taboo: ["SLEEP", "WATCH", "SWING", "TRANCE", "CONTROL"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "CONSPIRACY",
    taboo: ["THEORY", "SECRET", "PLOT", "GOVERNMENT", "ALIEN"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "PLACEBO",
    taboo: ["SUGAR PILL", "FAKE", "EFFECT", "MEDICINE", "BELIEF"],
    category: "Brain Busters",
    difficulty: "hard"
  },
// ==========================================
  // CATEGORY 7: ANIMALS & WILDLIFE (35 Cards)
  // ==========================================
  {
    word: "KANGAROO",
    taboo: ["AUSTRALIA", "POUCH", "HOP", "JUMP", "JOEY"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "DOLPHIN",
    taboo: ["OCEAN", "FISH", "MAMMAL", "SWIM", "SMART"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "CHAMELEON",
    taboo: ["COLOR", "CHANGE", "LIZARD", "BLEND", "REPTILE"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "OCTOPUS",
    taboo: ["TENTACLES", "EIGHT", "ARMS", "INK", "OCEAN"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "GIRAFFE",
    taboo: ["NECK", "TALL", "SPOTS", "AFRICA", "LEAVES"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "MOSQUITO",
    taboo: ["BITE", "BUG", "BLOOD", "ITCH", "MALARIA"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "SLOTH",
    taboo: ["SLOW", "TREE", "LAZY", "HANG", "ANIMAL"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "BEAVER",
    taboo: ["DAM", "WOOD", "TEETH", "TAIL", "RIVER"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "SKUNK",
    taboo: ["SMELL", "STINK", "STRIPE", "BLACK", "SPRAY"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "FLAMINGO",
    taboo: ["PINK", "BIRD", "ONE LEG", "STAND", "FEATHERS"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "PIRANHA",
    taboo: ["TEETH", "FISH", "BITE", "AMAZON", "RIVER"],
    category: "Animals & Wildlife",
    difficulty: "medium"
  },
  {
    word: "PORCUPINE",
    taboo: ["QUILLS", "SPIKES", "PRICK", "SHARP", "NEEDLE"],
    category: "Animals & Wildlife",
    difficulty: "medium"
  },
  {
    word: "PANDA",
    taboo: ["BEAR", "BAMBOO", "CHINA", "BLACK", "WHITE"],
    category: "Animals & Wildlife",
    difficulty: "medium"
  },
  {
    word: "SEAHORSE",
    taboo: ["OCEAN", "FISH", "MALE", "PREGNANT", "TAIL"],
    category: "Animals & Wildlife",
    difficulty: "medium"
  },
  {
    word: "SCORPION",
    taboo: ["STING", "TAIL", "DESERT", "PINCERS", "POISON"],
    category: "Animals & Wildlife",
    difficulty: "medium"
  },
  {
    word: "CHEETAH",
    taboo: ["FAST", "CAT", "SPEED", "SPOTS", "RUN"],
    category: "Animals & Wildlife",
    difficulty: "medium"
  },
  {
    word: "WOODPECKER",
    taboo: ["BEAK", "TREE", "PECK", "HOLE", "BIRD"],
    category: "Animals & Wildlife",
    difficulty: "medium"
  },
  {
    word: "PLATYPUS",
    taboo: ["BILL", "DUCK", "AUSTRALIA", "EGG", "MAMMAL"],
    category: "Animals & Wildlife",
    difficulty: "hard"
  },
  {
    word: "JELLYFISH",
    taboo: ["STING", "TENTACLES", "OCEAN", "TRANSPARENT", "BLOB"],
    category: "Animals & Wildlife",
    difficulty: "hard"
  },
  {
    word: "KOMODO DRAGON",
    taboo: ["LIZARD", "ISLAND", "GIANT", "VENOM", "INDONESIA"],
    category: "Animals & Wildlife",
    difficulty: "hard"
  },

  // ==========================================
  // CATEGORY 8: SPORTS, GAMES & ATHLETICS (35 Cards)
  // ==========================================
  {
    word: "BASKETBALL",
    taboo: ["HOOP", "DRIBBLE", "NBA", "COURT", "SHOOT"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "SOCCER",
    taboo: ["GOAL", "KICK", "BALL", "FIFA", "NET"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "BASEBALL",
    taboo: ["BAT", "PITCHER", "HOME RUN", "GLOVE", "BASES"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "BOWLING",
    taboo: ["PINS", "STRIKE", "ALLEY", "BALL", "HOLES"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "TENNIS",
    taboo: ["RACKET", "NET", "COURT", "SERVE", "BALL"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "GOLF",
    taboo: ["CLUB", "HOLE", "TEE", "GREEN", "PUTT"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "SKATEBOARD",
    taboo: ["WHEELS", "DECK", "TRICKS", "RAMP", "OLLIE"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "SURFING",
    taboo: ["WAVE", "BOARD", "OCEAN", "BEACH", "RIDE"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "CHESS",
    taboo: ["CHECKMATE", "KING", "QUEEN", "BOARD", "KNIGHT"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "VOLLEYBALL",
    taboo: ["SPIKE", "NET", "SERVE", "BEACH", "SET"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "MARATHON",
    taboo: ["RUN", "MILES", "RACE", "26", "ENDURANCE"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "ARCHERY",
    taboo: ["BOW", "ARROW", "TARGET", "BULLSEYE", "SHOOT"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "SNOWBOARDING",
    taboo: ["SNOW", "MOUNTAIN", "WINTER", "SLOPE", "BOOTS"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "BOXING",
    taboo: ["GLOVES", "RING", "PUNCH", "KNOCKOUT", "ROUNDS"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "FRISBEE",
    taboo: ["DISC", "THROW", "CATCH", "PLASTIC", "DOG"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "DODGEBALL",
    taboo: ["THROW", "HIT", "OUT", "BALL", "DUCK"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "TRAMPOLINE",
    taboo: ["BOUNCE", "JUMP", "SPRINGS", "NET", "BACKFLIP"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "PARACHUTE",
    taboo: ["SKYDIVE", "PLANE", "JUMP", "FALL", "OPEN"],
    category: "Sports & Games",
    difficulty: "hard"
  },
  {
    word: "FENCING",
    taboo: ["SWORD", "FOIL", "MASK", "DUEL", "WHITE"],
    category: "Sports & Games",
    difficulty: "hard"
  },
  {
    word: "BUNGEE JUMPING",
    taboo: ["CORD", "BRIDGE", "BOUNCE", "FEET", "FALL"],
    category: "Sports & Games",
    difficulty: "hard"
  },

  // ==========================================
  // CATEGORY 9: PROFESSIONS & ROLES (30 Cards)
  // ==========================================
  {
    word: "FIREFIGHTER",
    taboo: ["HOSE", "FLAME", "TRUCK", "EXTINGUISH", "HERO"],
    category: "Professions",
    difficulty: "easy"
  },
  {
    word: "CHEF",
    taboo: ["COOK", "KITCHEN", "FOOD", "RESTAURANT", "HAT"],
    category: "Professions",
    difficulty: "easy"
  },
  {
    word: "PILOT",
    taboo: ["AIRPLANE", "FLY", "COCKPIT", "AIRPORT", "SKY"],
    category: "Professions",
    difficulty: "easy"
  },
  {
    word: "DENTIST",
    taboo: ["TEETH", "DRILL", "SMILE", "CAVITY", "MOUTH"],
    category: "Professions",
    difficulty: "easy"
  },
  {
    word: "DETECTIVE",
    taboo: ["CLUES", "MYSTERY", "SOLVE", "CRIME", "INVESTIGATE"],
    category: "Professions",
    difficulty: "easy"
  },
  {
    word: "LIFEGUARD",
    taboo: ["POOL", "SWIM", "BEACH", "RESCUE", "WHISTLE"],
    category: "Professions",
    difficulty: "easy"
  },
  {
    word: "ASTRONOMER",
    taboo: ["STARS", "TELESCOPE", "PLANETS", "SPACE", "NIGHT"],
    category: "Professions",
    difficulty: "medium"
  },
  {
    word: "PLUMBER",
    taboo: ["PIPES", "WRENCH", "LEAK", "WATER", "SINK"],
    category: "Professions",
    difficulty: "medium"
  },
  {
    word: "MAGICIAN",
    taboo: ["TRICK", "RABBIT", "HAT", "WAND", "ILLUSION"],
    category: "Professions",
    difficulty: "medium"
  },
  {
    word: "ARCHAEOLOGIST",
    taboo: ["BONES", "DIG", "FOSSIL", "ANCIENT", "INDIANA JONES"],
    category: "Professions",
    difficulty: "medium"
  },
  {
    word: "BARISTA",
    taboo: ["COFFEE", "LATTE", "STARBUCKS", "ESPRESSO", "FOAM"],
    category: "Professions",
    difficulty: "medium"
  },
  {
    word: "FLIGHT ATTENDANT",
    taboo: ["AIRPLANE", "PASSENGER", "SNACKS", "DRINKS", "CABIN"],
    category: "Professions",
    difficulty: "medium"
  },
  {
    word: "METEOROLOGIST",
    taboo: ["WEATHER", "FORECAST", "RAIN", "RADAR", "NEWS"],
    category: "Professions",
    difficulty: "hard"
  },
  {
    word: "VENTRILOQUIST",
    taboo: ["DUMMY", "PUPPET", "MOUTH", "VOICE", "SPEAK"],
    category: "Professions",
    difficulty: "hard"
  },
  {
    word: "SOMMELIER",
    taboo: ["WINE", "TASTE", "BOTTLE", "RESTAURANT", "GRAPES"],
    category: "Professions",
    difficulty: "hard"
  },

  // ==========================================
  // CATEGORY 10: INTERNET, SLANG & MODERN LIFE (30 Cards)
  // ==========================================
  {
    word: "SELFIE",
    taboo: ["PHOTO", "PHONE", "CAMERA", "FACE", "STICK"],
    category: "Modern Life",
    difficulty: "easy"
  },
  {
    word: "MEME",
    taboo: ["VIRAL", "FUNNY", "INTERNET", "IMAGE", "JOKE"],
    category: "Modern Life",
    difficulty: "easy"
  },
  {
    word: "PODCAST",
    taboo: ["EPISODE", "LISTEN", "AUDIO", "HOST", "RECORD"],
    category: "Modern Life",
    difficulty: "easy"
  },
  {
    word: "EMOJI",
    taboo: ["TEXT", "FACE", "ICON", "SMILE", "KEYBOARD"],
    category: "Modern Life",
    difficulty: "easy"
  },
  {
    word: "INFLUENCER",
    taboo: ["FOLLOWERS", "INSTAGRAM", "SPONSOR", "POST", "SOCIAL MEDIA"],
    category: "Modern Life",
    difficulty: "easy"
  },
  {
    word: "HASHTAG",
    taboo: ["POUND", "SYMBOL", "TAG", "TWITTER", "TREND"],
    category: "Modern Life",
    difficulty: "easy"
  },
  {
    word: "BINGE WATCH",
    taboo: ["EPISODES", "NETFLIX", "SERIES", "ALL NIGHT", "STREAM"],
    category: "Modern Life",
    difficulty: "medium"
  },
  {
    word: "GHOSTING",
    taboo: ["TEXT", "IGNORE", "DATING", "REPLY", "DISAPPEAR"],
    category: "Modern Life",
    difficulty: "medium"
  },
  {
    word: "CLICKBAIT",
    taboo: ["TITLE", "ARTICLE", "LINK", "SURPRISE", "TRICK"],
    category: "Modern Life",
    difficulty: "medium"
  },
  {
    word: "FOOD DELIVERY",
    taboo: ["DOORDASH", "UBER EATS", "ORDER", "APP", "DRIVER"],
    category: "Modern Life",
    difficulty: "medium"
  },
  {
    word: "SPOILER",
    taboo: ["ENDING", "RUIN", "MOVIE", "PLOT", "TELL"],
    category: "Modern Life",
    difficulty: "medium"
  },
  {
    word: "UNBOXING",
    taboo: ["PACKAGE", "NEW", "YOUTUBE", "OPEN", "PRODUCT"],
    category: "Modern Life",
    difficulty: "medium"
  },
  {
    word: "SMART HOME",
    taboo: ["ALEXA", "SPEAKER", "LIGHTS", "VOICE", "AUTOMATION"],
    category: "Modern Life",
    difficulty: "hard"
  },
  {
    word: "AIRDROPS",
    taboo: ["IPHONE", "SHARE", "BLUETOOTH", "FILES", "SEND"],
    category: "Modern Life",
    difficulty: "hard"
  },
  {
    word: "DOOMSCROLLING",
    taboo: ["NEWS", "PHONE", "BAD", "FEED", "HOURS"],
    category: "Modern Life",
    difficulty: "hard"
  },
{
    word: "ESCALATOR",
    taboo: ["STAIRS", "MOVING", "STEPS", "MALL", "STAND"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "SUNSCREEN",
    taboo: ["LOTION", "SUNBURN", "SPF", "BEACH", "SKIN"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "WATERFALL",
    taboo: ["RIVER", "DROP", "CASCADE", "ROCKS", "FLOW"],
    category: "Geography & Travel",
    difficulty: "easy"
  },
  {
    word: "SUBMARINE",
    taboo: ["UNDERWATER", "OCEAN", "PERISCOPE", "SONAR", "NAVY"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "PENGUIN",
    taboo: ["BIRD", "ANTARCTICA", "ICE", "WADDLE", "TUXEDO"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "POPCORN",
    taboo: ["KERNEL", "BUTTER", "MOVIE", "MICROWAVE", "BAG"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "PIRATE",
    taboo: ["SHIP", "EYEPATCH", "TREASURE", "PARROT", "CAPTAIN"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "VAMPIRE",
    taboo: ["DRACULA", "BLOOD", "FANGS", "BAT", "GARLIC"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "ZOMBIE",
    taboo: ["BRAINS", "DEAD", "WALKING", "APOCALYPSE", "BITE"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "SANTA CLAUS",
    taboo: ["CHRISTMAS", "NORTH POLE", "PRESENTS", "REINDEER", "CHIMNEY"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "TOOTH FAIRY",
    taboo: ["PILLOW", "MONEY", "COIN", "CHILD", "LOST"],
    category: "Pop Culture & Movies",
    difficulty: "easy"
  },
  {
    word: "FORTUNE COOKIE",
    taboo: ["CHINESE", "PAPER", "FUTURE", "DESSERT", "CRACK"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "COTTON BALL",
    taboo: ["WHITE", "SOFT", "BATHROOM", "SWAB", "CLEAN"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "RUBIK'S CUBE",
    taboo: ["PUZZLE", "COLORS", "SQUARES", "TWIST", "SOLVE"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "TREASURE MAP",
    taboo: ["X MARKS", "PIRATE", "CHEST", "GOLD", "ISLAND"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "ROLLERCOASTER",
    taboo: ["AMUSEMENT PARK", "TRACK", "LOOP", "SCREAM", "RIDE"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "HOT AIR BALLOON",
    taboo: ["BASKET", "FLY", "BURNER", "FLOAT", "SKY"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "IGLOO",
    taboo: ["SNOW", "ICE", "ESKIMO", "DOME", "HOUSE"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "SCARECROW",
    taboo: ["FIELD", "BIRDS", "STRAW", "CORN", "FARM"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "SNOWMAN",
    taboo: ["CARROT", "WINTER", "MELT", "BUTTONS", "HAT"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "GHOST",
    taboo: ["BOO", "HAUNTED", "SHEET", "SPIRIT", "SPOOKY"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "MERMAID",
    taboo: ["FISH", "TAIL", "OCEAN", "ARIEL", "SWIM"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "UNICORN",
    taboo: ["HORN", "HORSE", "MAGIC", "RAINBOW", "MYTHICAL"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "BOOMERANG",
    taboo: ["THROW", "RETURN", "AUSTRALIA", "WOOD", "CATCH"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "YO-YO",
    taboo: ["STRING", "UP AND DOWN", "TRICKS", "SPIN", "TOY"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "HULA HOOP",
    taboo: ["HIPS", "CIRCLE", "WAIST", "SPIN", "PLASTIC"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "PINATA",
    taboo: ["CANDY", "STICK", "BLINDFOLD", "HIT", "PARTY"],
    category: "Everyday Objects",
    difficulty: "medium"
  },
  {
    word: "FERRIS WHEEL",
    taboo: ["CARNIVAL", "CIRCLE", "BIG", "VIEW", "FAIR"],
    category: "Sports & Games",
    difficulty: "medium"
  },
  {
    word: "METRONOME",
    taboo: ["MUSIC", "TICK", "BEAT", "PIANO", "TEMPO"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "LABYRINTH",
    taboo: ["MAZE", "MINOTAUR", "LOST", "WALLS", "PUZZLE"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "CHANDELIER",
    taboo: ["CEILING", "CRYSTAL", "LIGHT", "HANG", "ROOM"],
    category: "Everyday Objects",
    difficulty: "hard"
  },
  {
    word: "TREBUCHET",
    taboo: ["CATAPULT", "CASTLE", "SIEGE", "THROW", "BOULDER"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "HYPOTHERMIA",
    taboo: ["COLD", "BODY", "FREEZING", "TEMPERATURE", "SHIVER"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "SUPERNOVA",
    taboo: ["STAR", "EXPLOSION", "SPACE", "BURST", "GALAXY"],
    category: "Science & Tech",
    difficulty: "hard"
  },
  {
    word: "QUICKSAND",
    taboo: ["SINK", "MUD", "STUCK", "PULL", "ESCAPE"],
    category: "Geography & Travel",
    difficulty: "hard"
  },
  {
    word: "TIME CAPSULE",
    taboo: ["BURY", "FUTURE", "BOX", "MEMORIES", "YEARS"],
    category: "Brain Busters",
    difficulty: "hard"
  },
  {
    word: "GUINEA PIG",
    taboo: ["RODENT", "PET", "EXPERIMENT", "CAGE", "ANIMAL"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "HAMSTER WHEEL",
    taboo: ["RUN", "PET", "SPIN", "CAGE", "EXERCISE"],
    category: "Animals & Wildlife",
    difficulty: "easy"
  },
  {
    word: "FIREWORKS",
    taboo: ["FOURTH OF JULY", "SKY", "EXPLODE", "COLORS", "SPARKLER"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "CHALKBOARD",
    taboo: ["ERASER", "BLACKBOARD", "SCHOOL", "WRITE", "TEACHER"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "MONOPOLY",
    taboo: ["BOARD GAME", "BOARDWALK", "JAIL", "HOUSES", "MONEY"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "SCRABBLE",
    taboo: ["TILES", "LETTERS", "SPELL", "WORDS", "BOARD GAME"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "CLUE",
    taboo: ["MURDER", "MANSION", "COLONEL MUSTARD", "WEAPON", "SUSPECT"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "JENGA",
    taboo: ["BLOCKS", "TOWER", "WOOD", "FALL", "PULL"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "TWISTER",
    taboo: ["MAT", "CIRCLES", "FEET", "HANDS", "TANGLE"],
    category: "Sports & Games",
    difficulty: "easy"
  },
  {
    word: "KITE",
    taboo: ["WIND", "FLY", "STRING", "TAIL", "SKY"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "FOG",
    taboo: ["MIST", "CLOUDS", "WEATHER", "SEE", "THICK"],
    category: "Science & Tech",
    difficulty: "easy"
  },
  {
    word: "SNOWBALL",
    taboo: ["FIGHT", "WINTER", "THROW", "ICE", "PACK"],
    category: "Everyday Objects",
    difficulty: "easy"
  },
  {
    word: "AVALANCHE",
    taboo: ["SNOW", "MOUNTAIN", "SLIDE", "SKI", "FALL"],
    category: "Geography & Travel",
    difficulty: "medium"
  },
  {
    word: "BUBBLE GUM",
    taboo: ["CHEW", "BLOW", "POP", "PINK", "STICKY"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "COTTON CANDY",
    taboo: ["SUGAR", "PINK", "CARNIVAL", "SPUN", "FLUFFY"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "POPSICLE",
    taboo: ["STICK", "FROZEN", "ICE", "SUMMER", "MELT"],
    category: "Food & Drinks",
    difficulty: "easy"
  },
  {
    word: "FORTUNE TELLER",
    taboo: ["CRYSTAL BALL", "FUTURE", "PALM", "TAROT", "PREDICT"],
    category: "Pop Culture & Movies",
    difficulty: "medium"
  },
  {
    word: "WINDMILL",
    taboo: ["BLADES", "ENERGY", "HOLLAND", "WIND", "FARM"],
    category: "Science & Tech",
    difficulty: "medium"
  },
  {
    word: "SOLAR ECLIPSE",
    taboo: ["SUN", "MOON", "SHADOW", "GLASSES", "TOTALLY"],
    category: "Science & Tech",
    difficulty: "hard"
  }
];

// Helper functions for categories and deck management
const CardDB = {
  getAllCards: function() {
    const customCards = CardDB.getCustomCards();
    return [...DEFAULT_CARDS, ...customCards];
  },

  getCategories: function() {
    const cards = CardDB.getAllCards();
    const categories = new Set(cards.map(c => c.category));
    return Array.from(categories);
  },

  getCardsByCategory: function(category) {
    const all = CardDB.getAllCards();
    if (!category || category === "All") return all;
    return all.filter(c => c.category === category);
  },

  getCustomCards: function() {
    try {
      const stored = localStorage.getItem("taboo_custom_cards");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to read custom cards:", e);
      return [];
    }
  },

  saveCustomCard: function(card) {
    const custom = CardDB.getCustomCards();
    card.id = "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    card.isCustom = true;
    custom.push(card);
    localStorage.setItem("taboo_custom_cards", JSON.stringify(custom));
    return card;
  },

  deleteCustomCard: function(cardId) {
    let custom = CardDB.getCustomCards();
    custom = custom.filter(c => c.id !== cardId);
    localStorage.setItem("taboo_custom_cards", JSON.stringify(custom));
    return custom;
  },

  clearCustomCards: function() {
    localStorage.removeItem("taboo_custom_cards");
  },

  importCustomCards: function(inputData, replaceExisting = false) {
    try {
      let raw = inputData;
      if (typeof raw === "string") {
        let trimmed = raw.trim();
        // Remove markdown code fences if pasted directly from LLM
        if (trimmed.startsWith("```")) {
          trimmed = trimmed.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim();
        }
        raw = JSON.parse(trimmed);
      }

      let cardList = [];
      let defaultCategory = "Custom";

      if (Array.isArray(raw)) {
        cardList = raw;
      } else if (raw && typeof raw === "object") {
        if (raw.deckName || raw.category || raw.name) {
          defaultCategory = raw.deckName || raw.category || raw.name;
        }
        if (Array.isArray(raw.cards)) {
          cardList = raw.cards;
        } else if (Array.isArray(raw.deck)) {
          cardList = raw.deck;
        } else if (Array.isArray(raw.items)) {
          cardList = raw.items;
        } else {
          throw new Error("Could not find a cards array in the JSON. Expected an array or { 'cards': [...] }");
        }
      } else {
        throw new Error("Invalid format: expected a JSON array or deck object.");
      }

      const validCards = [];
      const discoveredCategories = new Set();

      cardList.forEach(c => {
        if (!c || !c.word) return;
        const word = String(c.word).trim().toUpperCase();

        let tabooList = [];
        if (Array.isArray(c.taboo)) {
          tabooList = c.taboo.map(t => String(t).trim().toUpperCase()).filter(t => t.length > 0);
        } else if (typeof c.taboo === "string") {
          tabooList = c.taboo.split(",").map(t => t.trim().toUpperCase()).filter(t => t.length > 0);
        }
        if (tabooList.length === 0) return;

        const category = (c.category && String(c.category).trim()) || defaultCategory;
        discoveredCategories.add(category);

        const difficulty = ["easy", "medium", "hard"].includes(String(c.difficulty).toLowerCase())
          ? String(c.difficulty).toLowerCase()
          : "medium";

        validCards.push({
          id: "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
          word: word,
          taboo: tabooList,
          category: category,
          difficulty: difficulty,
          isCustom: true
        });
      });

      if (validCards.length === 0) {
        throw new Error("No valid cards found. Ensure each card has a 'word' string and a 'taboo' array.");
      }

      let finalCustomList = replaceExisting ? validCards : [...CardDB.getCustomCards(), ...validCards];
      localStorage.setItem("taboo_custom_cards", JSON.stringify(finalCustomList));

      return {
        count: validCards.length,
        totalInDeck: finalCustomList.length,
        categories: Array.from(discoveredCategories)
      };
    } catch (e) {
      console.error("Import failed:", e);
      throw e;
    }
  },

  exportCustomCards: function() {
    return JSON.stringify(CardDB.getCustomCards(), null, 2);
  }
};
