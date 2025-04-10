// Diese Datei steuert die GPIO-Pins des Raspberry Pi

// Importiere die rpio Bibliothek
import * as rpio from "rpio"
import { pumpConfig } from "@/data/pump-config"

export function setupGPIO() {
  // Initialisiere die GPIO-Pins
  console.log("GPIO-Pins werden initialisiert")

  try {
    //  {
  // Initialisiere die GPIO-Pins
  console.log("GPIO-Pins werden initialisiert")

  try {
    // Initialisiere die rpio Bibliothek
    rpio.init({ mapping: 'gpio' });

    // Konfiguriere alle Pins aus der Pumpenkonfiguration
    for (const pump of pumpConfig) {
      // Setze den Pin als Ausgang und initialisiere ihn mit HIGH (Pumpe aus)
      // Da wir ein active-low Relais verwenden, bedeutet HIGH = Pumpe aus
      rpio.open(pump.pin, rpio.OUTPUT, rpio.HIGH);
      console.log(`Pin ${pump.pin} für Pumpe ${pump.id} konfiguriert (Zutat: ${pump.ingredient})`);
    }

    console.log("GPIO-Pins erfolgreich initialisiert");
  } catch (error) {
    console.error("Fehler bei der Initialisierung der GPIO-Pins:", error);
  }
}
\
export function setPinHigh(pin: number) {
  // Setze den Pin auf HIGH (3.3V)
  console.log(`Setze Pin ${pin} auf HIGH`);

  try {
    rpio.write(pin, rpio.HIGH);
  } catch (error) {
    console.error(`Fehler beim Setzen von Pin ${pin} auf HIGH:`, error);
  }
}

export function setPinLow(pin: number) {
  // Setze den Pin auf LOW (0V)
  console.log(`Setze Pin ${pin} auf LOW`);

  try {
    rpio.write(pin, rpio.LOW);
  } catch (error) {
    console.error(`Fehler beim Setzen von Pin ${pin} auf LOW:`, error);
  }
}

export function cleanupGPIO() {
  // Bereinige die GPIO-Pins
  console.log("GPIO-Pins werden bereinigt");

  try {
    // Setze alle Pins zurück auf HIGH (Pumpen aus)
    for (const pump of pumpConfig) {
      rpio.write(pump.pin, rpio.HIGH);
    }
    
    // Schließe die rpio Bibliothek
    rpio.exit();
    console.log("GPIO-Pins erfolgreich bereinigt");
  } catch (error) {
    console.error("Fehler bei der Bereinigung der GPIO-Pins:", error);
  }
}
