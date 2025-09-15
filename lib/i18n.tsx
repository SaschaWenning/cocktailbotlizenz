"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "de" | "en"

export interface Translations {
  // Navigation
  cocktails: string
  virgin: string
  shots: string
  service: string

  // Service Menu
  serviceMenu: string
  serviceLocked: string
  unlock: string
  lock: string
  settings: string

  // Service Tabs
  levels: string
  ingredients: string
  calibration: string
  cleaning: string
  venting: string
  recipeCreator: string
  hiddenCocktails: string
  language: string

  // Common Actions
  save: string
  cancel: string
  edit: string
  delete: string
  close: string
  back: string
  next: string
  confirm: string
  ok: string
  yes: string
  no: string

  // Ingredient Levels
  ingredientLevels: string
  containerSize: string
  currentLevel: string
  editContainerSize: string
  editCurrentLevel: string
  restoreFromFile: string
  restoring: string

  // Pump Operations
  pumpCleaning: string
  pumpCalibration: string
  pumpVenting: string
  startCleaning: string
  startCalibration: string
  startVenting: string

  // Recipe Creator
  newRecipe: string
  recipeName: string
  alcoholic: string
  nonAlcoholic: string
  addIngredient: string
  name: string
  description: string
  imagePath: string
  cocktailNamePlaceholder: string
  cocktailDescriptionPlaceholder: string
  imagePathPlaceholder: string
  cocktailSizes: string
  enterMl: string
  automatic: string
  manual: string
  enterName: string
  enterDescription: string
  enterImagePath: string
  enterAmount: string
  enterInstruction: string
  enterNewSize: string
  inputPlaceholder: string
  nameRequired: string
  imagePathRequired: string
  errorSaving: string
  instructionPlaceholder: string

  // Ingredient Manager
  manageIngredients: string
  addNewIngredient: string
  ingredientName: string
  ingredientPlaceholder: string
  customIngredients: string
  errorLoadingIngredients: string
  errorSavingIngredients: string
  enterIngredientName: string

  // Language Settings
  languageSettings: string
  selectLanguage: string
  german: string
  english: string

  // Messages
  passwordRequired: string
  enterPassword: string
  configSaved: string
  errorLoading: string
  wrongPassword: string
  passwordRequiredEdit: string
  passwordRequiredDelete: string
  deleteConfirmation: string
  actionCannotBeUndone: string

  // Shot Selector
  selectShot: string
  makeShot: string
  shotSize: string

  // Cocktail Grid
  noCocktailsFound: string
  searchCocktails: string

  // Virtual Keyboard
  clear: string
  backspace: string
  space: string

  // Tab Configuration
  tabConfiguration: string
  configureTabArrangement: string
  mainNavigation: string
  serviceMenuTabs: string
  howItWorks: string
  noTabsInMain: string
  noTabsInService: string
  unsavedChanges: string
  clickSaveToApply: string
  cannotBeMoved: string
  toMainNavigation: string
  toServiceMenu: string
  legend: string
  loading: string
  oneMoreMoment: string
  errorLoadingConfig: string
  tryAgain: string
  saving: string
  standard: string
  tabs: string
  password: string
}

