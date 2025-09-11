"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Settings } from "lucide-react"
import PumpCleaning from "@/components/pump-cleaning"
import PumpCalibration from "@/components/pump-calibration"
import IngredientLevels from "@/components/ingredient-levels"
import QuickShotSelector from "@/components/quick-shot-selector"
import PasswordModal from "@/components/password-modal"
import { IngredientManager } from "@/components/ingredient-manager"
import TabConfigSettings from "@/components/tab-config-settings"
import CocktailGrid from "@/components/cocktail-grid"
import ShotSelector from "@/components/shot-selector"
import RecipeCreator from "@/components/recipe-creator"
import type { AppConfig } from "@/lib/tab-config"
import type { PumpConfig } from "@/types/pump"
import type { IngredientLevel } from "@/types/ingredient-level"
import type { Cocktail } from "@/types/cocktail"

interface ServiceMenuProps {
  pumpConfig: PumpConfig[]
  ingredientLevels: IngredientLevel[]
  onLevelsUpdated: () => void
  onConfigUpdate: () => void
  onShotComplete: () => void
  availableIngredients: string[]
  cocktails?: Cocktail[]
  onCocktailSelect?: (cocktailId: string) => void
  onImageEditClick?: (cocktailId: string) => void
  onDeleteCocktail?: (cocktailId: string) => void
  onNewRecipe?: (cocktail: any) => void
  onTabConfigReload?: () => void
}

