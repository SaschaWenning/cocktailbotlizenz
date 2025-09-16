"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Language = "de" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  de: {
    // Navigation & Menu
    "nav.cocktails": "Cocktails",
    "nav.ingredients": "Zutaten",
    "nav.service": "Service",
    "nav.settings": "Einstellungen",

    // Service Menu
    "service.title": "Servicemenü",
    "service.calibrate": "Kalibrieren",
    "service.clean": "Reinigen",
    "service.language": "Sprache",
    "service.maintenance": "Wartung",
    "service.diagnostics": "Diagnose",
    "service.locked": "Servicemenü gesperrt",
    "service.enter_password": "Bitte geben Sie das Passwort ein, um auf das Servicemenü zuzugreifen.",
    "service.unlock": "Entsperren",
    "service.lock": "Sperren",
    "service.new_recipe": "Neues Rezept erstellen",
    "service.restore_levels": "Füllstände wiederherstellen",
    "service.restore_levels_description":
      "Lade gespeicherte Füllstände aus der Datei und überschreibe die aktuellen Werte.",
    "service.restoring": "Wiederherstellen...",
    "service.restore_from_file": "Aus Datei wiederherstellen",

    // Language Selection
    "language.title": "Sprache auswählen",
    "language.german": "Deutsch",
    "language.english": "English",
    "language.current": "Aktuelle Sprache",

    // Cocktails
    "cocktails.title": "Cocktails",
    "cocktails.make": "Zubereiten",
    "cocktails.ingredients": "Zutaten",
    "cocktails.instructions": "Anleitung",
    "cocktails.making": "Cocktail wird zubereitet...",
    "cocktails.ready": "Cocktail ist fertig!",
    "cocktails.error": "Fehler bei der Zubereitung",
    "cocktails.no_cocktails": "Keine Cocktails gefunden.",
    "cocktails.alcoholic": "Alkoholisch",
    "cocktails.non_alcoholic": "Alkoholfrei",

    // Ingredients & Levels
    "ingredients.title": "Zutaten",
    "ingredients.levels_title": "Füllstände",
    "ingredients.level": "Füllstand",
    "ingredients.container": "Behältergröße",
    "ingredients.empty": "Leer",
    "ingredients.low": "Niedrig",
    "ingredients.medium": "Mittel",
    "ingredients.high": "Hoch",
    "ingredients.full": "Voll",
    "ingredients.ml": "ml",
    "ingredients.save": "Speichern",
    "ingredients.cancel": "Abbrechen",
    "ingredients.edit": "Bearbeiten",
    "ingredients.edit_level": "Füllstand bearbeiten",
    "ingredients.edit_size": "Behältergröße bearbeiten",
    "ingredients.edit_ingredient": "Zutat bearbeiten",
    "ingredients.refresh": "Aktualisieren",
    "ingredients.reset_all": "Alle zurücksetzen",
    "ingredients.updated": "Aktualisiert",

    // Calibration
    "calibration.title": "CocktailBot Pumpenkalibrierung",
    "calibration.description":
      "Kalibriere jede Pumpe, indem du sie für 2 Sekunden laufen lässt, die geförderte Menge in ml misst und den Wert einträgst.",
    "calibration.start": "Kalibrierung starten",
    "calibration.stop": "Stoppen",
    "calibration.pump": "Pumpe",
    "calibration.time": "Zeit (s)",
    "calibration.volume": "Volumen (ml)",
    "calibration.save": "Speichern",
    "calibration.running": "Kalibrierung läuft...",
    "calibration.calibrate": "Kalibrieren",
    "calibration.enable": "Aktivieren",
    "calibration.disable": "Deaktivieren",
    "calibration.reload_config": "Konfiguration neu laden",
    "calibration.save_config": "Konfiguration speichern",
    "calibration.saving": "Speichern...",
    "calibration.success": "Pumpenkonfiguration erfolgreich gespeichert!",
    "calibration.enter_amount": "Gemessene Menge eingeben",
    "calibration.enter_amount_description": "Bitte gib die gemessene Menge für Pumpe {pump} ein:",
    "calibration.amount_ml": "Menge in ml",
    "calibration.select_ingredient": "Zutat wählen",

    // Cleaning
    "cleaning.title": "Pumpenreinigung",
    "cleaning.auto_title": "Automatische Pumpenreinigung",
    "cleaning.manual_title": "Manuelle Pumpenreinigung",
    "cleaning.auto_description": "Reinige alle Pumpen nacheinander mit warmem Wasser und Spülmittel",
    "cleaning.manual_description": "Reinige einzelne Pumpen manuell (10 Sekunden pro Pumpe)",
    "cleaning.start": "Automatische Reinigung starten",
    "cleaning.stop": "Stoppen",
    "cleaning.all": "Alle Pumpen",
    "cleaning.individual": "Einzelne Pumpe",
    "cleaning.duration": "Dauer",
    "cleaning.running": "Reinigung läuft...",
    "cleaning.preparation": "Vorbereitung:",
    "cleaning.preparation_steps":
      "1. Stelle einen Behälter mit warmem Wasser und etwas Spülmittel bereit.\n2. Lege die Ansaugschläuche aller Pumpen in diesen Behälter.\n3. Stelle einen leeren Auffangbehälter unter die Ausgänge.",
    "cleaning.preparing": "Vorbereitung der Reinigung...",
    "cleaning.preparing_description": "Stelle sicher, dass alle Schläuche korrekt positioniert sind.",
    "cleaning.complete": "Automatische Reinigung abgeschlossen!",
    "cleaning.important": "Wichtig:",
    "cleaning.rinse_note": "Spüle die Pumpen nun mit klarem Wasser nach, um Spülmittelreste zu entfernen.",
    "cleaning.reset": "Zurücksetzen",
    "cleaning.cancel": "Abbrechen",
    "cleaning.pump_cleaning": "Reinige Pumpe {pump}...",
    "cleaning.pumps_done": "{done} von {total} Pumpen gereinigt",
    "cleaning.manual_note":
      "Klicke auf eine Pumpe um sie einzeln für 10 Sekunden zu reinigen. Stelle sicher, dass der Ansaugschlauch der jeweiligen Pumpe im Reinigungswasser liegt.",
    "cleaning.pump_running": "Pumpe {pump} wird gereinigt...",
    "cleaning.pumps_running": "{count} Pumpen werden gereinigt...",

    // Common
    "common.start": "Start",
    "common.stop": "Stopp",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.edit": "Bearbeiten",
    "common.delete": "Löschen",
    "common.confirm": "Bestätigen",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.finish": "Fertig",
    "common.loading": "Laden...",
    "common.error": "Fehler",
    "common.success": "Erfolgreich",
    "common.warning": "Warnung",
    "common.info": "Information",
    "common.debug": "Debug",

    // Recipe names (German)
    "recipe.mojito": "Mojito",
    "recipe.cuba_libre": "Cuba Libre",
    "recipe.pina_colada": "Piña Colada",
    "recipe.sex_on_the_beach": "Sex on the Beach",
    "recipe.tequila_sunrise": "Tequila Sunrise",
    "recipe.blue_lagoon": "Blue Lagoon",
    "recipe.cosmopolitan": "Cosmopolitan",
    "recipe.mai_tai": "Mai Tai",

    // Ingredient names (German)
    "ingredient.rum": "Rum",
    "ingredient.vodka": "Wodka",
    "ingredient.tequila": "Tequila",
    "ingredient.gin": "Gin",
    "ingredient.whiskey": "Whiskey",
    "ingredient.lime_juice": "Limettensaft",
    "ingredient.lemon_juice": "Zitronensaft",
    "ingredient.orange_juice": "Orangensaft",
    "ingredient.cranberry_juice": "Cranberrysaft",
    "ingredient.pineapple_juice": "Ananassaft",
    "ingredient.coconut_cream": "Kokosnusscreme",
    "ingredient.grenadine": "Grenadine",
    "ingredient.blue_curacao": "Blue Curaçao",
    "ingredient.triple_sec": "Triple Sec",
    "ingredient.simple_syrup": "Zuckersirup",
    "ingredient.mint": "Minze",
    "ingredient.soda_water": "Sodawasser",
    "ingredient.cola": "Cola",
    "ingredient.tonic_water": "Tonic Water",
  },
  en: {
    // Navigation & Menu
    "nav.cocktails": "Cocktails",
    "nav.ingredients": "Ingredients",
    "nav.service": "Service",
    "nav.settings": "Settings",

    // Service Menu
    "service.title": "Service Menu",
    "service.calibrate": "Calibrate",
    "service.clean": "Clean",
    "service.language": "Language",
    "service.maintenance": "Maintenance",
    "service.diagnostics": "Diagnostics",
    "service.locked": "Service menu locked",
    "service.enter_password": "Please enter the password to access the service menu.",
    "service.unlock": "Unlock",
    "service.lock": "Lock",
    "service.new_recipe": "Create New Recipe",
    "service.restore_levels": "Restore Fill Levels",
    "service.restore_levels_description": "Load saved fill levels from file and overwrite current values.",
    "service.restoring": "Restoring...",
    "service.restore_from_file": "Restore from File",

    // Language Selection
    "language.title": "Select Language",
    "language.german": "Deutsch",
    "language.english": "English",
    "language.current": "Current Language",

    // Cocktails
    "cocktails.title": "Cocktails",
    "cocktails.make": "Make",
    "cocktails.ingredients": "Ingredients",
    "cocktails.instructions": "Instructions",
    "cocktails.making": "Making cocktail...",
    "cocktails.ready": "Cocktail is ready!",
    "cocktails.error": "Error making cocktail",
    "cocktails.no_cocktails": "No cocktails found.",
    "cocktails.alcoholic": "Alcoholic",
    "cocktails.non_alcoholic": "Non-Alcoholic",

    // Ingredients & Levels
    "ingredients.title": "Ingredients",
    "ingredients.levels_title": "Fill Levels",
    "ingredients.level": "Level",
    "ingredients.container": "Container Size",
    "ingredients.empty": "Empty",
    "ingredients.low": "Low",
    "ingredients.medium": "Medium",
    "ingredients.high": "High",
    "ingredients.full": "Full",
    "ingredients.ml": "ml",
    "ingredients.save": "Save",
    "ingredients.cancel": "Cancel",
    "ingredients.edit": "Edit",
    "ingredients.edit_level": "Edit Fill Level",
    "ingredients.edit_size": "Edit Container Size",
    "ingredients.edit_ingredient": "Edit Ingredient",
    "ingredients.refresh": "Refresh",
    "ingredients.reset_all": "Reset All",
    "ingredients.updated": "Updated",

    // Calibration
    "calibration.title": "CocktailBot Pump Calibration",
    "calibration.description":
      "Calibrate each pump by running it for 2 seconds, measuring the dispensed amount in ml, and entering the value.",
    "calibration.start": "Start Calibration",
    "calibration.stop": "Stop",
    "calibration.pump": "Pump",
    "calibration.time": "Time (s)",
    "calibration.volume": "Volume (ml)",
    "calibration.save": "Save",
    "calibration.running": "Calibration running...",
    "calibration.calibrate": "Calibrate",
    "calibration.enable": "Enable",
    "calibration.disable": "Disable",
    "calibration.reload_config": "Reload Configuration",
    "calibration.save_config": "Save Configuration",
    "calibration.saving": "Saving...",
    "calibration.success": "Pump configuration saved successfully!",
    "calibration.enter_amount": "Enter Measured Amount",
    "calibration.enter_amount_description": "Please enter the measured amount for pump {pump}:",
    "calibration.amount_ml": "Amount in ml",
    "calibration.select_ingredient": "Select Ingredient",

    // Cleaning
    "cleaning.title": "Pump Cleaning",
    "cleaning.auto_title": "Automatic Pump Cleaning",
    "cleaning.manual_title": "Manual Pump Cleaning",
    "cleaning.auto_description": "Clean all pumps sequentially with warm water and detergent",
    "cleaning.manual_description": "Clean individual pumps manually (10 seconds per pump)",
    "cleaning.start": "Start Automatic Cleaning",
    "cleaning.stop": "Stop",
    "cleaning.all": "All Pumps",
    "cleaning.individual": "Individual Pump",
    "cleaning.duration": "Duration",
    "cleaning.running": "Cleaning running...",
    "cleaning.preparation": "Preparation:",
    "cleaning.preparation_steps":
      "1. Prepare a container with warm water and some detergent.\n2. Place all pump intake tubes in this container.\n3. Place an empty collection container under the outlets.",
    "cleaning.preparing": "Preparing cleaning...",
    "cleaning.preparing_description": "Make sure all tubes are positioned correctly.",
    "cleaning.complete": "Automatic cleaning completed!",
    "cleaning.important": "Important:",
    "cleaning.rinse_note": "Now rinse the pumps with clean water to remove detergent residue.",
    "cleaning.reset": "Reset",
    "cleaning.cancel": "Cancel",
    "cleaning.pump_cleaning": "Cleaning pump {pump}...",
    "cleaning.pumps_done": "{done} of {total} pumps cleaned",
    "cleaning.manual_note":
      "Click on a pump to clean it individually for 10 seconds. Make sure the intake tube of the respective pump is in the cleaning water.",
    "cleaning.pump_running": "Pump {pump} is being cleaned...",
    "cleaning.pumps_running": "{count} pumps are being cleaned...",

    // Common
    "common.start": "Start",
    "common.stop": "Stop",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.next": "Next",
    "common.finish": "Finish",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.warning": "Warning",
    "common.info": "Information",
    "common.debug": "Debug",

    // Recipe names (English)
    "recipe.mojito": "Mojito",
    "recipe.cuba_libre": "Cuba Libre",
    "recipe.pina_colada": "Piña Colada",
    "recipe.sex_on_the_beach": "Sex on the Beach",
    "recipe.tequila_sunrise": "Tequila Sunrise",
    "recipe.blue_lagoon": "Blue Lagoon",
    "recipe.cosmopolitan": "Cosmopolitan",
    "recipe.mai_tai": "Mai Tai",

    // Ingredient names (English)
    "ingredient.rum": "Rum",
    "ingredient.vodka": "Vodka",
    "ingredient.tequila": "Tequila",
    "ingredient.gin": "Gin",
    "ingredient.whiskey": "Whiskey",
    "ingredient.lime_juice": "Lime Juice",
    "ingredient.lemon_juice": "Lemon Juice",
    "ingredient.orange_juice": "Orange Juice",
    "ingredient.cranberry_juice": "Cranberry Juice",
    "ingredient.pineapple_juice": "Pineapple Juice",
    "ingredient.coconut_cream": "Coconut Cream",
    "ingredient.grenadine": "Grenadine",
    "ingredient.blue_curacao": "Blue Curaçao",
    "ingredient.triple_sec": "Triple Sec",
    "ingredient.simple_syrup": "Simple Syrup",
    "ingredient.mint": "Mint",
    "ingredient.soda_water": "Soda Water",
    "ingredient.cola": "Cola",
    "ingredient.tonic_water": "Tonic Water",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("cocktailbot-language") as Language
    if (savedLanguage && (savedLanguage === "de" || savedLanguage === "en")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("cocktailbot-language", lang)
    // Update HTML lang attribute
    document.documentElement.lang = lang
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key

    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value))
      })
    }

    return translation
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
