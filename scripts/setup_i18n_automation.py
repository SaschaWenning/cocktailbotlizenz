#!/usr/bin/env python3
"""
Automatisierungs-Script für i18n Setup
Dieses Script automatisiert die Einrichtung der Internationalisierung
"""

import json
import os
import sys
from pathlib import Path

def create_translation_files():
    """Erstellt die Übersetzungsdateien falls sie nicht existieren"""
    
    # Definiere die Übersetzungen
    translations = {
        "de": {
            "service.language": "Sprache",
            "service.language_help": "Wähle die Sprache der Oberfläche.",
            "service.language.de": "Deutsch",
            "service.language.en": "Englisch",
            "ingredient.levels": "Füllstände",
            "fill.all": "Alle auffüllen",
            "reset.all": "Alle zurücksetzen",
            "fill.one": "Auffüllen",
            "levels.container_size": "Behältergröße",
            "levels.current_amount": "Aktueller Füllstand",
            "levels.update_success": "Füllstände gespeichert",
            "levels.update_error": "Fehler beim Speichern der Füllstände",
            "pumps.prime": "Entlüften",
            "pumps.shot": "Shot",
            "pumps.flush": "Spülen",
            "recipes.add": "Cocktail hinzufügen",
            "recipes.save": "Rezept speichern",
            "recipes.delete": "Rezept löschen",
            "recipes.edit": "Rezept bearbeiten",
            "recipes.ingredients": "Zutaten",
            "recipes.manual_ingredients": "Manuelle Zutaten",
            "recipes.start_preparation": "Zubereitung starten",
            "recipes.preparing": "Zubereitung läuft…",
            "recipes.prepared": "Zubereitung abgeschlossen",
            "success.auto_made": "automatisch zubereitet! Bitte manuelle Zutaten hinzufügen.",
            "success.complete": "100% abgeschlossen",
            "success.manual_list.title_single": "Bitte folgende Zutat hinzufügen:",
            "success.manual_list.title_multi": "Bitte folgende Zutaten noch hinzufügen:",
            "success.manual_list.item": "{amount}ml {name}",
            "ui.save": "Speichern",
            "ui.cancel": "Abbrechen",
            "ui.close": "Schließen",
            "ui.settings": "Einstellungen",
            "ui.ok": "OK",
            "ui.error": "Fehler",
            "ui.retry": "Wiederholen",
            "ui.on": "An",
            "ui.off": "Aus",
            "ui.delete": "Löschen",
            "ui.edit": "Bearbeiten",
            "ui.search": "Suche",
            "ui.filter": "Filter",
            "ui.start": "Start",
            "ui.stop": "Stopp",
            "ui.pause": "Pause",
            "ui.resume": "Weiter",
            "ui.next": "Weiter",
            "ui.back": "Zurück",
            "ui.confirm": "Bestätigen",
            "ui.yes": "Ja",
            "ui.no": "Nein",
            "menu.service": "Service",
            "menu.settings": "Einstellungen",
            "menu.calibration": "Kalibrierung",
            "menu.maintenance": "Wartung",
            "menu.language": "Sprache",
            "calibration.start": "Kalibrierung starten",
            "calibration.stop": "Kalibrierung stoppen",
            "calibration.seconds": "Sekunden",
            "calibration.ml_per_second": "ml / Sekunde",
            "calibration.save": "Kalibrierung speichern",
            "errors.network": "Netzwerkfehler",
            "errors.server": "Serverfehler",
            "errors.validation": "Eingabefehler",
            "errors.not_found": "Nicht gefunden",
            "app.title": "Cocktail Bot"
        },
        "en": {
            "service.language": "Language",
            "service.language_help": "Choose the interface language.",
            "service.language.de": "German",
            "service.language.en": "English",
            "ingredient.levels": "Ingredient Levels",
            "fill.all": "Fill all",
            "reset.all": "Reset all",
            "fill.one": "Fill",
            "levels.container_size": "Container size",
            "levels.current_amount": "Current level",
            "levels.update_success": "Levels saved",
            "levels.update_error": "Failed to save levels",
            "pumps.prime": "Prime",
            "pumps.shot": "Shot",
            "pumps.flush": "Flush",
            "recipes.add": "Add cocktail",
            "recipes.save": "Save recipe",
            "recipes.delete": "Delete recipe",
            "recipes.edit": "Edit recipe",
            "recipes.ingredients": "Ingredients",
            "recipes.manual_ingredients": "Manual ingredients",
            "recipes.start_preparation": "Start preparation",
            "recipes.preparing": "Preparing…",
            "recipes.prepared": "Preparation complete",
            "success.auto_made": "automatically prepared! Please add manual ingredients.",
            "success.complete": "100% complete",
            "success.manual_list.title_single": "Please add the following ingredient:",
            "success.manual_list.title_multi": "Please add the following ingredients:",
            "success.manual_list.item": "{amount}ml {name}",
            "ui.save": "Save",
            "ui.cancel": "Cancel",
            "ui.close": "Close",
            "ui.settings": "Settings",
            "ui.ok": "OK",
            "ui.error": "Error",
            "ui.retry": "Retry",
            "ui.on": "On",
            "ui.off": "Off",
            "ui.delete": "Delete",
            "ui.edit": "Edit",
            "ui.search": "Search",
            "ui.filter": "Filter",
            "ui.start": "Start",
            "ui.stop": "Stop",
            "ui.pause": "Pause",
            "ui.resume": "Resume",
            "ui.next": "Next",
            "ui.back": "Back",
            "ui.confirm": "Confirm",
            "ui.yes": "Yes",
            "ui.no": "No",
            "menu.service": "Service",
            "menu.settings": "Settings",
            "menu.calibration": "Calibration",
            "menu.maintenance": "Maintenance",
            "menu.language": "Language",
            "calibration.start": "Start calibration",
            "calibration.stop": "Stop calibration",
            "calibration.seconds": "seconds",
            "calibration.ml_per_second": "ml / second",
            "calibration.save": "Save calibration",
            "errors.network": "Network error",
            "errors.server": "Server error",
            "errors.validation": "Validation error",
            "errors.not_found": "Not found",
            "app.title": "Cocktail Bot"
        }
    }
    
    # Erstelle das locales Verzeichnis falls es nicht existiert
    locales_dir = Path("public/locales")
    locales_dir.mkdir(parents=True, exist_ok=True)
    
    # Erstelle die Übersetzungsdateien
    for lang, content in translations.items():
        file_path = locales_dir / f"{lang}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
        print(f"✅ Übersetzungsdatei erstellt: {file_path}")

def check_api_routes():
    """Überprüft ob die Settings API Route existiert"""
    api_settings_path = Path("app/api/settings/route.ts")
    
    if api_settings_path.exists():
        print("✅ Settings API Route bereits vorhanden")
        return True
    else:
        print("❌ Settings API Route fehlt")
        return False

def main():
    """Hauptfunktion des Automatisierungs-Scripts"""
    print("🚀 Starte i18n Setup Automatisierung...")
    
    try:
        # Erstelle Übersetzungsdateien
        create_translation_files()
        
        # Überprüfe API Routes
        api_ok = check_api_routes()
        
        if api_ok:
            print("\n✅ i18n Setup erfolgreich abgeschlossen!")
            print("📝 Nächste Schritte:")
            print("   1. I18nProvider in der Hauptkomponente verwenden")
            print("   2. useI18n Hook in Komponenten integrieren")
            print("   3. Sprachauswahl im Service Menu testen")
        else:
            print("\n⚠️  i18n Setup teilweise abgeschlossen")
            print("❌ Fehlende API Routes müssen manuell erstellt werden")
            
    except Exception as e:
        print(f"❌ Fehler beim Setup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
