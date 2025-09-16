#!/usr/bin/env python3
"""
LED System Setup Script
Installiert und konfiguriert das LED-System für die Cocktail-Maschine
"""

import subprocess
import sys
import os
import time

def run_command(command, description):
    """Führt einen Befehl aus und gibt das Ergebnis zurück"""
    print(f"[v0] {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[v0] ✓ {description} erfolgreich")
            if result.stdout:
                print(f"[v0] Output: {result.stdout.strip()}")
            return True
        else:
            print(f"[v0] ✗ Fehler bei {description}")
            print(f"[v0] Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"[v0] ✗ Exception bei {description}: {e}")
        return False

def check_python_packages():
    """Überprüft und installiert benötigte Python-Pakete"""
    packages = ['pyserial', 'adafruit-circuitpython-neopixel']
    
    for package in packages:
        print(f"[v0] Überprüfe {package}...")
        try:
            __import__(package.replace('-', '_').replace('adafruit_circuitpython_', 'adafruit_'))
            print(f"[v0] ✓ {package} bereits installiert")
        except ImportError:
            print(f"[v0] Installiere {package}...")
            if run_command(f"pip3 install {package}", f"{package} Installation"):
                print(f"[v0] ✓ {package} erfolgreich installiert")
            else:
                print(f"[v0] ✗ Fehler beim Installieren von {package}")
                return False
    return True

def setup_serial_permissions():
    """Richtet serielle Berechtigungen ein"""
    print("[v0] Richte serielle Berechtigungen ein...")
    
    # Benutzer zur dialout Gruppe hinzufügen
    username = os.getenv('USER', 'pi')
    if run_command(f"sudo usermod -a -G dialout {username}", "Benutzer zu dialout Gruppe hinzufügen"):
        print("[v0] ✓ Serielle Berechtigungen eingerichtet")
        print("[v0] ⚠️  Neustart erforderlich für Gruppenmitgliedschaft")
        return True
    return False

def detect_pico_device():
    """Erkennt angeschlossene Pico-Geräte"""
    print("[v0] Suche nach Raspberry Pico Geräten...")
    
    # Suche nach USB-Geräten
    result = subprocess.run("lsusb | grep -i 'raspberry\\|pico'", shell=True, capture_output=True, text=True)
    if result.stdout:
        print(f"[v0] ✓ Gefundene Geräte:\n{result.stdout}")
    
    # Suche nach seriellen Geräten
    result = subprocess.run("ls /dev/ttyACM* /dev/ttyUSB* 2>/dev/null || echo 'Keine seriellen Geräte gefunden'", 
                          shell=True, capture_output=True, text=True)
    print(f"[v0] Serielle Geräte: {result.stdout.strip()}")
    
    return True

def create_systemd_service():
    """Erstellt einen systemd Service für den LED Controller"""
    service_content = """[Unit]
Description=Cocktail Machine LED Controller
After=network.target
Wants=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/cocktail-app
ExecStart=/usr/bin/python3 /home/pi/cocktail-app/scripts/led_controller.py
Restart=always
RestartSec=5
Environment=PYTHONPATH=/home/pi/cocktail-app

[Install]
WantedBy=multi-user.target
"""
    
    try:
        with open('/tmp/cocktail-led.service', 'w') as f:
            f.write(service_content)
        
        if run_command("sudo cp /tmp/cocktail-led.service /etc/systemd/system/", "Service-Datei kopieren"):
            if run_command("sudo systemctl daemon-reload", "Systemd neu laden"):
                if run_command("sudo systemctl enable cocktail-led.service", "Service aktivieren"):
                    print("[v0] ✓ Systemd Service erstellt und aktiviert")
                    print("[v0] Service kann mit 'sudo systemctl start cocktail-led' gestartet werden")
                    return True
        return False
    except Exception as e:
        print(f"[v0] ✗ Fehler beim Erstellen des Services: {e}")
        return False

def main():
    """Hauptfunktion für das LED-System Setup"""
    print("[v0] === LED System Setup für Cocktail-Maschine ===")
    print("[v0] Startet Konfiguration...")
    
    steps = [
        ("Python-Pakete überprüfen", check_python_packages),
        ("Serielle Berechtigungen einrichten", setup_serial_permissions),
        ("Pico-Geräte erkennen", detect_pico_device),
        ("Systemd Service erstellen", create_systemd_service)
    ]
    
    success_count = 0
    for description, func in steps:
        print(f"\n[v0] --- {description} ---")
        if func():
            success_count += 1
        else:
            print(f"[v0] ⚠️  Warnung: {description} fehlgeschlagen")
    
    print(f"\n[v0] === Setup abgeschlossen ===")
    print(f"[v0] {success_count}/{len(steps)} Schritte erfolgreich")
    
    if success_count == len(steps):
        print("[v0] ✓ LED-System vollständig eingerichtet!")
        print("[v0] Nächste Schritte:")
        print("[v0] 1. Raspberry Pico 2 mit LED-Firmware flashen")
        print("[v0] 2. LED-Strips an Pico anschließen")
        print("[v0] 3. System neu starten für Berechtigungen")
        print("[v0] 4. LED-Service starten: sudo systemctl start cocktail-led")
    else:
        print("[v0] ⚠️  Setup unvollständig - bitte Fehler beheben")
    
    return success_count == len(steps)

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n[v0] Setup abgebrochen")
        sys.exit(1)
    except Exception as e:
        print(f"[v0] ✗ Unerwarteter Fehler: {e}")
        sys.exit(1)
