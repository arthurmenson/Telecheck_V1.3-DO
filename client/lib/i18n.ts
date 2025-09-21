type Messages = Record<string, string>;

const en: Messages = {
  welcome: "Welcome",
};

const es: Messages = {
  welcome: "Bienvenido",
};

const ar: Messages = {
  welcome: "مرحبا",
};

const catalogs: Record<string, Messages> = { en, es, ar };

let currentLocale = (localStorage.getItem("locale") as string) || "en";

export function t(key: string): string {
  return catalogs[currentLocale]?.[key] || key;
}

export function setLocale(locale: string) {
  if (catalogs[locale]) {
    currentLocale = locale;
    localStorage.setItem("locale", locale);
    // Set document direction for RTL locales
    if (typeof document !== "undefined") {
      const rtlLocales = new Set(["ar", "he", "fa", "ur"]); 
      document.documentElement.setAttribute("dir", rtlLocales.has(locale) ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", locale);
    }
  }
}

export function getLocale(): string {
  return currentLocale;
}


