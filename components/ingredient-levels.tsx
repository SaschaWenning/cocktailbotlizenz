import { getIngredientLevels } from "@/lib/ingredient-service"
import IngredientLevelsClient from "./ingredient-levels-client"
import type { PumpConfig } from "@/types/pump-config"

interface IngredientLevelsProps {
  pumpConfig: PumpConfig[]
  onLevelsUpdated?: () => void
}

export default async function IngredientLevels({ pumpConfig, onLevelsUpdated }: IngredientLevelsProps) {
  const levels = await getIngredientLevels()

  return <IngredientLevelsClient initialLevels={levels} />
}
