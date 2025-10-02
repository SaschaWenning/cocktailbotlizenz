export interface CocktailPreparationLog {
  id: string
  cocktailId: string
  cocktailName: string
  size: number
  timestamp: string
  ingredients: {
    ingredientId: string
    amount: number
  }[]
}

export interface CocktailStatistics {
  cocktailId: string
  cocktailName: string
  preparationCount: number
  totalVolume: number
  lastPrepared: string
}

export interface IngredientConsumption {
  ingredientId: string
  ingredientName: string
  totalAmount: number
  usageCount: number
}

export interface IngredientPrice {
  ingredientId: string
  pricePerLiter: number
}

export interface StatisticsData {
  logs: CocktailPreparationLog[]
  cocktailStats: CocktailStatistics[]
  ingredientConsumption: IngredientConsumption[]
  ingredientPrices: IngredientPrice[]
}
