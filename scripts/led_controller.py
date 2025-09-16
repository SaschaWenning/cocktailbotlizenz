#!/usr/bin/env python3
import sys
import json
import time
import traceback
import serial
import os
import threading
import queue

print("LED Controller wird gestartet...")
print(f"Arbeitsverzeichnis: {os.getcwd()}")
print(f"Python-Version: {sys.version}")
print(f"Argumente: {sys.argv}")

# Configuration
PICO_SERIAL_PORTS = ["/dev/ttyACM0", "/dev/ttyACM1", "/dev/ttyUSB0", "/dev/ttyUSB1"]
PICO_BAUD_RATE = 115200
CONNECTION_TIMEOUT = 5
COMMAND_TIMEOUT = 3

class LEDController:
    def __init__(self):
        self.serial_connection = None
        self.command_queue = queue.Queue()
        self.response_queue = queue.Queue()
        self.connected = False
        self.connect_to_pico()
        
        if self.connected:
            self.start_communication_thread()
    
    def find_pico_device(self):
        """Find the Raspberry Pico 2 device automatically"""
        for port in PICO_SERIAL_PORTS:
            if os.path.exists(port):
                try:
                    # Test connection
                    test_serial = serial.Serial(port, PICO_BAUD_RATE, timeout=1)
                    time.sleep(0.5)  # Give device time to initialize
                    
                    # Send a simple test command
                    test_command = json.dumps({"command": "get_status", "data": {}}) + "\n"
                    test_serial.write(test_command.encode())
                    
                    # Wait for response
                    response = test_serial.readline().decode().strip()
                    test_serial.close()
                    
                    if response and "success" in response:
                        print(f"✅ Found Pico 2 at {port}")
                        return port
                        
                except Exception as e:
                    print(f"❌ Failed to test {port}: {e}")
                    continue
        
        return None
    
    def connect_to_pico(self):
        """Connect to Raspberry Pico 2 via serial"""
        try:
            # Try to find device automatically
            device_port = self.find_pico_device()
            
            if not device_port:
                print("❌ No Raspberry Pico 2 found on any serial port")
                print(f"   Checked ports: {PICO_SERIAL_PORTS}")
                print("   Make sure Pico 2 is connected and running LED firmware")
                return
            
            self.serial_connection = serial.Serial(
                device_port, 
                PICO_BAUD_RATE, 
                timeout=CONNECTION_TIMEOUT
            )
            
            # Wait for device to initialize
            time.sleep(1)
            
            print(f"✅ Connected to Pico 2 at {device_port}")
            self.connected = True
            
        except Exception as e:
            print(f"❌ Failed to connect to Pico 2: {str(e)}")
            self.serial_connection = None
            self.connected = False
    
    def start_communication_thread(self):
        """Start background thread for handling communication"""
        self.comm_thread = threading.Thread(target=self.communication_worker, daemon=True)
        self.comm_thread.start()
    
    def communication_worker(self):
        """Background worker for serial communication"""
        while self.connected and self.serial_connection:
            try:
                # Check for commands to send
                if not self.command_queue.empty():
                    command = self.command_queue.get_nowait()
                    command_str = json.dumps(command) + "\n"
                    self.serial_connection.write(command_str.encode())
                
                # Check for responses
                if self.serial_connection.in_waiting > 0:
                    response_line = self.serial_connection.readline().decode().strip()
                    if response_line:
                        try:
                            response = json.loads(response_line)
                            self.response_queue.put(response)
                        except json.JSONDecodeError:
                            print(f"⚠️ Invalid JSON response: {response_line}")
                
                time.sleep(0.01)  # Small delay to prevent CPU spinning
                
            except Exception as e:
                print(f"❌ Communication worker error: {e}")
                time.sleep(0.1)
    
    def send_command(self, command, data):
        """Send command to Raspberry Pico 2"""
        if not self.connected:
            return {"success": False, "error": "Not connected to Pico 2"}
        
        try:
            packet = {
                "command": command,
                "data": data,
                "timestamp": time.time()
            }
            
            # Add command to queue
            self.command_queue.put(packet)
            
            # Wait for response with timeout
            start_time = time.time()
            while time.time() - start_time < COMMAND_TIMEOUT:
                if not self.response_queue.empty():
                    response = self.response_queue.get_nowait()
                    return response
                time.sleep(0.01)
            
            return {"success": False, "error": "Command timeout"}
                
        except Exception as e:
            print(f"❌ Error sending command: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def set_idle(self, config):
        """Set LED to idle mode"""
        print(f"🔵 Setting LED to idle mode: {config}")
        return self.send_command("set_idle", config)
    
    def set_making(self, config):
        """Set LED to cocktail making mode"""
        print(f"🟠 Setting LED to making mode: {config}")
        return self.send_command("set_making", config)
    
    def set_finished(self, config):
        """Set LED to finished mode"""
        print(f"🟢 Setting LED to finished mode: {config}")
        return self.send_command("set_finished", config)
    
    def turn_off(self):
        """Turn off all LEDs"""
        print("⚫ Turning off LEDs")
        return self.send_command("turn_off", {})
    
    def get_status(self):
        """Get current LED status"""
        return self.send_command("get_status", {})
    
    def test_connection(self):
        """Test connection to Pico 2"""
        if not self.connected:
            return {"success": False, "error": "Not connected"}
        
        status = self.get_status()
        if status.get("success"):
            return {
                "success": True, 
                "message": "Connection test successful",
                "pico_status": status.get("data", {})
            }
        else:
            return {"success": False, "error": "Connection test failed"}

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"success": False, "error": "No command specified"}))
            sys.exit(1)
        
        command = sys.argv[1]
        print(f"🚀 Executing LED command: {command}")
        
        led_data = {}
        if len(sys.argv) > 2:
            try:
                led_data = json.loads(sys.argv[2])
            except json.JSONDecodeError as e:
                print(json.dumps({"success": False, "error": f"Invalid LED data: {str(e)}"}))
                sys.exit(1)
        
        controller = LEDController()
        
        if not controller.connected:
            result = {
                "success": False, 
                "error": "Failed to connect to Raspberry Pico 2",
                "help": "Make sure Pico 2 is connected and running LED firmware"
            }
        elif command == "set_idle":
            result = controller.set_idle(led_data)
        elif command == "set_making":
            result = controller.set_making(led_data)
        elif command == "set_finished":
            result = controller.set_finished(led_data)
        elif command == "turn_off":
            result = controller.turn_off()
        elif command == "get_status":
            result = controller.get_status()
        elif command == "test":
            result = controller.test_connection()
        else:
            result = {"success": False, "error": f"Unknown command: {command}"}
        
        print(json.dumps(result))
        
    except Exception as e:
        print(f"💥 Unhandled error: {str(e)}")
        print(traceback.format_exc())
        print(json.dumps({"success": False, "error": f"Unhandled error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
