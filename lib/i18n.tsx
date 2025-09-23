"use client"
import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type Lang = "de" | "en"
type Dict = Record<string, string>

type I18nContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, fallback?: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)
const LS_KEY = "cb:lang"

async function fetchSettingsLang(): Promise<Lang | null> {
  try {
    const r = await fetch("/api/settings", { cache: "no-store" })
    if (!r.ok) return null
    const data = await r.json()
    return data?.language ?? null
  } catch {
    return null
  }
}

async function saveSettingsLang(lang: Lang): Promise<void> {
  try {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    })
  } catch {}
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de")
  const [dict, setDict] = useState<Dict>({})

  // initial language
  useEffect(() => {
    ;(async () => {
      let initial: Lang | null = await fetchSettingsLang()
      if (!initial && typeof window !== "undefined") {
        const ls = localStorage.getItem(LS_KEY) as Lang | null
        if (ls === "de" || ls === "en") initial = ls
      }
      setLangState(initial ?? "de")
    })()
  }, [])

  // load dictionary
  useEffect(() => {
    ;(async () => {
      const res = await fetch(`/locales/${lang}.json`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setDict(data ?? {})
      } else {
        setDict({})
      }
    })()
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, l)
    saveSettingsLang(l)
  }

  // t(key, fallback): zeigt fallback (deutscher Default), wenn Key fehlt
  const t = (key: string, fallback?: string) => dict[key] ?? fallback ?? key

  const value = useMemo(() => ({ lang, setLang, t }), [lang, dict])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

export function T({ k, d }: { k: string; d: string }) {
  const { t } = useI18n()
  return <>{t(k, d)}</>
}
