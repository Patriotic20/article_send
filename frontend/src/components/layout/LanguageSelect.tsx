import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

import { LANGUAGES } from "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSelect() {
  const { i18n } = useTranslation();
  // Базовый код языка (например, "ru" из "ru-RU").
  const current = i18n.language?.split("-")[0] ?? "uz";

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={current} onValueChange={(v) => i18n.changeLanguage(v)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
