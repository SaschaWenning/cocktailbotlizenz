"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"

export default function LanguageSelector() {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{t("language.select")}:</span>
      <Select value={lang} onValueChange={(value) => setLang(value as "de" | "en")}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="de">{t("language.german")}</SelectItem>
          <SelectItem value="en">{t("language.english")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