export const translations: Record<Language, Translations> = {
  de: {
    // Navigation
    cocktails: "Cocktails",
    virgin: "Alkoholfrei",
    shots: "Shots",
    service: "Servicemenü",

    // Service Menu
    serviceMenu: "Servicemenü",
    serviceLocked: "Servicemenü gesperrt",
    unlock: "Entsperren",
    lock: "Sperren",
    settings: "Einstellungen",

    // Service Tabs
    levels: "Füllstände",
    ingredients: "Zutaten",
    calibration: "Kalibrierung",
    cleaning: "Reinigung",
    venting: "Entlüften",
    recipeCreator: "Neues Rezept",
    hiddenCocktails: "Ausgeblendete Cocktails",
    language: "Sprache",

    // Common Actions
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    close: "Schließen",
    back: "Zurück",
    next: "Weiter",
    confirm: "Bestätigen",
    ok: "OK",
    yes: "Ja",
    no: "Nein",

    // Ingredient Levels
    ingredientLevels: "Füllstände",
    containerSize: "Behältergröße",
    currentLevel: "Aktueller Füllstand",
    editContainerSize: "Behältergröße bearbeiten",
    editCurrentLevel: "Füllstand bearbeiten",
    restoreFromFile: "Aus Datei wiederherstellen",
    restoring: "Wiederherstellen...",

    // Pump Operations
    pumpCleaning: "Pumpen-Reinigung",
    pumpCalibration: "Pumpen-Kalibrierung",
    pumpVenting: "Pumpen-Entlüftung",
    startCleaning: "Reinigung starten",
    startCalibration: "Kalibrierung starten",
    startVenting: "Entlüftung starten",

    // Recipe Creator
    newRecipe: "Neues Rezept",
    recipeName: "Rezeptname",
    alcoholic: "Alkoholisch",
    nonAlcoholic: "Alkoholfrei",
    addIngredient: "Zutat hinzufügen",
    name: "Name",
    description: "Beschreibung",
    imagePath: "Bild-Pfad (optional)",
    cocktailNamePlaceholder: "Name des Cocktails",
    cocktailDescriptionPlaceholder: "Beschreibe deinen Cocktail...",
    imagePathPlaceholder: "/pfad/zum/bild.jpg",
    cocktailSizes: "Cocktailgrößen für dieses Rezept",
    enterMl: "ml eingeben",
    automatic: "Automatisch",
    manual: "Manuell",
    enterName: "Name eingeben",
    enterDescription: "Beschreibung eingeben",
    enterImagePath: "Bild-Pfad eingeben",
    enterAmount: "Menge eingeben (ml)",
    enterInstruction: "Anleitung eingeben",
    enterNewSize: "Neue Cocktailgröße eingeben (ml)",
    inputPlaceholder: "Eingabe...",
    nameRequired: "Name ist erforderlich",
    imagePathRequired: "Bild-Pfad muss mit / beginnen",
    errorSaving: "Fehler beim Speichern",
    instructionPlaceholder: "Anleitung (z.B. 'mit Eiswürfeln auffüllen')",

    // Ingredient Manager
    manageIngredients: "Zutaten verwalten",
    addNewIngredient: "Neue Zutat hinzufügen",
    ingredientName: "Name der Zutat",
    ingredientPlaceholder: "z.B. Erdbeersaft",
    customIngredients: "Ihre benutzerdefinierten Zutaten",
    errorLoadingIngredients: "Fehler beim Laden der benutzerdefinierten Zutaten:",
    errorSavingIngredients: "Fehler beim Speichern der benutzerdefinierten Zutaten:",
    enterIngredientName: "Zutatennamen eingeben",

    // Language Settings
    languageSettings: "Spracheinstellungen",
    selectLanguage: "Sprache auswählen",
    german: "Deutsch",
    english: "English",

    // Messages
    passwordRequired: "Bitte geben Sie das Passwort ein, um auf das Servicemenü zuzugreifen.",
    enterPassword: "Passwort eingeben",
    configSaved: "Konfiguration wurde erfolgreich gespeichert.",
    errorLoading: "Konfiguration konnte nicht geladen werden.",
    wrongPassword: "Falsches Passwort. Bitte versuche es erneut.",
    passwordRequiredEdit: "Bitte gib das Passwort ein, um Rezepte zu bearbeiten:",
    passwordRequiredDelete: "Bitte gib das Passwort ein, um das Löschen zu bestätigen:",
    deleteConfirmation: "Möchtest du den Cocktail wirklich löschen?",
    actionCannotBeUndone: "Diese Aktion kann nicht rückgängig gemacht werden.",

    // Shot Selector
    selectShot: "Shot auswählen",
    makeShot: "Shot zubereiten",
    shotSize: "Shot-Größe",

    // Cocktail Grid
    noCocktailsFound: "Keine Cocktails gefunden",
    searchCocktails: "Cocktails suchen",

    // Virtual Keyboard
    clear: "Löschen",
    backspace: "Rückschritt",
    space: "Leerzeichen",

    // Tab Configuration
    tabConfiguration: "Tab-Konfiguration",
    configureTabArrangement: "Konfigurieren Sie Ihre Tab-Anordnung",
    mainNavigation: "Hauptnavigation",
    serviceMenuTabs: "Servicemenü",
    howItWorks: "Wie funktioniert es?",
    noTabsInMain: "Keine Tabs in der Hauptnavigation",
    noTabsInService: "Keine Tabs im Servicemenü",
    unsavedChanges: "Sie haben ungespeicherte Änderungen.",
    clickSaveToApply: 'Klicken Sie auf "Speichern", um die Änderungen zu übernehmen.',
    cannotBeMoved: "Kann nicht verschoben werden",
    toMainNavigation: "Zur Hauptnavigation",
    toServiceMenu: "Zum Servicemenü",
    legend: "Legende",
    loading: "Konfiguration wird geladen",
    oneMoreMoment: "Einen Moment bitte...",
    errorLoadingConfig: "Fehler beim Laden",
    tryAgain: "Erneut versuchen",
    saving: "Speichert...",
    standard: "Standard",
    tabs: "Tabs",
    password: "Passwort",
  },
  en: {
    // Navigation
    cocktails: "Cocktails",
    virgin: "Non-Alcoholic",
    shots: "Shots",
    service: "Service Menu",

    // Service Menu
    serviceMenu: "Service Menu",
    serviceLocked: "Service Menu Locked",
    unlock: "Unlock",
    lock: "Lock",
    settings: "Settings",

    // Service Tabs
    levels: "Fill Levels",
    ingredients: "Ingredients",
    calibration: "Calibration",
    cleaning: "Cleaning",
    venting: "Venting",
    recipeCreator: "New Recipe",
    hiddenCocktails: "Hidden Cocktails",
    language: "Language",

    // Common Actions
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    back: "Back",
    next: "Next",
    confirm: "Confirm",
    ok: "OK",
    yes: "Yes",
    no: "No",

    // Ingredient Levels
    ingredientLevels: "Fill Levels",
    containerSize: "Container Size",
    currentLevel: "Current Level",
    editContainerSize: "Edit Container Size",
    editCurrentLevel: "Edit Fill Level",
    restoreFromFile: "Restore from File",
    restoring: "Restoring...",

    // Pump Operations
    pumpCleaning: "Pump Cleaning",
    pumpCalibration: "Pump Calibration",
    pumpVenting: "Pump Venting",
    startCleaning: "Start Cleaning",
    startCalibration: "Start Calibration",
    startVenting: "Start Venting",

    // Recipe Creator
    newRecipe: "New Recipe",
    recipeName: "Recipe Name",
    alcoholic: "Alcoholic",
    nonAlcoholic: "Non-Alcoholic",
    addIngredient: "Add Ingredient",
    name: "Name",
    description: "Description",
    imagePath: "Image Path (optional)",
    cocktailNamePlaceholder: "Cocktail name",
    cocktailDescriptionPlaceholder: "Describe your cocktail...",
    imagePathPlaceholder: "/path/to/image.jpg",
    cocktailSizes: "Cocktail sizes for this recipe",
    enterMl: "Enter ml",
    automatic: "Automatic",
    manual: "Manual",
    enterName: "Enter name",
    enterDescription: "Enter description",
    enterImagePath: "Enter image path",
    enterAmount: "Enter amount (ml)",
    enterInstruction: "Enter instruction",
    enterNewSize: "Enter new cocktail size (ml)",
    inputPlaceholder: "Input...",
    nameRequired: "Name is required",
    imagePathRequired: "Image path must start with /",
    errorSaving: "Error saving",
    instructionPlaceholder: "Instruction (e.g. 'fill with ice cubes')",

    // Ingredient Manager
    manageIngredients: "Manage Ingredients",
    addNewIngredient: "Add New Ingredient",
    ingredientName: "Ingredient Name",
    ingredientPlaceholder: "e.g. Strawberry Juice",
    customIngredients: "Your Custom Ingredients",
    errorLoadingIngredients: "Error loading custom ingredients:",
    errorSavingIngredients: "Error saving custom ingredients:",
    enterIngredientName: "Enter ingredient name",

    // Language Settings
    languageSettings: "Language Settings",
    selectLanguage: "Select Language",
    german: "Deutsch",
    english: "English",

    // Messages
    passwordRequired: "Please enter the password to access the service menu.",
    enterPassword: "Enter Password",
    configSaved: "Configuration saved successfully.",
    errorLoading: "Could not load configuration.",
    wrongPassword: "Wrong password. Please try again.",
    passwordRequiredEdit: "Please enter the password to edit recipes:",
    passwordRequiredDelete: "Please enter the password to confirm deletion:",
    deleteConfirmation: "Do you really want to delete the cocktail?",
    actionCannotBeUndone: "This action cannot be undone.",

    // Shot Selector
    selectShot: "Select Shot",
    makeShot: "Make Shot",
    shotSize: "Shot Size",

    // Cocktail Grid
    noCocktailsFound: "No cocktails found",
    searchCocktails: "Search cocktails",

    // Virtual Keyboard
    clear: "Clear",
    backspace: "Backspace",
    space: "Space",

    // Tab Configuration
    tabConfiguration: "Tab Configuration",
    configureTabArrangement: "Configure your tab arrangement",
    mainNavigation: "Main Navigation",
    serviceMenuTabs: "Service Menu",
    howItWorks: "How does it work?",
    noTabsInMain: "No tabs in main navigation",
    noTabsInService: "No tabs in service menu",
    unsavedChanges: "You have unsaved changes.",
    clickSaveToApply: 'Click "Save" to apply the changes.',
    cannotBeMoved: "Cannot be moved",
    toMainNavigation: "To Main Navigation",
    toServiceMenu: "To Service Menu",
    legend: "Legend",
    loading: "Loading configuration",
    oneMoreMoment: "One moment please...",
    errorLoadingConfig: "Error loading",
    tryAgain: "Try again",
    saving: "Saving...",
    standard: "Default",
    tabs: "Tabs",
    password: "Password",
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof Translations) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("de")

  // Load language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("cocktail-app-language") as Language
      if (savedLanguage && (savedLanguage === "de" || savedLanguage === "en")) {
        setLanguageState(savedLanguage)
      }
    } catch (error) {
      console.error("Error loading language from localStorage:", error)
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    try {
      localStorage.setItem("cocktail-app-language", lang)
      setLanguageState(lang)
    } catch (error) {
      console.error("Error saving language to localStorage:", error)
      setLanguageState(lang) // Still update state even if localStorage fails
    }
  }

  // Translation function
  const t = (key: keyof Translations): string => {
    return translations[language][key] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
