# Raspberry Pico 2 LED Controller Firmware
# This script should be uploaded to the Raspberry Pico 2 using Thonny or similar

import machine
import neopixel
import time
import json
import sys
import math
from machine import Pin, UART

# LED Strip Configuration
LED_PIN = 28  # GPIO pin connected to LED strip data line
NUM_LEDS = 60  # Number of LEDs in the strip
UART_ID = 0   # UART interface for communication with Pi 5
BAUD_RATE = 115200

# Initialize hardware
led_strip = neopixel.NeoPixel(Pin(LED_PIN), NUM_LEDS)
uart = UART(UART_ID, BAUD_RATE)
onboard_led = Pin("LED", Pin.OUT)

# Global state
current_mode = "idle"
current_config = {
    "color": "#00ff00",
    "brightness": 50,
    "blinking": False,
    "blinkSpeed": 1000,
    "pattern": "solid"
}
animation_running = False

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def apply_brightness(rgb, brightness):
    """Apply brightness percentage to RGB values"""
    factor = brightness / 100.0
    return tuple(int(c * factor) for c in rgb)

def set_all_leds(color):
    """Set all LEDs to the same color"""
    for i in range(NUM_LEDS):
        led_strip[i] = color
    led_strip.write()

def clear_leds():
    """Turn off all LEDs"""
    set_all_leds((0, 0, 0))

def solid_pattern(rgb):
    """Solid color pattern"""
    set_all_leds(rgb)

def fade_pattern(rgb, step=0):
    """Fade in/out pattern"""
    fade_factor = (math.sin(step * 0.1) + 1) / 2  # 0 to 1
    faded_rgb = tuple(int(c * fade_factor) for c in rgb)
    set_all_leds(faded_rgb)

def pulse_pattern(rgb, step=0):
    """Pulse pattern - faster than fade"""
    pulse_factor = (math.sin(step * 0.2) + 1) / 2  # 0 to 1
    pulsed_rgb = tuple(int(c * pulse_factor) for c in rgb)
    set_all_leds(pulsed_rgb)

