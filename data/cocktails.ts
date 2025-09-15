import type { Cocktail } from "@/types/cocktail"

export interface MultilingualCocktail extends Omit<Cocktail, "name" | "description" | "ingredients"> {
  name: {
    de: string
    en: string
  }
  description: {
    de: string
    en: string
  }
  ingredients: {
    de: string[]
    en: string[]
  }
}

export const multilingualCocktails: MultilingualCocktail[] = [
  {
    id: "big-john",
    name: {
      de: "Big John",
      en: "Big John",
    },
    description: {
      de: "Fruchtiger Cocktail mit Rum, Ananas und Maracuja",
      en: "Fruity cocktail with rum, pineapple and passion fruit",
    },
    image: "/images/cocktails/big_john.jpg",
    alcoholic: true,
    ingredients: {
      de: ["60ml Rum", "120ml Ananassaft", "120ml Maracujasaft", "10ml Limettensaft"],
      en: ["60ml Rum", "120ml Pineapple juice", "120ml Passion fruit juice", "10ml Lime juice"],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 60 },
      { ingredientId: "pineapple-juice", amount: 120 },
      { ingredientId: "passion-fruit-juice", amount: 120 },
      { ingredientId: "lime-juice", amount: 10 },
    ],
  },
  {
    id: "malibu-ananas",
    name: {
      de: "Malibu Ananas",
      en: "Malibu Pineapple",
    },
    description: {
      de: "Süßer Kokoslikör mit Ananassaft",
      en: "Sweet coconut liqueur with pineapple juice",
    },
    image: "/images/cocktails/malibu_ananas.jpg",
    alcoholic: true,
    ingredients: {
      de: ["80ml Malibu", "220ml Ananassaft"],
      en: ["80ml Malibu", "220ml Pineapple juice"],
    },
    recipe: [
      { ingredientId: "malibu", amount: 80 },
      { ingredientId: "pineapple-juice", amount: 220 },
    ],
  },
  {
    id: "malibu-sunrise",
    name: {
      de: "Malibu Sunrise",
      en: "Malibu Sunrise",
    },
    description: {
      de: "Kokoslikör mit Orangensaft und Grenadine",
      en: "Coconut liqueur with orange juice and grenadine",
    },
    image: "/images/cocktails/malibu_sunrise.jpg",
    alcoholic: true,
    ingredients: {
      de: ["80ml Malibu", "200ml Orangensaft", "10ml Limettensaft", "10ml Grenadine"],
      en: ["80ml Malibu", "200ml Orange juice", "10ml Lime juice", "10ml Grenadine"],
    },
    recipe: [
      { ingredientId: "malibu", amount: 80 },
      { ingredientId: "orange-juice", amount: 200 },
      { ingredientId: "lime-juice", amount: 10 },
      { ingredientId: "grenadine", amount: 10 },
    ],
  },
  {
    id: "malibu-colada",
    name: {
      de: "Malibu Colada",
      en: "Malibu Colada",
    },
    description: {
      de: "Cremiger Cocktail mit Malibu und Ananas",
      en: "Creamy cocktail with Malibu and pineapple",
    },
    image: "/images/cocktails/malibu_colada.jpg",
    alcoholic: true,
    ingredients: {
      de: ["80ml Malibu", "150ml Ananassaft", "50ml Cream of Coconut (selbst hinzufügen)"],
      en: ["80ml Malibu", "150ml Pineapple juice", "50ml Cream of Coconut (add manually)"],
    },
    recipe: [
      { ingredientId: "malibu", amount: 80 },
      { ingredientId: "pineapple-juice", amount: 150 },
      // Cream of Coconut manuell hinzufügen
    ],
  },
  {
    id: "peaches-cream",
    name: {
      de: "Peaches Cream",
      en: "Peaches Cream",
    },
    description: {
      de: "Fruchtiger Cocktail mit Pfirsichlikör und Vodka",
      en: "Fruity cocktail with peach liqueur and vodka",
    },
    image: "/images/cocktails/peaches_cream.jpg",
    alcoholic: true,
    ingredients: {
      de: ["50ml Pfirsich Likör", "40ml Vodka", "200ml Orangensaft", "20ml Grenadine"],
      en: ["50ml Peach liqueur", "40ml Vodka", "200ml Orange juice", "20ml Grenadine"],
    },
    recipe: [
      { ingredientId: "peach-liqueur", amount: 50 },
      { ingredientId: "vodka", amount: 40 },
      { ingredientId: "orange-juice", amount: 200 },
      { ingredientId: "grenadine", amount: 20 },
    ],
  },
  {
    id: "planters-punch",
    name: {
      de: "Planters Punch",
      en: "Planter's Punch",
    },
    description: {
      de: "Klassischer Rum-Cocktail mit Fruchtsäften",
      en: "Classic rum cocktail with fruit juices",
    },
    image: "/images/cocktails/planters_punch.jpg",
    alcoholic: true,
    ingredients: {
      de: ["60ml Rum", "100ml Orangensaft", "20ml Limettensaft", "10ml Grenadine", "100ml Ananassaft"],
      en: ["60ml Rum", "100ml Orange juice", "20ml Lime juice", "10ml Grenadine", "100ml Pineapple juice"],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 60 },
      { ingredientId: "orange-juice", amount: 100 },
      { ingredientId: "lime-juice", amount: 20 },
      { ingredientId: "grenadine", amount: 10 },
      { ingredientId: "pineapple-juice", amount: 100 },
    ],
  },
  {
    id: "solero",
    name: {
      de: "Solero",
      en: "Solero",
    },
    description: {
      de: "Erfrischender Cocktail mit Maracuja und Vanille",
      en: "Refreshing cocktail with passion fruit and vanilla",
    },
    image: "/images/cocktails/solero.jpg",
    alcoholic: true,
    ingredients: {
      de: ["100ml Maracujasaft", "80ml Orangensaft", "20ml Limettensaft", "20ml Vanillesirup", "60ml Vodka"],
      en: ["100ml Passion fruit juice", "80ml Orange juice", "20ml Lime juice", "20ml Vanilla syrup", "60ml Vodka"],
    },
    recipe: [
      { ingredientId: "passion-fruit-juice", amount: 100 },
      { ingredientId: "orange-juice", amount: 80 },
      { ingredientId: "lime-juice", amount: 20 },
      { ingredientId: "vanilla-syrup", amount: 20 },
      { ingredientId: "vodka", amount: 60 },
    ],
  },
  {
    id: "sex-on-the-beach",
    name: {
      de: "Sex on the Beach",
      en: "Sex on the Beach",
    },
    description: {
      de: "Beliebter Cocktail mit Vodka und Pfirsichlikör",
      en: "Popular cocktail with vodka and peach liqueur",
    },
    image: "/images/cocktails/sex_on_the_beach.jpg",
    alcoholic: true,
    ingredients: {
      de: [
        "50ml Vodka",
        "30ml Pfirsich Likör",
        "20ml Limettensaft",
        "90ml Orangensaft",
        "90ml Ananassaft",
        "20ml Grenadine",
      ],
      en: [
        "50ml Vodka",
        "30ml Peach liqueur",
        "20ml Lime juice",
        "90ml Orange juice",
        "90ml Pineapple juice",
        "20ml Grenadine",
      ],
    },
    recipe: [
      { ingredientId: "vodka", amount: 50 },
      { ingredientId: "peach-liqueur", amount: 30 },
      { ingredientId: "lime-juice", amount: 20 },
      { ingredientId: "orange-juice", amount: 90 },
      { ingredientId: "pineapple-juice", amount: 90 },
      { ingredientId: "grenadine", amount: 20 },
    ],
  },
  {
    id: "mojito",
    name: {
      de: "Mojito",
      en: "Mojito",
    },
    description: {
      de: "Klassischer Cocktail mit Rum, Limette und Minze",
      en: "Classic cocktail with rum, lime and mint",
    },
    image: "/images/cocktails/mojito.jpg",
    alcoholic: true,
    ingredients: {
      de: ["60ml Rum", "60ml Limettensaft", "100ml Sprudelwasser (manuell)", "Frische Minzblätter"],
      en: ["60ml Rum", "60ml Lime juice", "100ml Soda water (manual)", "Fresh mint leaves"],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 60 },
      { ingredientId: "lime-juice", amount: 60 },
      { ingredientId: "soda-water", amount: 100, manual: true, instructions: "100ml Sprudelwasser hinzufügen" },
      // Minze manuell hinzufügen
    ],
  },
  {
    id: "passion-colada",
    name: {
      de: "Passion Colada",
      en: "Passion Colada",
    },
    description: {
      de: "Exotischer Cocktail mit Rum, Malibu und Maracuja",
      en: "Exotic cocktail with rum, Malibu and passion fruit",
    },
    image: "/images/cocktails/passion_colada.jpg",
    alcoholic: true,
    ingredients: {
      de: ["40ml Rum", "40ml Malibu", "200ml Maracujasaft"],
      en: ["40ml Rum", "40ml Malibu", "200ml Passion fruit juice"],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 40 },
      { ingredientId: "malibu", amount: 40 },
      { ingredientId: "passion-fruit-juice", amount: 200 },
    ],
  },
  {
    id: "gin-tonic",
    name: {
      de: "Gin & Tonic",
      en: "Gin & Tonic",
    },
    description: {
      de: "Klassischer Longdrink mit Gin und Tonic Water",
      en: "Classic long drink with gin and tonic water",
    },
    image: "/images/cocktails/gin_tonic.jpg",
    alcoholic: true,
    ingredients: {
      de: ["50ml Gin", "150ml Tonic Water", "Limettenscheibe"],
      en: ["50ml Gin", "150ml Tonic water", "Lime slice"],
    },
    recipe: [
      { ingredientId: "gin", amount: 50 },
      { ingredientId: "tonic-water", amount: 150 },
    ],
  },
  {
    id: "cuba-libre",
    name: {
      de: "Cuba Libre",
      en: "Cuba Libre",
    },
    description: {
      de: "Rum-Cola mit einem Spritzer Limette",
      en: "Rum and cola with a splash of lime",
    },
    image: "/images/cocktails/cuba_libre.jpg",
    alcoholic: true,
    ingredients: {
      de: ["50ml brauner Rum", "150ml Cola", "10ml Limettensaft"],
      en: ["50ml Dark rum", "150ml Cola", "10ml Lime juice"],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 50 },
      { ingredientId: "cola", amount: 150 },
      { ingredientId: "lime-juice", amount: 10 },
    ],
  },
  {
    id: "long-island-iced-tea",
    name: {
      de: "Long Island Iced Tea",
      en: "Long Island Iced Tea",
    },
    description: {
      de: "Klassischer, starker Cocktail mit fünf verschiedenen Spirituosen und Cola",
      en: "Classic, strong cocktail with five different spirits and cola",
    },
    image: "/images/cocktails/long_island_iced_tea.jpg",
    alcoholic: true,
    ingredients: {
      de: [
        "15ml Brauner Rum",
        "15ml Triple Sec",
        "15ml Vodka",
        "15ml Tequila",
        "15ml Gin",
        "30ml Limettensaft",
        "150ml Cola (manuell)",
      ],
      en: [
        "15ml Dark rum",
        "15ml Triple Sec",
        "15ml Vodka",
        "15ml Tequila",
        "15ml Gin",
        "30ml Lime juice",
        "150ml Cola (manual)",
      ],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 15 },
      { ingredientId: "triple-sec", amount: 15 },
      { ingredientId: "vodka", amount: 15 },
      { ingredientId: "tequila", amount: 15 },
      { ingredientId: "gin", amount: 15 },
      { ingredientId: "lime-juice", amount: 30 },
      { ingredientId: "cola", amount: 150, manual: true, instructions: "150ml Cola hinzufügen" },
    ],
  },
  {
    id: "bahama-mama",
    name: {
      de: "Bahama Mama",
      en: "Bahama Mama",
    },
    description: {
      de: "Tropischer Cocktail mit Braunem Rum, Malibu und Fruchtsäften",
      en: "Tropical cocktail with dark rum, Malibu and fruit juices",
    },
    image: "/images/cocktails/bahama_mama.jpg",
    alcoholic: true,
    ingredients: {
      de: [
        "50ml Brauner Rum",
        "40ml Malibu",
        "80ml Orangensaft",
        "80ml Ananassaft",
        "20ml Limettensaft",
        "20ml Grenadine",
      ],
      en: [
        "50ml Dark rum",
        "40ml Malibu",
        "80ml Orange juice",
        "80ml Pineapple juice",
        "20ml Lime juice",
        "20ml Grenadine",
      ],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 50 },
      { ingredientId: "malibu", amount: 40 },
      { ingredientId: "orange-juice", amount: 80 },
      { ingredientId: "pineapple-juice", amount: 80 },
      { ingredientId: "lime-juice", amount: 20 },
      { ingredientId: "grenadine", amount: 20 },
    ],
  },
  {
    id: "swimming-pool",
    name: {
      de: "Swimming Pool",
      en: "Swimming Pool",
    },
    description: {
      de: "Blauer, tropischer Cocktail mit Vodka und Ananassaft",
      en: "Blue, tropical cocktail with vodka and pineapple juice",
    },
    image: "/images/cocktails/swimming_pool.jpg",
    alcoholic: true,
    ingredients: {
      de: [
        "60ml Vodka",
        "30ml Blue Curacao",
        "180ml Ananassaft",
        "20ml Sahne (manuell)",
        "20ml Cream of Coconut (manuell)",
      ],
      en: [
        "60ml Vodka",
        "30ml Blue Curacao",
        "180ml Pineapple juice",
        "20ml Cream (manual)",
        "20ml Cream of Coconut (manual)",
      ],
    },
    recipe: [
      { ingredientId: "vodka", amount: 60 },
      { ingredientId: "blue-curacao", amount: 30 },
      { ingredientId: "pineapple-juice", amount: 180 },
      { ingredientId: "cream", amount: 20, manual: true, instructions: "20ml Sahne hinzufügen" },
      { ingredientId: "cream-of-coconut", amount: 20, manual: true, instructions: "20ml Cream of Coconut hinzufügen" },
    ],
  },
  {
    id: "tequila-sunrise",
    name: {
      de: "Tequila Sunrise",
      en: "Tequila Sunrise",
    },
    description: {
      de: "Klassischer Cocktail mit Tequila, Orangensaft und Grenadine",
      en: "Classic cocktail with tequila, orange juice and grenadine",
    },
    image: "/images/cocktails/tequila_sunrise.jpg",
    alcoholic: true,
    ingredients: {
      de: ["60ml Tequila", "220ml Orangensaft", "20ml Grenadine"],
      en: ["60ml Tequila", "220ml Orange juice", "20ml Grenadine"],
    },
    recipe: [
      { ingredientId: "tequila", amount: 60 },
      { ingredientId: "orange-juice", amount: 220 },
      { ingredientId: "grenadine", amount: 20 },
    ],
  },
  {
    id: "touch-down",
    name: {
      de: "Touch Down",
      en: "Touch Down",
    },
    description: {
      de: "Fruchtiger Cocktail mit Braunem Rum, Triple Sec und Maracujasaft",
      en: "Fruity cocktail with dark rum, Triple Sec and passion fruit juice",
    },
    image: "/images/cocktails/touch_down.jpg",
    alcoholic: true,
    ingredients: {
      de: ["60ml Brauner Rum", "40ml Triple Sec", "140ml Maracujasaft", "10ml Limettensaft", "20ml Grenadine"],
      en: ["60ml Dark rum", "40ml Triple Sec", "140ml Passion fruit juice", "10ml Lime juice", "20ml Grenadine"],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 60 },
      { ingredientId: "triple-sec", amount: 40 },
      { ingredientId: "passion-fruit-juice", amount: 140 },
      { ingredientId: "lime-juice", amount: 10 },
      { ingredientId: "grenadine", amount: 20 },
    ],
  },
  {
    id: "zombie",
    name: {
      de: "Zombie",
      en: "Zombie",
    },
    description: {
      de: "Starker, fruchtiger Cocktail mit Braunem Rum und verschiedenen Fruchtsäften",
      en: "Strong, fruity cocktail with dark rum and various fruit juices",
    },
    image: "/images/cocktails/zombie.jpg",
    alcoholic: true,
    ingredients: {
      de: [
        "40ml Brauner Rum",
        "30ml Triple Sec",
        "80ml Ananassaft",
        "50ml Orangensaft",
        "20ml Limettensaft",
        "50ml Maracujasaft",
        "20ml Grenadine",
      ],
      en: [
        "40ml Dark rum",
        "30ml Triple Sec",
        "80ml Pineapple juice",
        "50ml Orange juice",
        "20ml Lime juice",
        "50ml Passion fruit juice",
        "20ml Grenadine",
      ],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 40 },
      { ingredientId: "triple-sec", amount: 30 },
      { ingredientId: "pineapple-juice", amount: 80 },
      { ingredientId: "orange-juice", amount: 50 },
      { ingredientId: "lime-juice", amount: 20 },
      { ingredientId: "passion-fruit-juice", amount: 50 },
      { ingredientId: "grenadine", amount: 20 },
    ],
  },
  {
    id: "mai-tai",
    name: {
      de: "Mai Tai",
      en: "Mai Tai",
    },
    description: {
      de: "Klassischer Tiki-Cocktail mit braunem Rum und Mandelsirup",
      en: "Classic Tiki cocktail with dark rum and almond syrup",
    },
    image: "/images/cocktails/mai_tai.jpg",
    alcoholic: true,
    ingredients: {
      de: ["60ml Brauner Rum", "15ml Orangenlikör", "50ml Ananassaft", "15ml Mandelsirup", "20ml Limettensaft"],
      en: ["60ml Dark rum", "15ml Orange liqueur", "50ml Pineapple juice", "15ml Almond syrup", "20ml Lime juice"],
    },
    recipe: [
      { ingredientId: "dark-rum", amount: 60 },
      { ingredientId: "triple-sec", amount: 15 },
      { ingredientId: "pineapple-juice", amount: 50 },
      { ingredientId: "almond-syrup", amount: 15 },
      { ingredientId: "lime-juice", amount: 20 },
    ],
  },
  // Non-alcoholic cocktails
  {
    id: "tropical-sunrise",
    name: {
      de: "Tropical Sunrise",
      en: "Tropical Sunrise",
    },
    description: {
      de: "Erfrischender alkoholfreier Cocktail mit Ananas, Orange und Grenadine",
      en: "Refreshing non-alcoholic cocktail with pineapple, orange and grenadine",
    },
    image: "/images/cocktails/tropical-blend.png",
    alcoholic: false,
    ingredients: {
      de: ["120ml Ananassaft", "120ml Orangensaft", "20ml Grenadine", "10ml Limettensaft"],
      en: ["120ml Pineapple juice", "120ml Orange juice", "20ml Grenadine", "10ml Lime juice"],
    },
    recipe: [
      { ingredientId: "pineapple-juice", amount: 120 },
      { ingredientId: "orange-juice", amount: 120 },
      { ingredientId: "grenadine", amount: 20 },
      { ingredientId: "lime-juice", amount: 10 },
    ],
  },
  {
    id: "passion-fizz",
    name: {
      de: "Passion Fizz",
      en: "Passion Fizz",
    },
    description: {
      de: "Sprudelnder alkoholfreier Cocktail mit Maracuja und Sodawasser",
      en: "Sparkling non-alcoholic cocktail with passion fruit and soda water",
    },
    image: "/images/cocktails/vibrant-passion-fizz.png",
    alcoholic: false,
    ingredients: {
      de: ["150ml Maracujasaft", "100ml Sprudelwasser (manuell)", "20ml Vanillesirup", "10ml Limettensaft"],
      en: ["150ml Passion fruit juice", "100ml Soda water (manual)", "20ml Vanilla syrup", "10ml Lime juice"],
    },
    recipe: [
      { ingredientId: "passion-fruit-juice", amount: 150 },
      { ingredientId: "soda-water", amount: 100, manual: true, instructions: "100ml Sprudelwasser hinzufügen" },
      { ingredientId: "vanilla-syrup", amount: 20 },
      { ingredientId: "lime-juice", amount: 10 },
    ],
  },
  {
    id: "orange-vanilla-dream",
    name: {
      de: "Orange Vanilla Dream",
      en: "Orange Vanilla Dream",
    },
    description: {
      de: "Cremiger alkoholfreier Cocktail mit Orange und Vanille",
      en: "Creamy non-alcoholic cocktail with orange and vanilla",
    },
    image: "/images/cocktails/palm-glow.png",
    alcoholic: false,
    ingredients: {
      de: ["200ml Orangensaft", "30ml Vanillesirup", "70ml Sprudelwasser (manuell)"],
      en: ["200ml Orange juice", "30ml Vanilla syrup", "70ml Soda water (manual)"],
    },
    recipe: [
      { ingredientId: "orange-juice", amount: 200 },
      { ingredientId: "vanilla-syrup", amount: 30 },
      { ingredientId: "soda-water", amount: 70, manual: true, instructions: "70ml Sprudelwasser hinzufügen" },
    ],
  },
  {
    id: "citrus-splash",
    name: {
      de: "Citrus Splash",
      en: "Citrus Splash",
    },
    description: {
      de: "Fruchtiger alkoholfreier Cocktail mit Grenadine und Zitrusfrüchten",
      en: "Fruity non-alcoholic cocktail with grenadine and citrus fruits",
    },
    image: "/images/cocktails/citrus-splash.png",
    alcoholic: false,
    ingredients: {
      de: [
        "30ml Grenadine",
        "100ml Orangensaft",
        "100ml Ananassaft",
        "20ml Limettensaft",
        "50ml Sprudelwasser (manuell)",
      ],
      en: [
        "30ml Grenadine",
        "100ml Orange juice",
        "100ml Pineapple juice",
        "20ml Lime juice",
        "50ml Soda water (manual)",
      ],
    },
    recipe: [
      { ingredientId: "grenadine", amount: 30 },
      { ingredientId: "orange-juice", amount: 100 },
      { ingredientId: "pineapple-juice", amount: 100 },
      { ingredientId: "lime-juice", amount: 20 },
      { ingredientId: "soda-water", amount: 50, manual: true, instructions: "50ml Sprudelwasser hinzufügen" },
    ],
  },
  {
    id: "pineapple-passion",
    name: {
      de: "Pineapple Passion",
      en: "Pineapple Passion",
    },
    description: {
      de: "Exotischer alkoholfreier Cocktail mit Ananas und Maracuja",
      en: "Exotic non-alcoholic cocktail with pineapple and passion fruit",
    },
    image: "/images/cocktails/refreshing-citrus-cooler.png",
    alcoholic: false,
    ingredients: {
      de: ["150ml Ananassaft", "100ml Maracujasaft", "15ml Limettensaft", "15ml Vanillesirup"],
      en: ["150ml Pineapple juice", "100ml Passion fruit juice", "15ml Lime juice", "15ml Vanilla syrup"],
    },
    recipe: [
      { ingredientId: "pineapple-juice", amount: 150 },
      { ingredientId: "passion-fruit-juice", amount: 100 },
      { ingredientId: "lime-juice", amount: 15 },
      { ingredientId: "vanilla-syrup", amount: 15 },
    ],
  },
  {
    id: "citrus-cooler",
    name: {
      de: "Citrus Cooler",
      en: "Citrus Cooler",
    },
    description: {
      de: "Erfrischender alkoholfreier Cocktail mit Limette und Sodawasser",
      en: "Refreshing non-alcoholic cocktail with lime and soda water",
    },
    image: "/images/cocktails/citrus-swirl-sunset.png",
    alcoholic: false,
    ingredients: {
      de: ["40ml Limettensaft", "20ml Vanillesirup", "200ml Sprudelwasser (manuell)", "10ml Grenadine"],
      en: ["40ml Lime juice", "20ml Vanilla syrup", "200ml Soda water (manual)", "10ml Grenadine"],
    },
    recipe: [
      { ingredientId: "lime-juice", amount: 40 },
      { ingredientId: "vanilla-syrup", amount: 20 },
      { ingredientId: "soda-water", amount: 200, manual: true, instructions: "200ml Sprudelwasser hinzufügen" },
      { ingredientId: "grenadine", amount: 10 },
    ],
  },
  {
    id: "tropical-sunset",
    name: {
      de: "Tropical Sunset",
      en: "Tropical Sunset",
    },
    description: {
      de: "Schöner Farbverlauf mit Ananas, Orange und Grenadine",
      en: "Beautiful color gradient with pineapple, orange and grenadine",
    },
    image: "/images/cocktails/tropical-sunset.png",
    alcoholic: false,
    ingredients: {
      de: ["120ml Ananassaft", "80ml Orangensaft", "15ml Grenadine"],
      en: ["120ml Pineapple juice", "80ml Orange juice", "15ml Grenadine"],
    },
    recipe: [
      { ingredientId: "pineapple-juice", amount: 120 },
      { ingredientId: "orange-juice", amount: 80 },
      { ingredientId: "grenadine", amount: 15 },
    ],
    manualIngredients: [
      {
        name: "Eiswürfel",
        amount: "200g",
        instruction: "Glas zur Hälfte mit Eis füllen",
      },
      {
        name: "Orangenscheibe",
        amount: "1 Scheibe",
        instruction: "Als Garnitur am Glasrand",
      },
    ],
  },
  {
    id: "pineapple-lime-fizz",
    name: {
      de: "Pineapple Lime Fizz",
      en: "Pineapple Lime Fizz",
    },
    description: {
      de: "Erfrischender Cocktail mit Ananas und Limette",
      en: "Refreshing cocktail with pineapple and lime",
    },
    image: "/images/cocktails/pineapple-lime-fizz.png",
    alcoholic: false,
    ingredients: {
      de: ["150ml Ananassaft", "30ml Limettensaft", "10ml Vanillesirup"],
      en: ["150ml Pineapple juice", "30ml Lime juice", "10ml Vanilla syrup"],
    },
    recipe: [
      { ingredientId: "pineapple-juice", amount: 150 },
      { ingredientId: "lime-juice", amount: 30 },
      { ingredientId: "vanilla-syrup", amount: 10 },
    ],
    manualIngredients: [
      {
        name: "Sprudelwasser",
        amount: "50ml",
        instruction: "Zum Auffüllen und für den Fizz-Effekt",
      },
      {
        name: "Limettenscheibe",
        amount: "1 Scheibe",
        instruction: "Als Garnitur",
      },
    ],
  },
  {
    id: "passion-paradise",
    name: {
      de: "Passion Paradise",
      en: "Passion Paradise",
    },
    description: {
      de: "Exotischer Cocktail mit Maracuja und tropischen Früchten",
      en: "Exotic cocktail with passion fruit and tropical fruits",
    },
    image: "/images/cocktails/passion-paradise.png",
    alcoholic: false,
    ingredients: {
      de: ["100ml Maracujasaft", "80ml Ananassaft", "40ml Orangensaft", "15ml Mandelsirup"],
      en: ["100ml Passion fruit juice", "80ml Pineapple juice", "40ml Orange juice", "15ml Almond syrup"],
    },
    recipe: [
      { ingredientId: "passion-fruit-juice", amount: 100 },
      { ingredientId: "pineapple-juice", amount: 80 },
      { ingredientId: "orange-juice", amount: 40 },
      { ingredientId: "almond-syrup", amount: 15 },
    ],
    manualIngredients: [
      {
        name: "Crushed Ice",
        amount: "150g",
        instruction: "Für tropisches Feeling",
      },
      {
        name: "Maracuja-Fruchtfleisch",
        amount: "1 TL",
        instruction: "Als Topping obendrauf",
      },
    ],
  },
  {
    id: "vanilla-orange-dream",
    name: {
      de: "Vanilla Orange Dream",
      en: "Vanilla Orange Dream",
    },
    description: {
      de: "Cremiger Traum mit Vanille und Orange",
      en: "Creamy dream with vanilla and orange",
    },
    image: "/images/cocktails/vanilla-orange-dream.png",
    alcoholic: false,
    ingredients: {
      de: ["120ml Orangensaft", "60ml Ananassaft", "25ml Vanillesirup", "10ml Limettensaft"],
      en: ["120ml Orange juice", "60ml Pineapple juice", "25ml Vanilla syrup", "10ml Lime juice"],
    },
    recipe: [
      { ingredientId: "orange-juice", amount: 120 },
      { ingredientId: "pineapple-juice", amount: 60 },
      { ingredientId: "vanilla-syrup", amount: 25 },
      { ingredientId: "lime-juice", amount: 10 },
    ],
    manualIngredients: [
      {
        name: "Sahne",
        amount: "20ml",
        instruction: "Vorsichtig obendrauf gießen für Schichteffekt",
      },
      {
        name: "Orangenzest",
        amount: "1 Prise",
        instruction: "Als aromatisches Topping",
      },
    ],
  },
  {
    id: "grenadine-sunrise",
    name: {
      de: "Grenadine Sunrise",
      en: "Grenadine Sunrise",
    },
    description: {
      de: "Wunderschöner Sonnenaufgang im Glas",
      en: "Beautiful sunrise in a glass",
    },
    image: "/images/cocktails/grenadine-sunrise.png",
    alcoholic: false,
    ingredients: {
      de: ["100ml Orangensaft", "80ml Ananassaft", "20ml Grenadine", "10ml Limettensaft"],
      en: ["100ml Orange juice", "80ml Pineapple juice", "20ml Grenadine", "10ml Lime juice"],
    },
    recipe: [
      { ingredientId: "orange-juice", amount: 100 },
      { ingredientId: "pineapple-juice", amount: 80 },
      { ingredientId: "grenadine", amount: 20 },
      { ingredientId: "lime-juice", amount: 10 },
    ],
    manualIngredients: [
      {
        name: "Eiswürfel",
        amount: "200g",
        instruction: "Glas komplett mit Eis füllen",
      },
      {
        name: "Grenadine extra",
        amount: "5ml",
        instruction: "Langsam am Glasrand hinunterlaufen lassen für Sunrise-Effekt",
      },
    ],
  },
  {
    id: "almond-citrus-cooler",
    name: {
      de: "Almond Citrus Cooler",
      en: "Almond Citrus Cooler",
    },
    description: {
      de: "Erfrischender Mandel-Zitrus Mix",
      en: "Refreshing almond-citrus mix",
    },
    image: "/images/cocktails/almond-citrus-cooler.png",
    alcoholic: false,
    ingredients: {
      de: ["80ml Orangensaft", "40ml Limettensaft", "60ml Ananassaft", "20ml Mandelsirup"],
      en: ["80ml Orange juice", "40ml Lime juice", "60ml Pineapple juice", "20ml Almond syrup"],
    },
    recipe: [
      { ingredientId: "orange-juice", amount: 80 },
      { ingredientId: "lime-juice", amount: 40 },
      { ingredientId: "pineapple-juice", amount: 60 },
      { ingredientId: "almond-syrup", amount: 20 },
    ],
    manualIngredients: [
      {
        name: "Sprudelwasser",
        amount: "80ml",
        instruction: "Zum Auffüllen für den Cooler-Effekt",
      },
      {
        name: "Mandelsplitter",
        amount: "1 TL",
        instruction: "Als Garnitur obendrauf streuen",
      },
    ],
  },
]

export const cocktails: Cocktail[] = multilingualCocktails.map((cocktail) => ({
  ...cocktail,
  name: cocktail.name.de,
  description: cocktail.description.de,
  ingredients: cocktail.ingredients.de,
}))

export function getCocktailsByLanguage(language: "de" | "en"): Cocktail[] {
  return multilingualCocktails.map((cocktail) => ({
    ...cocktail,
    name: cocktail.name[language],
    description: cocktail.description[language],
    ingredients: cocktail.ingredients[language],
  }))
}
