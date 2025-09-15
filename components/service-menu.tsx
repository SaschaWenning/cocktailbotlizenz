"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Settings, Download } from "lucide-react"
import PumpCleaning from "@/components/pump-cleaning"
import PumpVenting from "@/components/pump-venting"
import PumpCalibration from "@/components/pump-calibration"
import IngredientLevels from "@/components/ingredient-levels"
import PasswordSettings from "@/components/password-settings"
import { IngredientManager } from "@/components/ingredient-manager"
import TabConfigSettings from "@/components/tab-config-settings"
import CocktailGrid from "@/components/cocktail-grid"
import ShotSelector from "@/components/shot-selector"
import RecipeCreator from "@/components/recipe-creator"
import HiddenCocktailsManager from "@/components/hidden-cocktails-manager"
import PasswordModal from "@/components/password-modal" // Import PasswordModal component
import LanguageSettings from "@/components/language-settings" // Import LanguageSettings Komponente
import { restoreIngredientLevelsFromFile } from "@/lib/ingredient-level-service"
import { useLanguage } from "@/lib/i18n" // Import useLanguage hook
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
  const { t } = useLanguage() // Add translation hook
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [activeServiceTab, setActiveServiceTab] = useState("")
  const [tabConfig, setTabConfig] = useState<AppConfig | null>(null)
  const [serviceTabs, setServiceTabs] = useState<string[]>([])
  const [restoring, setRestoring] = useState(false)

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
          "hidden-cocktails",
          "language",
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

  const handleRestoreClick = async () => {
    try {
      setRestoring(true)
      await restoreIngredientLevelsFromFile()
      // optional: toast/notification „Wiederhergestellt"
    } catch (e) {
      console.error(e) // optional: Fehler-Toast
    } finally {
      setRestoring(false)
    }
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
            <h3 className="text-xl font-semibold text-[hsl(var(--cocktail-text))]">{t.newRecipe}</h3>
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
        return <PumpVenting pumpConfig={pumpConfig} />
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
          <div className="space-y-6">
            <PasswordSettings />
            <div className="bg-[hsl(var(--cocktail-card-bg))] rounded-xl p-6 border border-[hsl(var(--cocktail-card-border))]">
              <h3 className="text-lg font-semibold text-[hsl(var(--cocktail-text))] mb-4">{t.restoreFromFile}</h3>
              <p className="text-[hsl(var(--cocktail-text-muted))] mb-4">
                {t.language === "en"
                  ? "Load saved fill levels from file and overwrite current values."
                  : "Lade gespeicherte Füllstände aus der Datei und überschreibe die aktuellen Werte."}
              </p>
              <Button
                onClick={handleRestoreClick}
                disabled={restoring}
                className="bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black font-semibold"
              >
                <Download className="h-4 w-4 mr-2" />
                {restoring ? t.restoring : t.restoreFromFile}
              </Button>
            </div>
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
          </div>
        )
      case "hidden-cocktails":
      case "ausgeblendete-cocktails":
        return (
          <HiddenCocktailsManager
            onClose={() => {
              const firstTab = serviceTabs.length > 0 ? serviceTabs[0] : "levels"
              setActiveServiceTab(firstTab)
            }}
          />
        )
      case "language":
      case "sprache":
        return (
          <LanguageSettings
            onClose={() => {
              const firstTab = serviceTabs.length > 0 ? serviceTabs[0] : "levels"
              setActiveServiceTab(firstTab)
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

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Lock className="h-16 w-16 text-[hsl(var(--cocktail-text-muted))]" />
        <h2 className="text-2xl font-bold text-[hsl(var(--cocktail-text))]">{t.serviceLocked}</h2>
        <p className="text-[hsl(var(--cocktail-text-muted))] text-center">{t.passwordRequired}</p>
        <Button
          onClick={handleUnlockClick}
          className="bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black font-semibold px-8 py-3"
        >
          <Lock className="h-4 w-4 mr-2" />
          {t.unlock}
        </Button>

        {showPasswordModal && (
          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={handlePasswordSuccess}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[hsl(var(--cocktail-text))]">{t.serviceMenu}</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveServiceTab("settings")}
            className="bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))]"
          >
            <Settings className="h-4 w-4 mr-2" />
            {t.settings}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsUnlocked(false)}
            className="bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))]"
          >
            <Lock className="h-4 w-4 mr-2" />
            {t.lock}
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
