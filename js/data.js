// Urban Apex - Product Data (Updated with New Furniture Items)

const PRODUCTS = [
  // ===== Ascent Tables (Accent Tables) =====
  {
    id: 1,
    slug: "cheetah-table",
    name: "Cheetah Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 8999,
    originalPrice: 12999,
    discount: 31,
    rating: 4.5,
    reviews: 124,
    image: "https://i.postimg.cc/J7sMwFsk/cheetah-table-491f2ce4de188a6259e6.png",
    images: [
      "https://i.postimg.cc/J7sMwFsk/cheetah-table-491f2ce4de188a6259e6.png"
    ],
    color: "Natural Wood",
    material: "Engineered Wood",
    dimensions: "W 56 × D 46 × H 45 cm",
    weight: "12 kg",
    warranty: "1 Year",
    badge: "New",
    description: "Inspired by the grace of the cheetah, this accent table brings a touch of wildlife elegance to your living space. Its sleek silhouette and warm wood finish make it a versatile piece for any room.",
    features: [
      "Sturdy engineered wood construction",
      "Smooth, easy-clean surface",
      "Compact size fits small spaces",
      "Non-marking foot pads"
    ]
  },
  {
    id: 2,
    slug: "crocodile-table",
    name: "Crocodile Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 9499,
    originalPrice: 13999,
    discount: 32,
    rating: 4.6,
    reviews: 98,
    image: "https://i.postimg.cc/k4B3mVg3/crocodile-table.png",
    images: [
      "https://i.postimg.cc/k4B3mVg3/crocodile-table.png"
    ],
    color: "Dark Walnut",
    material: "Solid Wood",
    dimensions: "W 51 × D 53 × H 46 cm",
    weight: "15 kg",
    warranty: "1 Year",
    badge: "Bestseller",
    description: "The rugged texture and bold stance of the Crocodile Table make it a statement piece. Crafted from solid wood, it offers durability and a unique, hand-finished look.",
    features: [
      "Solid wood construction",
      "Hand-carved details",
      "Stable, wide base",
      "Protective felt pads"
    ]
  },
  {
    id: 3,
    slug: "elephant-table",
    name: "Elephant Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 10499,
    originalPrice: 15999,
    discount: 34,
    rating: 4.7,
    reviews: 156,
    image: "https://i.postimg.cc/KvXX68XP/elephant-table.png",
    images: [
      "https://i.postimg.cc/KvXX68XP/elephant-table.png"
    ],
    color: "Honey Oak",
    material: "Engineered Wood",
    dimensions: "W 46 × D 46 × H 56 cm",
    weight: "14 kg",
    warranty: "1 Year",
    badge: "Trending",
    description: "Strong and sturdy like its namesake, the Elephant Table provides a generous surface for decor or daily essentials. Its tall profile adds vertical interest to your room.",
    features: [
      "Tall, space-saving design",
      "Scratch-resistant laminate",
      "Easy assembly",
      "Ideal for narrow corners"
    ]
  },
  {
    id: 4,
    slug: "falcon-table",
    name: "Falcon Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 11499,
    originalPrice: 16999,
    discount: 32,
    rating: 4.8,
    reviews: 87,
    image: "https://i.postimg.cc/gJw57fgP/falcon-table.png",
    images: [
      "https://i.postimg.cc/gJw57fgP/falcon-table.png"
    ],
    color: "Charcoal Grey",
    material: "Metal & Wood",
    dimensions: "W 53 × D 53 × H 58 cm",
    weight: "18 kg",
    warranty: "2 Years",
    badge: null,
    description: "With its sleek metal legs and wooden top, the Falcon Table combines industrial charm with warm organic texture. Perfect as a side table or plant stand.",
    features: [
      "Sturdy metal frame",
      "Woodgrain finish top",
      "Adjustable floor protectors",
      "Minimalist aesthetic"
    ]
  },
  {
    id: 5,
    slug: "giraffe-table",
    name: "Giraffe Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 12499,
    originalPrice: 17999,
    discount: 31,
    rating: 4.5,
    reviews: 112,
    image: "https://i.postimg.cc/151TW767/giraffe-table.png",
    images: [
      "https://i.postimg.cc/151TW767/giraffe-table.png"
    ],
    color: "Natural Oak",
    material: "Solid Wood",
    dimensions: "W 38 × D 58 × H 58 cm",
    weight: "16 kg",
    warranty: "1 Year",
    badge: "New",
    description: "Tall and elegant, the Giraffe Table draws the eye upward. Its slender form is perfect for displaying a lamp or sculpture, adding height and drama to any corner.",
    features: [
      "Solid oak construction",
      "Slim, space-efficient footprint",
      "Warm natural finish",
      "Hand-applied lacquer"
    ]
  },
  {
    id: 6,
    slug: "leopard-table",
    name: "Leopard Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 9999,
    originalPrice: 14999,
    discount: 33,
    rating: 4.4,
    reviews: 76,
    image: "https://i.postimg.cc/6qJHmT7d/Leopard-Table.png",
    images: [
      "https://i.postimg.cc/6qJHmT7d/Leopard-Table.png"
    ],
    color: "Dark Walnut",
    material: "Engineered Wood",
    dimensions: "W 51 × D 51 × H 46 cm",
    weight: "13 kg",
    warranty: "1 Year",
    badge: null,
    description: "Bold and confident, the Leopard Table features a striking grain pattern that mimics its namesake. Compact and versatile, it fits effortlessly into modern interiors.",
    features: [
      "Realistic wood grain print",
      "Compact square shape",
      "Easy-care surface",
      "Ready to assemble"
    ]
  },
  {
    id: 7,
    slug: "monkey-table",
    name: "Monkey Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 10999,
    originalPrice: 15999,
    discount: 31,
    rating: 4.6,
    reviews: 103,
    image: "https://i.postimg.cc/dQrNTRXN/monkey-table.png",
    images: [
      "https://i.postimg.cc/dQrNTRXN/monkey-table.png"
    ],
    color: "Hickory",
    material: "Solid Wood",
    dimensions: "W 51 × D 58 × H 46 cm",
    weight: "17 kg",
    warranty: "1 Year",
    badge: "Bestseller",
    description: "Playful yet refined, the Monkey Table’s asymmetric design adds a touch of whimsy. Its solid wood construction ensures longevity, while the warm finish complements any decor.",
    features: [
      "Solid hickory wood",
      "Unique asymmetric shape",
      "Reinforced joinery",
      "Non-toxic finish"
    ]
  },
  {
    id: 8,
    slug: "sea-horse-table",
    name: "Sea Horse Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 11999,
    originalPrice: 16999,
    discount: 29,
    rating: 4.7,
    reviews: 65,
    image: "https://i.postimg.cc/nhc35yLk/Sea-horse.png",
    images: [
      "https://i.postimg.cc/nhc35yLk/Sea-horse.png"
    ],
    color: "Coastal White",
    material: "Engineered Wood",
    dimensions: "W 38 × D 64 × H 58 cm",
    weight: "15 kg",
    warranty: "1 Year",
    badge: "New",
    description: "Curved and graceful like a seahorse, this table brings an organic, fluid shape to your room. Its elongated top is perfect for hallways or behind a sofa.",
    features: [
      "Curved silhouette",
      "Water-resistant laminate",
      "Soft-close feet",
      "Easy wipe-clean surface"
    ]
  },
  {
    id: 9,
    slug: "snake-table",
    name: "Snake Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 12999,
    originalPrice: 18999,
    discount: 32,
    rating: 4.5,
    reviews: 82,
    image: "https://i.postimg.cc/HLrBWbXv/Snake-Table.png",
    images: [
      "https://i.postimg.cc/HLrBWbXv/Snake-Table.png"
    ],
    color: "Ebony",
    material: "Solid Wood",
    dimensions: "W 64 × D 38 × H 58 cm",
    weight: "19 kg",
    warranty: "2 Years",
    badge: null,
    description: "Sleek and sinuous, the Snake Table winds its way through your space. Its elongated form is ideal for narrow entries or as a console table.",
    features: [
      "Solid ebony-stained wood",
      "Long, slim profile",
      "Hand-rubbed finish",
      "Sturdy cross-brace"
    ]
  },
  {
    id: 10,
    slug: "starfish-table",
    name: "Starfish Table",
    category: "living",
    subcategory: "Accent Tables",
    price: 11499,
    originalPrice: 16999,
    discount: 32,
    rating: 4.6,
    reviews: 91,
    image: "https://i.postimg.cc/fyNKvFF1/Starfish.png",
    images: [
      "https://i.postimg.cc/fyNKvFF1/Starfish.png"
    ],
    color: "Natural Oak",
    material: "Engineered Wood",
    dimensions: "W 64 × D 38 × H 58 cm",
    weight: "14 kg",
    warranty: "1 Year",
    badge: "Trending",
    description: "Radiating warmth like a starfish, this table features a multi-directional base and a spacious top. It anchors any seating area with understated style.",
    features: [
      "Radial base design",
      "Oak veneer finish",
      "Ample surface space",
      "Floor-protecting glides"
    ]
  },

  // ===== Sideboards, Buffets & Cabinets =====
  {
    id: 11,
    slug: "vanta-grand-sideboard",
    name: "Vanta Grand Sideboard",
    category: "storage",
    subcategory: "Sideboards & Buffets",
    price: 42999,
    originalPrice: 64999,
    discount: 34,
    rating: 4.8,
    reviews: 215,
    image: "https://i.postimg.cc/prYDB0cB/1-1.png",
    images: [
      "https://i.postimg.cc/prYDB0cB/1-1.png",
      "https://i.postimg.cc/1XcpKW74/2.png",
      "https://i.postimg.cc/B6F5jZxh/3.png"
    ],
    color: "Matte Black",
    material: "Engineered Wood",
    dimensions: "W 210 × D 45 × H 85 cm",
    weight: "65 kg",
    warranty: "2 Years",
    badge: "Bestseller",
    description: "The Vanta Grand Sideboard offers expansive storage with a sleek, modern aesthetic. Its clean lines and matte black finish make it a statement piece in dining or living areas.",
    features: [
      "Four spacious cabinets",
      "Soft-close hinges",
      "Adjustable shelves",
      "Integrated cable management"
    ]
  },
  {
    id: 12,
    slug: "koda-horizon-sideboard",
    name: "Koda Horizon Sideboard",
    category: "storage",
    subcategory: "Sideboards & Buffets",
    price: 38999,
    originalPrice: 57999,
    discount: 33,
    rating: 4.7,
    reviews: 178,
    image: "https://i.postimg.cc/qRxQvMc8/1-2.png",
    images: [
      "https://i.postimg.cc/qRxQvMc8/1-2.png",
      "https://i.postimg.cc/mrM8KSPs/2.png",
      "https://i.postimg.cc/0Q0Zy2GG/3.png"
    ],
    color: "Natural Oak",
    material: "Solid Wood",
    dimensions: "W 180 × D 42 × H 80 cm",
    weight: "58 kg",
    warranty: "2 Years",
    badge: "New",
    description: "Warm oak and clean Scandinavian design define the Koda Horizon. It brings organic texture and ample storage to your home, with a light, airy presence.",
    features: [
      "Solid oak frame",
      "Three drawers + two cabinets",
      "Satin nickel handles",
      "Adjustable feet"
    ]
  },
  {
    id: 13,
    slug: "lyra-glow-highboard",
    name: "Lyra Glow Highboard",
    category: "storage",
    subcategory: "Cabinets",
    price: 35999,
    originalPrice: 52999,
    discount: 32,
    rating: 4.6,
    reviews: 142,
    image: "https://i.postimg.cc/SK4FjjFx/1.png",
    images: [
      "https://i.postimg.cc/SK4FjjFx/1.png",
      "https://i.postimg.cc/BnHfqHy4/1-5.png",
      "https://i.postimg.cc/25xpWmrX/3.png"
    ],
    color: "Warm Grey",
    material: "Engineered Wood",
    dimensions: "W 120 × D 40 × H 145 cm",
    weight: "48 kg",
    warranty: "1 Year",
    badge: null,
    description: "Tall and graceful, the Lyra Glow Highboard offers vertical storage without occupying much floor space. Ideal for living rooms or bedrooms, it combines closed storage with open shelving.",
    features: [
      "Two cabinets + two open shelves",
      "LED strip ready (back panel cutouts)",
      "Smooth gliding doors",
      "Anti-tip wall strap included"
    ]
  },
  {
    id: 14,
    slug: "nero-linear-buffet",
    name: "Nero Linear Buffet",
    category: "storage",
    subcategory: "Buffets & Sideboards",
    price: 40999,
    originalPrice: 61999,
    discount: 34,
    rating: 4.8,
    reviews: 203,
    image: "https://i.postimg.cc/sg1TVr07/1-7.png",
    images: [
      "https://i.postimg.cc/sg1TVr07/1-7.png",
      "https://i.postimg.cc/dt5WP1n8/2.png",
      "https://i.postimg.cc/g2rgYWBg/3.png"
    ],
    color: "Black Oak",
    material: "Solid Wood",
    dimensions: "W 160 × D 40 × H 78 cm",
    weight: "55 kg",
    warranty: "2 Years",
    badge: "Bestseller",
    description: "The Nero Linear Buffet exudes understated luxury with its black oak veneer and linear grain. Perfect for formal dining rooms, it offers sophisticated storage.",
    features: [
      "Black oak veneer",
      "Four push-to-open doors",
      "Internal drawers",
      "Brushed metal legs"
    ]
  },
  {
    id: 15,
    slug: "alba-pure-server",
    name: "Alba Pure Server",
    category: "storage",
    subcategory: "Servers",
    price: 37999,
    originalPrice: 56999,
    discount: 33,
    rating: 4.7,
    reviews: 131,
    image: "https://i.postimg.cc/QxcT1nKr/1-8.png",
    images: [
      "https://i.postimg.cc/QxcT1nKr/1-8.png",
      "https://i.postimg.cc/DZWWZCK2/2.png",
      "https://i.postimg.cc/C1ZZ1vVR/3.png"
    ],
    color: "White Gloss",
    material: "Engineered Wood",
    dimensions: "W 175 × D 45 × H 90 cm",
    weight: "52 kg",
    warranty: "1 Year",
    badge: "New",
    description: "Crisp white and gleaming, the Alba Pure Server brings a fresh, modern touch. Its high-gloss finish reflects light, making spaces feel larger and brighter.",
    features: [
      "High-gloss lacquer finish",
      "Soft-close doors and drawers",
      "Stainless steel handles",
      "Adjustable shelf heights"
    ]
  },
  {
    id: 16,
    slug: "mora-wide-cabinet",
    name: "Mora Wide Cabinet",
    category: "storage",
    subcategory: "Cabinets",
    price: 32999,
    originalPrice: 48999,
    discount: 33,
    rating: 4.5,
    reviews: 117,
    image: "https://i.postimg.cc/x8rkhKNX/1.png",
    images: [
      "https://i.postimg.cc/x8rkhKNX/1.png",
      "https://i.postimg.cc/hvFJ69Qx/2.png",
      "https://i.postimg.cc/nr8sgv99/3.png"
    ],
    color: "Walnut",
    material: "Engineered Wood",
    dimensions: "W 140 × D 40 × H 110 cm",
    weight: "46 kg",
    warranty: "1 Year",
    badge: null,
    description: "With its wide stance and rich walnut finish, the Mora Cabinet provides ample storage for media, books, or collectibles. A versatile piece for any room.",
    features: [
      "Two large cabinets",
      "One drawer",
      "Cutouts for cable routing",
      "Sturdy composite wood"
    ]
  },
  {
    id: 17,
    slug: "eon-vista-display-cabinet",
    name: "Eon Vista Display Cabinet",
    category: "storage",
    subcategory: "Display Cabinets",
    price: 44999,
    originalPrice: 67999,
    discount: 34,
    rating: 4.8,
    reviews: 156,
    image: "https://i.postimg.cc/bNZ6PP5W/2.png",
    images: [
      "https://i.postimg.cc/bNZ6PP5W/2.png",
      "https://i.postimg.cc/3RLBMfFW/2-1.png",
      "https://i.postimg.cc/fbN5Y9R1/3.png"
    ],
    color: "Clear Glass / Oak",
    material: "Glass & Wood",
    dimensions: "W 65 × D 38 × H 200 cm",
    weight: "48 kg",
    warranty: "2 Years",
    badge: "Trending",
    description: "Showcase your treasures in the Eon Vista Display Cabinet. Tempered glass shelves and integrated lighting highlight your collectibles, while the oak frame adds warmth.",
    features: [
      "Tempered glass sides and shelves",
      "Integrated LED lighting",
      "Lockable doors",
      "Adjustable shelf heights"
    ]
  },
  {
    id: 18,
    slug: "soma-gallery-sideboard",
    name: "Soma Gallery Sideboard",
    category: "storage",
    subcategory: "Sideboards",
    price: 39999,
    originalPrice: 59999,
    discount: 33,
    rating: 4.6,
    reviews: 144,
    image: "https://i.postimg.cc/SxsMXLCp/1.png",
    images: [
      "https://i.postimg.cc/SxsMXLCp/1.png",
      "https://i.postimg.cc/KzXksdWp/2-4.png",
      "https://i.postimg.cc/bwB21G9X/3.png"
    ],
    color: "Natural Oak",
    material: "Solid Wood",
    dimensions: "W 200 × D 45 × H 85 cm",
    weight: "62 kg",
    warranty: "2 Years",
    badge: "Bestseller",
    description: "The Soma Gallery Sideboard blends mid-century charm with contemporary storage. Its rhythmic wood grain and tapered legs make it a focal point in any dining room.",
    features: [
      "Solid oak construction",
      "Four drawers + two cabinets",
      "Brass-finished pulls",
      "Recessed plinth base"
    ]
  },

  // ===== Coffee Tables =====
  {
    id: 19,
    slug: "flux-motion-coffee-table",
    name: "Flux Motion Coffee Table",
    category: "living",
    subcategory: "Coffee Tables",
    price: 24999,
    originalPrice: 36999,
    discount: 32,
    rating: 4.7,
    reviews: 211,
    image: "https://i.postimg.cc/85C390rJ/1.png",
    images: [
      "https://i.postimg.cc/85C390rJ/1.png",
      "https://i.postimg.cc/76Qckn3x/2-5.png",
      "https://i.postimg.cc/JhMScnr2/3.png"
    ],
    color: "Matte Black",
    material: "Metal & Glass",
    dimensions: "W 100 × D 60 × H 42 cm",
    weight: "28 kg",
    warranty: "2 Years",
    badge: "New",
    description: "Sleek and sculptural, the Flux Motion Coffee Table features a black steel frame and a clear glass top, creating an illusion of lightness. Perfect for contemporary living rooms.",
    features: [
      "Powder-coated steel frame",
      "Tempered glass top",
      "Open base for easy cleaning",
      "Floor-protecting glides"
    ]
  },
  {
    id: 20,
    slug: "rune-midi-display-cabinet",
    name: "Rune Midi Display Cabinet",
    category: "storage",
    subcategory: "Display Cabinets",
    price: 31999,
    originalPrice: 47999,
    discount: 33,
    rating: 4.5,
    reviews: 89,
    image: "https://i.postimg.cc/7LVmxZnZ/1.png",
    images: [
      "https://i.postimg.cc/7LVmxZnZ/1.png",
      "https://i.postimg.cc/Pq42t5Qv/3.png",
      "https://i.postimg.cc/GpQqcmxB/8-2.png"
    ],
    color: "Light Oak",
    material: "Engineered Wood",
    dimensions: "W 95 × D 40 × H 130 cm",
    weight: "42 kg",
    warranty: "1 Year",
    badge: null,
    description: "The Rune Midi Display Cabinet offers a perfect balance of open display and concealed storage. Its light oak finish brightens any room while showcasing your favorite items.",
    features: [
      "Two glass doors + two drawers",
      "Adjustable glass shelves",
      "Satin nickel hardware",
      "Anti-tip safety strap"
    ]
  },
  {
    id: 21,
    slug: "axis-bridge-coffee-table",
    name: "Axis Bridge Coffee Table",
    category: "living",
    subcategory: "Coffee Tables",
    price: 27999,
    originalPrice: 41999,
    discount: 33,
    rating: 4.6,
    reviews: 167,
    image: "https://i.postimg.cc/fTgxfgws/1.png",
    images: [
      "https://i.postimg.cc/fTgxfgws/1.png",
      "https://i.postimg.cc/gkBvHBYF/3.png",
      "https://i.postimg.cc/g2C8fXXM/3-2.png"
    ],
    color: "Walnut",
    material: "Solid Wood",
    dimensions: "W 110 × D 65 × H 40 cm",
    weight: "32 kg",
    warranty: "2 Years",
    badge: "Bestseller",
    description: "Solid and substantial, the Axis Bridge Coffee Table features a thick walnut top and a minimalist base. It anchors your seating area with timeless appeal.",
    features: [
      "Solid walnut top",
      "Steel rod base",
      "Under-shelf for magazines",
      "Non-marking feet"
    ]
  },
  {
    id: 22,
    slug: "stark-pillar-display-cabinet",
    name: "Stark Pillar Display Cabinet",
    category: "storage",
    subcategory: "Display Cabinets",
    price: 36999,
    originalPrice: 54999,
    discount: 33,
    rating: 4.7,
    reviews: 112,
    image: "https://i.postimg.cc/7YjXK7b3/1.png",
    images: [
      "https://i.postimg.cc/7YjXK7b3/1.png",
      "https://i.postimg.cc/NfZbdTL1/3.png",
      "https://i.postimg.cc/X7txsFXc/8-9.png"
    ],
    color: "Black / Brass",
    material: "Metal & Glass",
    dimensions: "W 60 × D 40 × H 195 cm",
    weight: "45 kg",
    warranty: "2 Years",
    badge: "New",
    description: "Tall and dramatic, the Stark Pillar Display Cabinet is a vertical gallery. Its black frame and brass accents create a striking contrast, perfect for showcasing art pieces.",
    features: [
      "Black metal frame",
      "Brass-finished shelves",
      "Tempered glass panels",
      "LED lighting ready"
    ]
  },
  {
    id: 23,
    slug: "plat-low-coffee-table",
    name: "Plat Low Coffee Table",
    category: "living",
    subcategory: "Coffee Tables",
    price: 21999,
    originalPrice: 32999,
    discount: 33,
    rating: 4.5,
    reviews: 98,
    image: "https://i.postimg.cc/hG4QFL42/2.png",
    images: [
      "https://i.postimg.cc/hG4QFL42/2.png",
      "https://i.postimg.cc/MTvcHzQR/3.png",
      "https://i.postimg.cc/7ZnJQs4z/4-5.png"
    ],
    color: "Light Grey",
    material: "Engineered Wood",
    dimensions: "W 120 × D 70 × H 35 cm",
    weight: "27 kg",
    warranty: "1 Year",
    badge: null,
    description: "Low and wide, the Plat Low Coffee Table keeps your living room feeling open and airy. Its soft grey finish blends with any palette, and the spacious top is perfect for entertaining.",
    features: [
      "Low profile design",
      "Sturdy composite wood",
      "Rounded corners for safety",
      "Easy assembly"
    ]
  },
  {
    id: 24,
    slug: "tusk-float-coffee-table",
    name: "Tusk Float Coffee Table",
    category: "living",
    subcategory: "Coffee Tables",
    price: 25999,
    originalPrice: 38999,
    discount: 33,
    rating: 4.6,
    reviews: 134,
    image: "https://i.postimg.cc/VN3w9whC/2.png",
    images: [
      "https://i.postimg.cc/VN3w9whC/2.png",
      "https://i.postimg.cc/cJVW7WzH/3.png",
      "https://i.postimg.cc/s2tzPzLx/5-2.png"
    ],
    color: "Natural Oak",
    material: "Solid Wood",
    dimensions: "W 120 × D 60 × H 38 cm",
    weight: "29 kg",
    warranty: "2 Years",
    badge: "Trending",
    description: "With its floating top and tapered legs, the Tusk Float Coffee Table appears to hover. Solid oak construction ensures durability while maintaining an elegant, light look.",
    features: [
      "Solid oak top and legs",
      "Open lower shelf",
      "Hand-finished oil coating",
      "Hidden joinery"
    ]
  },

  // ===== Dining Table =====
  {
    id: 25,
    slug: "mono-block-dining-table",
    name: "Mono Block Dining Table",
    category: "dining",
    subcategory: "Dining Tables",
    price: 58999,
    originalPrice: 84999,
    discount: 31,
    rating: 4.8,
    reviews: 243,
    image: "https://i.postimg.cc/htXPV2G5/2.png",
    images: [
      "https://i.postimg.cc/htXPV2G5/2.png",
      "https://i.postimg.cc/BbNQByDk/1.png",
      "https://i.postimg.cc/wvQ69PWB/5-5.png"
    ],
    color: "Matte Black",
    material: "Engineered Wood",
    dimensions: "W 180 × D 95 × H 76 cm",
    weight: "68 kg",
    warranty: "2 Years",
    badge: "Bestseller",
    description: "The Mono Block Dining Table makes a bold statement with its monolithic form and deep matte finish. Generously sized, it seats six to eight comfortably, ideal for gatherings.",
    features: [
      "Thick, slab-style top",
      "Matte lacquer finish",
      "Pedestal base for leg room",
      "Scratch-resistant surface"
    ]
  },

  // ===== Display Cabinet (Lora Lite) =====
  {
    id: 26,
    slug: "lora-lite-display-cabinet",
    name: "Lora Lite Display Cabinet",
    category: "storage",
    subcategory: "Display Cabinets",
    price: 29999,
    originalPrice: 44999,
    discount: 33,
    rating: 4.6,
    reviews: 78,
    image: "https://i.postimg.cc/7LVmxZnZ/1.png",
    images: [
      "https://i.postimg.cc/7LVmxZnZ/1.png",
      "https://i.postimg.cc/Pq42t5Qv/3.png",
      "https://i.postimg.cc/GpQqcmxB/8-2.png"
    ],
    color: "Light Oak",
    material: "Engineered Wood",
    dimensions: "W 90 × D 40 × H 130 cm",
    weight: "38 kg",
    warranty: "1 Year",
    badge: "New",
    description: "Light and airy, the Lora Lite Display Cabinet offers an elegant way to display your cherished items. Its slim profile fits easily in tight spaces while adding warmth.",
    features: [
      "Glass front door",
      "Two adjustable shelves",
      "One drawer at base",
      "Oak veneer finish"
    ]
  }
];

const CATEGORIES = [
  { id: "living", name: "Living Room", icon: "🪑", description: "Accent tables and coffee tables for your living space." },
  { id: "storage", name: "Storage Furniture", icon: "🗄️", description: "Sideboards, cabinets, and display units." },
  { id: "dining", name: "Dining & Kitchen", icon: "🍽️", description: "Elegant dining tables for memorable meals." }
];

const OFFERS = [
  { code: "EXTRA1000", discount: 1000, minOrder: 15000 },
  { code: "EXTRA1800", discount: 1800, minOrder: 20000 },
  { code: "EXTRA3000", discount: 3000, minOrder: 30000 },
  { code: "EXTRA5000", discount: 5000, minOrder: 75000 },
  { code: "WELCOME10", discountPercent: 10, minOrder: 0 }
];