export default function ServiceMenu({
  pumpConfig,
  ingredientLevels,
  onLevelsUpdated,
  onConfigUpdate,
  onShotComplete,
  availableIngredients,
  cocktails = [],
  onCocktailSelect,
  onImageEditClick,
  onDeleteCocktail,
  onNewRecipe,
  onTabConfigReload,
}: ServiceMenuProps) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [activeServiceTab, setActiveServiceTab] = useState("")
  const [tabConfig, setTabConfig] = useState<AppConfig | null>(null)
  const [serviceTabs, setServiceTabs] = useState<string[]>([])

  useEffect(() => {
    const loadTabConfig = async () => {
      try {
        const response = await fetch("/api/tab-config")
        if (!response.ok) throw new Error("Failed to load tab config")

        const config: AppConfig = await response.json()
        const serviceTabIds = config.tabs.filter((tab) => tab.location === "service").map((tab) => tab.id)

        setTabConfig(config)
        setServiceTabs(serviceTabIds)

        if (serviceTabIds.length > 0 && !activeServiceTab) {
          const nonPasswordTabs = config.tabs.filter((tab) => tab.location === "service" && !tab.passwordProtected)

          if (nonPasswordTabs.length > 0) {
            setActiveServiceTab(nonPasswordTabs[0].id)
          } else if (serviceTabIds.includes("levels")) {
            setActiveServiceTab("levels")
          } else {
            setActiveServiceTab(serviceTabIds[0])
          }
        }
      } catch (error) {
        console.error("[v0] Error loading service tab config:", error)
        // Fallback to default tabs if config loading fails
        setServiceTabs([
          "levels",
          "venting",
          "cleaning",
          "calibration",
          "ingredients",
          "cocktails",
          "virgin",
          "shots",
          "recipe-creator",
        ])
        setActiveServiceTab("levels")
      }
    }

    loadTabConfig()
  }, [activeServiceTab])

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false)
    setIsUnlocked(true)
  }

  const handleUnlockClick = () => {
    setShowPasswordModal(true)
  }

  if (!isUnlocked) {
    return (
      <>
        <div className="text-center py-12">
          <div className="bg-[hsl(var(--cocktail-card-bg))] rounded-2xl p-8 max-w-md mx-auto shadow-2xl border border-[hsl(var(--cocktail-card-border))]">
            <Lock className="h-16 w-16 mx-auto mb-6 text-[hsl(var(--cocktail-warning))]" />
            <h2 className="text-2xl font-semibold mb-4 text-[hsl(var(--cocktail-text))]">
              Servicemenü ist passwortgeschützt
            </h2>
            <p className="text-[hsl(var(--cocktail-text-muted))] mb-6 leading-relaxed">
              Bitte gib das Passwort ein, um das Servicemenü zu öffnen.
            </p>
            <Button
              onClick={handleUnlockClick}
              className="bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black font-semibold py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Passwort eingeben
            </Button>
          </div>
        </div>

        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordSuccess}
        />
      </>
    )
  }

  const renderServiceContent = () => {
    switch (activeServiceTab) {
      case "cocktails":
        return (
          <CocktailGrid
            cocktails={cocktails.filter((c) => c.alcoholic)}
            onCocktailSelect={(cocktail) => onCocktailSelect?.(cocktail.id)}
            onImageEditClick={(cocktail) => onImageEditClick?.(cocktail.id)}
            onDeleteCocktail={onDeleteCocktail}
          />
        )
      case "virgin":
        return (
          <CocktailGrid
            cocktails={cocktails.filter((c) => !c.alcoholic)}
            onCocktailSelect={(cocktail) => onCocktailSelect?.(cocktail.id)}
            onImageEditClick={(cocktail) => onImageEditClick?.(cocktail.id)}
            onDeleteCocktail={onDeleteCocktail}
          />
        )
      case "shots":
        return (
          <ShotSelector pumpConfig={pumpConfig} ingredientLevels={ingredientLevels} onShotComplete={onShotComplete} />
        )
      case "recipe-creator":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[hsl(var(--cocktail-text))]">Neues Rezept erstellen</h3>
            <RecipeCreator
              isOpen={true}
              asTab={true}
              onClose={() => {
                const firstTab = serviceTabs.length > 0 ? serviceTabs[0] : "levels"
                setActiveServiceTab(firstTab)
              }}
              onSave={(cocktail) => {
                onNewRecipe?.(cocktail)
                const firstTab = serviceTabs.length > 0 ? serviceTabs[0] : "levels"
                setActiveServiceTab(firstTab)
              }}
            />
          </div>
        )
      case "venting":
      case "entlueften":
        return (
          <QuickShotSelector
            pumpConfig={pumpConfig}
            ingredientLevels={ingredientLevels}
            onShotComplete={onShotComplete}
          />
        )
      case "levels":
      case "fuellstaende":
        return <IngredientLevels pumpConfig={pumpConfig} onLevelsUpdated={onLevelsUpdated} />
      case "cleaning":
      case "reinigung":
        return <PumpCleaning pumpConfig={pumpConfig} />
      case "calibration":
      case "kalibrierung":
        return <PumpCalibration pumpConfig={pumpConfig} onConfigUpdate={onConfigUpdate} />
      case "ingredients":
      case "zutaten":
        return (
          <IngredientManager
            onClose={() => {
              // Set to first available service tab or fallback
              const firstTab = serviceTabs.length > 0 ? serviceTabs[0] : "levels"
              setActiveServiceTab(firstTab)
            }}
          />
        )
      case "settings":
      case "einstellungen":
        return (
          <TabConfigSettings
            onClose={() => {
              const firstTab = serviceTabs.length > 0 ? serviceTabs[0] : "levels"
              setActiveServiceTab(firstTab)
              // Reload tab config in parent component
              onTabConfigReload?.()
              // Reload local service menu config
              const loadTabConfig = async () => {
                try {
                  const response = await fetch("/api/tab-config")
                  if (!response.ok) throw new Error("Failed to load tab config")

                  const config: AppConfig = await response.json()
                  const serviceTabIds = config.tabs.filter((tab) => tab.location === "service").map((tab) => tab.id)

                  setTabConfig(config)
                  setServiceTabs(serviceTabIds)
                } catch (error) {
                  console.error("[v0] Error reloading service tab config:", error)
                }
              }
              loadTabConfig()
            }}
          />
        )
      default:
        return null
    }
  }

  const renderServiceTabButton = (tabId: string, tabName: string) => (
    <Button
      key={tabId}
      onClick={() => setActiveServiceTab(tabId)}
      className={`flex-1 py-1.5 px-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm ${
        activeServiceTab === tabId
          ? "bg-[#00ff00] text-black scale-105"
          : "bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] hover:bg-[hsl(var(--cocktail-card-border))] hover:scale-102"
      }`}
    >
      {tabName}
    </Button>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[hsl(var(--cocktail-text))]">Servicemenü</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveServiceTab("settings")}
            className="bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))]"
          >
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsUnlocked(false)}
            className="bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))]"
          >
            <Lock className="h-4 w-4 mr-2" />
            Sperren
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <nav className="service-tabs-list">
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {tabConfig &&
              serviceTabs.map((tabId) => {
                const tab = tabConfig.tabs.find((t) => t.id === tabId)
                return tab ? renderServiceTabButton(tab.id, tab.name) : null
              })}
          </div>
        </nav>
      </div>

      <div className="min-h-[60vh]">{renderServiceContent()}</div>
    </div>
  )
}
