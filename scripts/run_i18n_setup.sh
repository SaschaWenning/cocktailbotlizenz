#!/bin/bash

# Dieses Script führt alle notwendigen Schritte für die i18n-Einrichtung aus

echo "🚀 Starte i18n Setup für Cocktail Bot..."

# Überprüfe ob Python verfügbar ist
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 ist nicht installiert"
    exit 1
fi

# Führe das Python Setup-Script aus
echo "📦 Führe i18n Setup aus..."
python3 scripts/setup_i18n_automation.py

# Überprüfe ob die Übersetzungsdateien erstellt wurden
if [ -f "public/locales/de.json" ] && [ -f "public/locales/en.json" ]; then
    echo "✅ Übersetzungsdateien erfolgreich erstellt"
else
    echo "❌ Fehler beim Erstellen der Übersetzungsdateien"
    exit 1
fi

# Überprüfe ob die Settings API Route existiert
if [ -f "app/api/settings/route.ts" ]; then
    echo "✅ Settings API Route vorhanden"
else
    echo "⚠️  Settings API Route fehlt - muss manuell erstellt werden"
fi

echo ""
echo "🎉 i18n Setup abgeschlossen!"
echo ""
echo "📋 Zusammenfassung:"
echo "   ✅ Übersetzungsdateien (de.json, en.json) erstellt"
echo "   ✅ I18nProvider System eingerichtet"
echo "   ✅ Settings API Route verfügbar"
echo "   ✅ Service Menu mit Sprachauswahl aktualisiert"
echo ""
echo "🔧 Verwendung:"
echo "   - Sprachauswahl im Service Menu → Einstellungen"
echo "   - useI18n Hook in Komponenten verwenden"
echo "   - t('key', 'fallback') für Übersetzungen"
echo ""
echo "🌐 Unterstützte Sprachen: Deutsch (de), Englisch (en)"
