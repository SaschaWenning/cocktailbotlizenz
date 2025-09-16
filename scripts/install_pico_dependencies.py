#!/usr/bin/env python3
"""
Installation script for Raspberry Pico 2 dependencies
This script helps set up the required libraries on the Pico 2
"""

import os
import sys
import subprocess

def install_micropython_packages():
    """Install required MicroPython packages"""
    packages = [
        "micropython-machine",
        "micropython-neopixel", 
        "micropython-json"
    ]
    
    print("Installing MicroPython packages...")
    for package in packages:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", package], check=True)
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")

def create_pico_setup_guide():
    """Create a setup guide for the Raspberry Pico 2"""
    guide = """
# Raspberry Pico 2 LED Controller Setup Guide

## Hardware Requirements:
- Raspberry Pico 2
- WS2812B LED Strip (NeoPixel compatible)
- 3 jumper wires
- 5V power supply for LED strip (if >30 LEDs)

## Wiring:
- LED Strip Data → Pico GPIO 28
- LED Strip GND → Pico GND  
- LED Strip VCC → Pico VBUS (5V) or external 5V supply
- Pico USB → Raspberry Pi 5 (for serial communication)

## Software Setup:

### 1. Install MicroPython on Pico 2:
1. Download MicroPython firmware for Pico 2 from micropython.org
2. Hold BOOTSEL button while connecting Pico to computer
3. Copy .uf2 file to RPI-RP2 drive
4. Pico will reboot with MicroPython

### 2. Upload LED Controller Code:
1. Install Thonny IDE: `sudo apt install thonny`
2. Open Thonny, select MicroPython (Raspberry Pi Pico) interpreter
3. Copy contents of `pico_led_firmware.py` to Pico as `main.py`
4. Save file to Pico (will auto-run on boot)

### 3. Test Connection:
1. Connect Pico to Raspberry Pi 5 via USB
2. Check device appears as `/dev/ttyACM0` (or similar)
3. Run LED test from CocktailBot service menu

## Configuration:
- LED_PIN: GPIO pin for LED data (default: 28)
- NUM_LEDS: Number of LEDs in strip (default: 60)
- UART_ID: Serial interface (default: 0)
- BAUD_RATE: Communication speed (default: 115200)

## Troubleshooting:
- If LEDs don't light: Check power supply and wiring
- If no communication: Verify USB connection and /dev/ttyACM* device
- If colors wrong: Check LED strip type (WS2812B vs others)
- If flickering: Add capacitor (1000µF) across power supply

## LED Strip Types Supported:
- WS2812B (NeoPixel)
- WS2811
- SK6812
- Similar addressable RGB strips

## Power Considerations:
- Each LED draws ~60mA at full white
- 60 LEDs = ~3.6A max current
- Use external 5V supply for >30 LEDs
- Connect grounds together (Pico GND to LED GND)
"""
    
    with open("pico_setup_guide.md", "w") as f:
        f.write(guide)
    
    print("✅ Created pico_setup_guide.md")

def check_serial_devices():
    """Check for available serial devices"""
    print("\nChecking for serial devices...")
    
    import glob
    devices = glob.glob('/dev/ttyACM*') + glob.glob('/dev/ttyUSB*')
    
    if devices:
        print("Found serial devices:")
        for device in devices:
            print(f"  - {device}")
    else:
        print("❌ No serial devices found")
        print("   Make sure Raspberry Pico 2 is connected via USB")

def test_serial_communication():
    """Test serial communication with Pico"""
    try:
        import serial
        import json
        import time
        
        # Try common device paths
        device_paths = ['/dev/ttyACM0', '/dev/ttyACM1', '/dev/ttyUSB0']
        
        for device_path in device_paths:
            try:
                print(f"Testing {device_path}...")
                ser = serial.Serial(device_path, 115200, timeout=1)
                time.sleep(2)  # Wait for connection
                
                # Send test command
                test_command = {
                    "command": "get_status",
                    "data": {},
                    "timestamp": time.time()
                }
                
                ser.write((json.dumps(test_command) + "\n").encode())
                
                # Wait for response
                response = ser.readline().decode().strip()
                if response:
                    print(f"✅ Communication successful with {device_path}")
                    print(f"   Response: {response}")
                    ser.close()
                    return True
                
                ser.close()
                
            except Exception as e:
                print(f"❌ Failed to communicate with {device_path}: {e}")
        
        return False
        
    except ImportError:
        print("❌ pyserial not installed. Install with: pip install pyserial")
        return False

def main():
    """Main installation function"""
    print("🚀 Raspberry Pico 2 LED Controller Setup")
    print("=" * 50)
    
    # Install Python packages
    install_micropython_packages()
    
    # Create setup guide
    create_pico_setup_guide()
    
    # Check hardware
    check_serial_devices()
    
    # Test communication
    print("\n🔧 Testing serial communication...")
    if test_serial_communication():
        print("✅ Setup appears to be working correctly!")
    else:
        print("❌ Communication test failed. Check setup guide.")
    
    print("\n📖 Next steps:")
    print("1. Read pico_setup_guide.md for detailed setup instructions")
    print("2. Upload pico_led_firmware.py to your Pico 2 as main.py")
    print("3. Test LED control from CocktailBot service menu")

if __name__ == "__main__":
    main()