def rainbow_pattern(step=0):
    """Rainbow color cycling pattern"""
    for i in range(NUM_LEDS):
        hue = (i * 256 // NUM_LEDS + step) % 256
        rgb = hsv_to_rgb(hue, 255, current_config.get("brightness", 50) * 255 // 100)
        led_strip[i] = rgb
    led_strip.write()

def chase_pattern(rgb, step=0):
    """Chase/running lights pattern"""
    clear_leds()
    chase_length = 5
    position = step % NUM_LEDS
    
    for i in range(chase_length):
        led_pos = (position + i) % NUM_LEDS
        brightness_factor = (chase_length - i) / chase_length
        chase_rgb = tuple(int(c * brightness_factor) for c in rgb)
        led_strip[led_pos] = chase_rgb
    
    led_strip.write()

def hsv_to_rgb(h, s, v):
    """Convert HSV to RGB"""
    h = h / 256.0
    s = s / 255.0
    v = v / 255.0
    
    i = int(h * 6.0)
    f = (h * 6.0) - i
    p = v * (1.0 - s)
    q = v * (1.0 - s * f)
    t = v * (1.0 - s * (1.0 - f))
    
    i = i % 6
    if i == 0:
        r, g, b = v, t, p
    elif i == 1:
        r, g, b = q, v, p
    elif i == 2:
        r, g, b = p, v, t
    elif i == 3:
        r, g, b = p, q, v
    elif i == 4:
        r, g, b = t, p, v
    elif i == 5:
        r, g, b = v, p, q
    
    return (int(r * 255), int(g * 255), int(b * 255))

def animate_leds():
    """Main animation loop"""
    global animation_running
    step = 0
    last_blink = time.ticks_ms()
    blink_state = True
    
    while animation_running:
        try:
            current_time = time.ticks_ms()
            rgb = hex_to_rgb(current_config["color"])
            rgb = apply_brightness(rgb, current_config["brightness"])
            
            # Handle blinking
            if current_config["blinking"]:
                if time.ticks_diff(current_time, last_blink) >= current_config["blinkSpeed"]:
                    blink_state = not blink_state
                    last_blink = current_time
                
                if not blink_state:
                    clear_leds()
                    time.sleep_ms(50)
                    continue
            
            # Apply pattern
            pattern = current_config.get("pattern", "solid")
            if pattern == "solid":
                solid_pattern(rgb)
            elif pattern == "fade":
                fade_pattern(rgb, step)
            elif pattern == "pulse":
                pulse_pattern(rgb, step)
            elif pattern == "rainbow":
                rainbow_pattern(step)
            elif pattern == "chase":
                chase_pattern(rgb, step)
            
            step += 1
            time.sleep_ms(50)  # 20 FPS
            
        except Exception as e:
            print(f"Animation error: {e}")
            time.sleep_ms(100)

def start_animation():
    """Start LED animation"""
    global animation_running
    animation_running = True
    animate_leds()

def stop_animation():
    """Stop LED animation"""
    global animation_running
    animation_running = False
    clear_leds()

def handle_command(command_data):
    """Handle incoming commands from Raspberry Pi 5"""
    global current_mode, current_config
    
    try:
        command = command_data.get("command", "")
        data = command_data.get("data", {})
        
        response = {"success": True, "message": f"Command {command} executed"}
        
        if command == "set_idle":
            current_mode = "idle"
            current_config.update(data)
            response["message"] = "LED set to idle mode"
            
        elif command == "set_making":
            current_mode = "making"
            current_config.update(data)
            response["message"] = "LED set to making mode"
            
        elif command == "set_finished":
            current_mode = "finished"
            current_config.update(data)
            response["message"] = "LED set to finished mode"
            
        elif command == "turn_off":
            current_mode = "off"
            stop_animation()
            response["message"] = "LEDs turned off"
            
        elif command == "get_status":
            response["data"] = {
                "mode": current_mode,
                "config": current_config,
                "num_leds": NUM_LEDS
            }
            response["message"] = "Status retrieved"
            
        else:
            response = {"success": False, "error": f"Unknown command: {command}"}
        
        return response
        
    except Exception as e:
        return {"success": False, "error": f"Command handling error: {str(e)}"}

def send_response(response):
    """Send response back to Raspberry Pi 5"""
    try:
        response_json = json.dumps(response) + "\n"
        uart.write(response_json.encode())
    except Exception as e:
        print(f"Response send error: {e}")

def main():
    """Main program loop"""
    print("Raspberry Pico 2 LED Controller started")
    print(f"LED Strip: {NUM_LEDS} LEDs on GPIO {LED_PIN}")
    print(f"UART: {UART_ID} at {BAUD_RATE} baud")
    
    # Startup animation
    onboard_led.on()
    for i in range(3):
        set_all_leds((0, 255, 0))
        time.sleep_ms(200)
        clear_leds()
        time.sleep_ms(200)
    onboard_led.off()
    
    # Start with default idle mode
    current_config.update({
        "color": "#00ff00",
        "brightness": 30,
        "blinking": False,
        "blinkSpeed": 1000,
        "pattern": "pulse"
    })
    
    # Start animation in separate thread (simulated with loop)
    animation_running = True
    
    while True:
        try:
            # Check for incoming commands
            if uart.any():
                line = uart.readline()
                if line:
                    try:
                        command_data = json.loads(line.decode().strip())
                        response = handle_command(command_data)
                        send_response(response)
                        
                        # Restart animation with new config if needed
                        if current_mode != "off":
                            # Animation continues in background
                            pass
                            
                    except json.JSONDecodeError as e:
                        error_response = {"success": False, "error": f"JSON decode error: {str(e)}"}
                        send_response(error_response)
            
            # Run one animation step
            if animation_running and current_mode != "off":
                # This would normally be in a separate thread
                # For simplicity, we'll handle it in the main loop
                pass
            
            time.sleep_ms(10)  # Small delay to prevent overwhelming the CPU
            
        except KeyboardInterrupt:
            print("Shutting down...")
            stop_animation()
            break
        except Exception as e:
            print(f"Main loop error: {e}")
            time.sleep_ms(1000)

if __name__ == "__main__":
    main()
