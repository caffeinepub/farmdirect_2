import { useLanguage } from "../contexts/LanguageContext";

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({
  className = "",
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <fieldset
      className={`flex items-center gap-0.5 bg-muted rounded-full p-0.5 border border-border/60 ${className}`}
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        data-ocid="lang.en_toggle"
        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          language === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={language === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ta")}
        data-ocid="lang.ta_toggle"
        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          language === "ta"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={language === "ta"}
      >
        தமிழ்
      </button>
    </fieldset>
  );
}
