import type { Ingredient } from "@/types/pump"

export interface MultilingualIngredient extends Omit<Ingredient, "name"> {
  name: {
    de: string
    en: string
  }
}

export const multilingualIngredients: MultilingualIngredient[] = [
  // Alkoholische Getränke - Spirituosen
  { id: "white-rum", name: { de: "Weißer Rum", en: "White Rum" }, alcoholic: true },
  { id: "dark-rum", name: { de: "Brauner Rum", en: "Dark Rum" }, alcoholic: true },
  { id: "spiced-rum", name: { de: "Gewürzrum", en: "Spiced Rum" }, alcoholic: true },
  { id: "gin", name: { de: "Gin", en: "Gin" }, alcoholic: true },
  { id: "vodka", name: { de: "Vodka", en: "Vodka" }, alcoholic: true },
  { id: "tequila", name: { de: "Tequila", en: "Tequila" }, alcoholic: true },
  { id: "whiskey", name: { de: "Whiskey", en: "Whiskey" }, alcoholic: true },
  { id: "bourbon", name: { de: "Bourbon", en: "Bourbon" }, alcoholic: true },
  { id: "scotch", name: { de: "Scotch Whisky", en: "Scotch Whisky" }, alcoholic: true },
  { id: "brandy", name: { de: "Brandy", en: "Brandy" }, alcoholic: true },
  { id: "cognac", name: { de: "Cognac", en: "Cognac" }, alcoholic: true },
  { id: "apricot-brandy", name: { de: "Aprikosen Brandy", en: "Apricot Brandy" }, alcoholic: true },
  { id: "melon-liqueur", name: { de: "Melonenlikör", en: "Melon Liqueur" }, alcoholic: true },

  // Alkoholische Getränke - Liköre
  { id: "malibu", name: { de: "Malibu", en: "Malibu" }, alcoholic: true },
  { id: "peach-liqueur", name: { de: "Pfirsich Likör", en: "Peach Liqueur" }, alcoholic: true },
  { id: "blue-curacao", name: { de: "Blue Curacao", en: "Blue Curacao" }, alcoholic: true },
  { id: "triple-sec", name: { de: "Triple Sec", en: "Triple Sec" }, alcoholic: true },
  { id: "cointreau", name: { de: "Cointreau", en: "Cointreau" }, alcoholic: true },
  { id: "grand-marnier", name: { de: "Grand Marnier", en: "Grand Marnier" }, alcoholic: true },
  { id: "amaretto", name: { de: "Amaretto", en: "Amaretto" }, alcoholic: true },
  { id: "kahlua", name: { de: "Kahlúa", en: "Kahlúa" }, alcoholic: true },
  { id: "baileys", name: { de: "Baileys", en: "Baileys" }, alcoholic: true },
  { id: "sambuca", name: { de: "Sambuca", en: "Sambuca" }, alcoholic: true },
  { id: "jagermeister", name: { de: "Jägermeister", en: "Jägermeister" }, alcoholic: true },
  { id: "midori", name: { de: "Midori", en: "Midori" }, alcoholic: true },
  { id: "chambord", name: { de: "Chambord", en: "Chambord" }, alcoholic: true },
  { id: "frangelico", name: { de: "Frangelico", en: "Frangelico" }, alcoholic: true },
  { id: "pitu", name: { de: "Pitu", en: "Pitu" }, alcoholic: true },

  // Alkoholische Getränke - Wein
  { id: "white-wine", name: { de: "Weißwein", en: "White Wine" }, alcoholic: true },
  { id: "red-wine", name: { de: "Rotwein", en: "Red Wine" }, alcoholic: true },
  { id: "rose-wine", name: { de: "Rosé", en: "Rosé Wine" }, alcoholic: true },
  { id: "port-wine", name: { de: "Portwein", en: "Port Wine" }, alcoholic: true },
  { id: "sherry", name: { de: "Sherry", en: "Sherry" }, alcoholic: true },

  // Alkoholische Getränke - Vermouth & Aperitifs
  { id: "dry-vermouth", name: { de: "Trockener Vermouth", en: "Dry Vermouth" }, alcoholic: true },
  { id: "sweet-vermouth", name: { de: "Süßer Vermouth", en: "Sweet Vermouth" }, alcoholic: true },
  { id: "campari", name: { de: "Campari", en: "Campari" }, alcoholic: true },
  { id: "aperol", name: { de: "Aperol", en: "Aperol" }, alcoholic: true },

  // Nicht-alkoholische Getränke - Fruchtsäfte
  { id: "orange-juice", name: { de: "Orangensaft", en: "Orange Juice" }, alcoholic: false },
  { id: "apple-juice", name: { de: "Apfelsaft", en: "Apple Juice" }, alcoholic: false },
  { id: "pineapple-juice", name: { de: "Ananassaft", en: "Pineapple Juice" }, alcoholic: false },
  { id: "cranberry-juice", name: { de: "Cranberrysaft", en: "Cranberry Juice" }, alcoholic: false },
  { id: "grapefruit-juice", name: { de: "Grapefruitsaft", en: "Grapefruit Juice" }, alcoholic: false },
  { id: "tomato-juice", name: { de: "Tomatensaft", en: "Tomato Juice" }, alcoholic: false },
  { id: "grape-juice", name: { de: "Traubensaft", en: "Grape Juice" }, alcoholic: false },
  { id: "passion-fruit-juice", name: { de: "Maracujasaft", en: "Passion Fruit Juice" }, alcoholic: false },
  { id: "mango-juice", name: { de: "Mangosaft", en: "Mango Juice" }, alcoholic: false },
  { id: "peach-juice", name: { de: "Pfirsichsaft", en: "Peach Juice" }, alcoholic: false },
  { id: "cherry-juice", name: { de: "Kirschsaft", en: "Cherry Juice" }, alcoholic: false },
  { id: "pomegranate-juice", name: { de: "Granatapfelsaft", en: "Pomegranate Juice" }, alcoholic: false },
  { id: "banana-juice", name: { de: "Bananensaft", en: "Banana Juice" }, alcoholic: false },

  // Nicht-alkoholische Getränke - Zitrusfrüchte
  { id: "lime-juice", name: { de: "Limettensaft", en: "Lime Juice" }, alcoholic: false },
  { id: "lemon-juice", name: { de: "Zitronensaft", en: "Lemon Juice" }, alcoholic: false },

  // Nicht-alkoholische Getränke - Kohlensäurehaltige Getränke
  { id: "cola", name: { de: "Cola", en: "Cola" }, alcoholic: false },
  { id: "fanta", name: { de: "Fanta", en: "Fanta" }, alcoholic: false },
  { id: "soda-water", name: { de: "Sprudelwasser", en: "Soda Water" }, alcoholic: false },
  { id: "ginger-ale", name: { de: "Ginger Ale", en: "Ginger Ale" }, alcoholic: false },
  { id: "tonic-water", name: { de: "Tonic Water", en: "Tonic Water" }, alcoholic: false },
  { id: "water", name: { de: "Wasser", en: "Water" }, alcoholic: false },

  // Nicht-alkoholische Getränke - Milchprodukte
  { id: "cream", name: { de: "Sahne", en: "Cream" }, alcoholic: false },
  { id: "coconut-cream", name: { de: "Kokossahne", en: "Coconut Cream" }, alcoholic: false },
  { id: "coconut-milk", name: { de: "Kokosmilch", en: "Coconut Milk" }, alcoholic: false },
  { id: "creme-of-coconut", name: { de: "Creme of Coconut", en: "Cream of Coconut" }, alcoholic: false },
  { id: "milk", name: { de: "Milch", en: "Milk" }, alcoholic: false },

  // Sirupe
  { id: "sugar-syrup", name: { de: "Zuckersirup", en: "Sugar Syrup" }, alcoholic: false },
  { id: "vanilla-syrup", name: { de: "Vanillesirup", en: "Vanilla Syrup" }, alcoholic: false },
  { id: "almond-syrup", name: { de: "Mandelsirup", en: "Almond Syrup" }, alcoholic: false },
  { id: "grenadine", name: { de: "Grenadine", en: "Grenadine" }, alcoholic: false },
  { id: "honey-syrup", name: { de: "Honigsirup", en: "Honey Syrup" }, alcoholic: false },
  { id: "maple-syrup", name: { de: "Ahornsirup", en: "Maple Syrup" }, alcoholic: false },
  { id: "caramel-syrup", name: { de: "Karamellsirup", en: "Caramel Syrup" }, alcoholic: false },
  { id: "chocolate-syrup", name: { de: "Schokoladensirup", en: "Chocolate Syrup" }, alcoholic: false },
  { id: "banana-syrup", name: { de: "Bananensirup", en: "Banana Syrup" }, alcoholic: false },
  { id: "melon-syrup", name: { de: "Melonensirup", en: "Melon Syrup" }, alcoholic: false },
  { id: "mango-syrup", name: { de: "Mangosirup", en: "Mango Syrup" }, alcoholic: false },
]

export const ingredients: Ingredient[] = multilingualIngredients.map((ingredient) => ({
  ...ingredient,
  name: ingredient.name.de,
}))

export function getIngredientsByLanguage(language: "de" | "en"): Ingredient[] {
  return multilingualIngredients.map((ingredient) => ({
    ...ingredient,
    name: ingredient.name[language],
  }))
}

export function getIngredientName(ingredientId: string, language: "de" | "en"): string {
  const ingredient = multilingualIngredients.find((ing) => ing.id === ingredientId)
  return ingredient ? ingredient.name[language] : ingredientId
}
