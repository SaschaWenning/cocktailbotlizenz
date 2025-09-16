export interface LEDConfig {
  color: string
  brightness: number
  blinking: boolean
  blinkSpeed: number // ms between blinks
  pattern?: "solid" | "fade" | "pulse" | "rainbow" | "chase"
}

export interface LEDState {
  mode: "idle" | "making" | "finished"
  config: LEDConfig
}

export class LEDController {
  private currentState: LEDState = {
    mode: "idle",
    config: {
      color: "#00ff00",
      brightness: 50,
      blinking: false,
      blinkSpeed: 500,
      pattern: "solid",
    },
  }

  async sendToPico(command: string, data: any): Promise<boolean> {
    try {
      const response = await fetch("/api/led-control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "led_command",
          command,
          data,
        }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("[v0] LED Controller Error:", error)
      return false
    }
  }

  async setIdleMode(config: LEDConfig): Promise<boolean> {
    this.currentState = { mode: "idle", config }
    return await this.sendToPico("set_idle", config)
  }

  async setMakingMode(config: LEDConfig): Promise<boolean> {
    this.currentState = { mode: "making", config }
    return await this.sendToPico("set_making", config)
  }

  async setFinishedMode(config: LEDConfig): Promise<boolean> {
    this.currentState = { mode: "finished", config }
    return await this.sendToPico("set_finished", config)
  }

  async turnOff(): Promise<boolean> {
    return await this.sendToPico("turn_off", {})
  }

  getCurrentState(): LEDState {
    return this.currentState
  }

  static getIdleSchemes(): { name: string; config: LEDConfig }[] {
    return [
      {
        name: "Sanftes Grün",
        config: {
          color: "#00ff00",
          brightness: 30,
          blinking: false,
          blinkSpeed: 1000,
          pattern: "pulse",
        },
      },
      {
        name: "Warmes Blau",
        config: {
          color: "#0080ff",
          brightness: 40,
          blinking: false,
          blinkSpeed: 2000,
          pattern: "fade",
        },
      },
      {
        name: "Regenbogen",
        config: {
          color: "#ff0000",
          brightness: 50,
          blinking: false,
          blinkSpeed: 100,
          pattern: "rainbow",
        },
      },
      {
        name: "Laufende Lichter",
        config: {
          color: "#ff8000",
          brightness: 60,
          blinking: false,
          blinkSpeed: 200,
          pattern: "chase",
        },
      },
      {
        name: "Disco Modus",
        config: {
          color: "#ff00ff",
          brightness: 80,
          blinking: true,
          blinkSpeed: 150,
          pattern: "rainbow",
        },
      },
      {
        name: "Entspannend",
        config: {
          color: "#8000ff",
          brightness: 25,
          blinking: false,
          blinkSpeed: 3000,
          pattern: "fade",
        },
      },
    ]
  }

  async startIdleCycling(intervalMinutes = 5): Promise<void> {
    const schemes = LEDController.getIdleSchemes()
    let currentIndex = 0

    const cycle = async () => {
      try {
        await this.setIdleMode(schemes[currentIndex].config)
        console.log(`[v0] LED idle scheme changed to: ${schemes[currentIndex].name}`)
        currentIndex = (currentIndex + 1) % schemes.length
      } catch (error) {
        console.warn("[v0] Failed to cycle LED idle scheme:", error)
      }
    }

    // Initial scheme
    await cycle()

    // Set up cycling interval
    setInterval(cycle, intervalMinutes * 60 * 1000)
  }

  static getSchemeByName(name: string): LEDConfig | null {
    const scheme = this.getIdleSchemes().find((s) => s.name === name)
    return scheme ? scheme.config : null
  }
}

export const ledController = new LEDController()
