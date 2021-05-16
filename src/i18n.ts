import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en/editor.json";
const resources = {
  en,
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",
    keySeparator: '.',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
