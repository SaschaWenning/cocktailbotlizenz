"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb, Zap, Play, Square, TestTube, Shuffle } from "lucide-react"
import { LEDController, type LEDConfig, ledController } from "@/lib/led-controller"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "@/components/ui/use-toast"

interface LEDSettingsProps {
  onClose?: () => void
}

export default function LEDSettings({ onClose }: LEDSettingsProps) {
  const { t } = useLanguage()
  const [makingConfig, setMakingConfig] = useState<LEDConfig>({
    color: "#ff8000",
    brightness: 80,
    blinking: true,
    blinkSpeed: 300,
    pattern: "solid",
  })

  const [finishedConfig, setFinishedConfig] = useState<LEDConfig>({
    color: "#00ff00",
    brightness: 100,
    blinking: true,
    blinkSpeed: 500,
    pattern: "pulse",
  })

  const [selectedIdleScheme, setSelectedIdleScheme] = useState(0)
  const [autoCycleEnabled, setAutoCycleEnabled] = useState(false)
  const [cycleInterval, setCycleInterval] = useState(5)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  const idleSchemes = LEDController.getIdleSchemes()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const savedMaking = localStorage.getItem("led-making-config")
      const savedFinished = localStorage.getItem("led-finished-config")
      const savedIdleScheme = localStorage.getItem("led-idle-scheme")
      const savedAutoCycle = localStorage.getItem("led-auto-cycle")
      const savedCycleInterval = localStorage.getItem("led-cycle-interval")

      if (savedMaking) {
        setMakingConfig(JSON.parse(savedMaking))
      }
      if (savedFinished) {
        setFinishedConfig(JSON.parse(savedFinished))
      }
      if (savedIdleScheme) {
        setSelectedIdleScheme(Number.parseInt(savedIdleScheme))
      }
      if (savedAutoCycle) {
        setAutoCycleEnabled(JSON.parse(savedAutoCycle))
      }
      if (savedCycleInterval) {
        setCycleInterval(Number.parseInt(savedCycleInterval))
      }
    } catch (error) {
      console.error("[v0] Error loading LED settings:", error)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)

      localStorage.setItem("led-making-config", JSON.stringify(makingConfig))
      localStorage.setItem("led-finished-config", JSON.stringify(finishedConfig))
      localStorage.setItem("led-idle-scheme", selectedIdleScheme.toString())
      localStorage.setItem("led-auto-cycle", JSON.stringify(autoCycleEnabled))
      localStorage.setItem("led-cycle-interval", cycleInterval.toString())

      // Apply idle scheme immediately
      if (autoCycleEnabled) {
        await ledController.startIdleCycling(cycleInterval)
      } else {
        await ledController.setIdleMode(idleSchemes[selectedIdleScheme].config)
      }

      toast({
        title: t("led.settings_saved"),
        description: t("led.settings_saved_description"),
      })
    } catch (error) {
      console.error("[v0] Error saving LED settings:", error)
      toast({
        title: t("common.error"),
        description: t("led.save_error"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const testConfiguration = async (config: LEDConfig, mode: string) => {
    try {
      setTesting(true)

      let success = false
      switch (mode) {
        case "making":
          success = await ledController.setMakingMode(config)
          break
        case "finished":
          success = await ledController.setFinishedMode(config)
          break
        case "idle":
          success = await ledController.setIdleMode(config)
          break
      }

      if (success) {
        toast({
          title: t("led.test_success"),
          description: t("led.test_success_description"),
        })

        // Turn off after 3 seconds
        setTimeout(async () => {
          await ledController.setIdleMode(idleSchemes[selectedIdleScheme].config)
        }, 3000)
      } else {
        toast({
          title: t("common.error"),
          description: t("led.test_error"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error testing LED configuration:", error)
      toast({
        title: t("common.error"),
        description: t("led.test_error"),
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const ColorPicker = ({
    value,
    onChange,
    label,
  }: { value: string; onChange: (color: string) => void; label: string }) => {
    const colors = [
      "#ff0000",
      "#ff8000",
      "#ffff00",
      "#80ff00",
      "#00ff00",
      "#00ff80",
      "#00ffff",
      "#0080ff",
      "#0000ff",
      "#8000ff",
      "#ff00ff",
      "#ff0080",
      "#ffffff",
      "#c0c0c0",
      "#808080",
      "#404040",
      "#000000",
    ]

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium" style={{ color: "hsl(var(--cocktail-text))" }}>
          {label}
        </Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                value === color ? "border-white shadow-lg scale-110" : "border-gray-600"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
          />
          <span className="text-sm font-mono" style={{ color: "hsl(var(--cocktail-text-muted))" }}>
            {value.toUpperCase()}
          </span>
        </div>
      </div>
    )
  }

  const ConfigCard = ({
    title,
    icon: Icon,
    config,
    onChange,
    onTest,
    testMode,
  }: {
    title: string
    icon: any
    config: LEDConfig
    onChange: (config: LEDConfig) => void
    onTest: () => void
    testMode: string
  }) => (
    <Card
      className="border"
      style={{ backgroundColor: "hsl(var(--cocktail-card-bg))", borderColor: "hsl(var(--cocktail-card-border))" }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3" style={{ color: "hsl(var(--cocktail-text))" }}>
          <Icon className="h-5 w-5" style={{ color: "hsl(var(--cocktail-primary))" }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ColorPicker value={config.color} onChange={(color) => onChange({ ...config, color })} label={t("led.color")} />

        <div className="space-y-2">
          <Label className="text-sm font-medium" style={{ color: "hsl(var(--cocktail-text))" }}>
            {t("led.brightness")}: {config.brightness}%
          </Label>
          <Slider
            value={[config.brightness]}
            onValueChange={([value]) => onChange({ ...config, brightness: value })}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium" style={{ color: "hsl(var(--cocktail-text))" }}>
            {t("led.blinking")}
          </Label>
          <Switch checked={config.blinking} onCheckedChange={(blinking) => onChange({ ...config, blinking })} />
        </div>

        {config.blinking && (
          <div className="space-y-2">
            <Label className="text-sm font-medium" style={{ color: "hsl(var(--cocktail-text))" }}>
              {t("led.blink_speed")}: {config.blinkSpeed}ms
            </Label>
            <Slider
              value={[config.blinkSpeed]}
              onValueChange={([value]) => onChange({ ...config, blinkSpeed: value })}
              max={2000}
              min={100}
              step={50}
              className="w-full"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium" style={{ color: "hsl(var(--cocktail-text))" }}>
            {t("led.pattern")}
          </Label>
          <Select value={config.pattern} onValueChange={(pattern) => onChange({ ...config, pattern: pattern as any })}>
            <SelectTrigger
              style={{
                backgroundColor: "hsl(var(--cocktail-button-bg))",
                borderColor: "hsl(var(--cocktail-card-border))",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">{t("led.pattern_solid")}</SelectItem>
              <SelectItem value="fade">{t("led.pattern_fade")}</SelectItem>
              <SelectItem value="pulse">{t("led.pattern_pulse")}</SelectItem>
              <SelectItem value="rainbow">{t("led.pattern_rainbow")}</SelectItem>
              <SelectItem value="chase">{t("led.pattern_chase")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onTest}
          disabled={testing}
          variant="outline"
          className="w-full bg-transparent"
          style={{ backgroundColor: "hsl(var(--cocktail-button-bg))", borderColor: "hsl(var(--cocktail-card-border))" }}
        >
          <TestTube className="h-4 w-4 mr-2" />
          {testing ? t("led.testing") : t("led.test")}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold" style={{ color: "hsl(var(--cocktail-text))" }}>
            {t("led.title")}
          </h2>
          <p style={{ color: "hsl(var(--cocktail-text-muted))" }}>{t("led.description")}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="text-white"
            style={{ backgroundColor: "hsl(var(--cocktail-primary))" }}
          >
            {saving ? t("common.saving") : t("common.save")}
          </Button>
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              style={{
                backgroundColor: "hsl(var(--cocktail-button-bg))",
                borderColor: "hsl(var(--cocktail-card-border))",
              }}
            >
              {t("common.close")}
            </Button>
          )}
        </div>
      </div>

      {/* Idle Mode Settings */}
      <Card
        className="border"
        style={{ backgroundColor: "hsl(var(--cocktail-card-bg))", borderColor: "hsl(var(--cocktail-card-border))" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3" style={{ color: "hsl(var(--cocktail-text))" }}>
            <Lightbulb className="h-5 w-5" style={{ color: "hsl(var(--cocktail-primary))" }} />
            {t("led.idle_mode")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Cycle Settings */}
          <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ backgroundColor: "hsl(var(--cocktail-button-bg))" }}
          >
            <div className="space-y-1">
              <Label className="text-sm font-medium" style={{ color: "hsl(var(--cocktail-text))" }}>
                {t("led.auto_cycle")}
              </Label>
              <p className="text-xs" style={{ color: "hsl(var(--cocktail-text-muted))" }}>
                {t("led.auto_cycle_description")}
              </p>
            </div>
            <Switch checked={autoCycleEnabled} onCheckedChange={setAutoCycleEnabled} />
          </div>

          {autoCycleEnabled && (
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: "hsl(var(--cocktail-text))" }}>
                {t("led.cycle_interval")}: {cycleInterval} {t("led.minutes")}
              </Label>
              <Slider
                value={[cycleInterval]}
                onValueChange={([value]) => setCycleInterval(value)}
                max={60}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {idleSchemes.map((scheme, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 border-2 ${
                  selectedIdleScheme === index && !autoCycleEnabled
                    ? "border-[hsl(var(--cocktail-primary))] shadow-lg scale-105"
                    : "border-[hsl(var(--cocktail-card-border))] hover:border-[hsl(var(--cocktail-primary))] hover:scale-102"
                } ${autoCycleEnabled ? "opacity-75" : ""}`}
                style={{ backgroundColor: "hsl(var(--cocktail-button-bg))" }}
                onClick={() => !autoCycleEnabled && setSelectedIdleScheme(index)}
              >
                <CardContent className="p-4 text-center space-y-3">
                  <div
                    className="w-12 h-12 mx-auto rounded-full border-2 border-gray-600"
                    style={{ backgroundColor: scheme.config.color }}
                  />
                  <div>
                    <h4 className="font-medium" style={{ color: "hsl(var(--cocktail-text))" }}>
                      {scheme.name}
                    </h4>
                    <p className="text-xs" style={{ color: "hsl(var(--cocktail-text-muted))" }}>
                      {t(`led.pattern_${scheme.config.pattern}`)}
                    </p>
                  </div>
                  {selectedIdleScheme === index && !autoCycleEnabled && (
                    <Badge
                      className="text-xs"
                      style={{ backgroundColor: "hsl(var(--cocktail-primary))", color: "black" }}
                    >
                      {t("led.active")}
                    </Badge>
                  )}
                  {autoCycleEnabled && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: "hsl(var(--cocktail-primary))", color: "hsl(var(--cocktail-primary))" }}
                    >
                      <Shuffle className="w-3 h-3 mr-1" />
                      {t("led.cycling")}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <Button
              onClick={() => testConfiguration(idleSchemes[selectedIdleScheme].config, "idle")}
              disabled={testing || autoCycleEnabled}
              variant="outline"
              style={{
                backgroundColor: "hsl(var(--cocktail-button-bg))",
                borderColor: "hsl(var(--cocktail-card-border))",
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              {testing ? t("led.testing") : t("led.test_scheme")}
            </Button>

            {autoCycleEnabled && (
              <Button
                onClick={() => ledController.startIdleCycling(cycleInterval)}
                variant="outline"
                style={{
                  backgroundColor: "hsl(var(--cocktail-button-bg))",
                  borderColor: "hsl(var(--cocktail-card-border))",
                }}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                {t("led.start_cycling")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Making and Finished Mode Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigCard
          title={t("led.making_mode")}
          icon={Zap}
          config={makingConfig}
          onChange={setMakingConfig}
          onTest={() => testConfiguration(makingConfig, "making")}
          testMode="making"
        />

        <ConfigCard
          title={t("led.finished_mode")}
          icon={Square}
          config={finishedConfig}
          onChange={setFinishedConfig}
          onTest={() => testConfiguration(finishedConfig, "finished")}
          testMode="finished"
        />
      </div>

      {/* Connection Status */}
      <Card
        className="border"
        style={{ backgroundColor: "hsl(var(--cocktail-card-bg))", borderColor: "hsl(var(--cocktail-card-border))" }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span style={{ color: "hsl(var(--cocktail-text))" }}>{t("led.connection_status")}</span>
            </div>
            <Badge
              variant="outline"
              style={{ backgroundColor: "hsl(var(--cocktail-button-bg))", color: "hsl(var(--cocktail-text))" }}
            >
              Raspberry Pico 2
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
