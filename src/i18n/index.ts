import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en";
import fr from "./locales/fr";
import mg from "./locales/mg";

const LANGUAGE_STORAGE_KEY = "@mymoney_language";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  mg: { translation: mg },
};

const getStoredLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const getDeviceLanguage = (): string => {
  return "en";
};

const initI18n = async (): Promise<void> => {
  const storedLanguage = await getStoredLanguage();
  const language = storedLanguage || getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v4",
  });
};

export const changeLanguage = async (lang: string): Promise<void> => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export const getCurrentLanguage = (): string => {
  return i18n.language || "en";
};

export { initI18n, LANGUAGE_STORAGE_KEY };
export default i18n;
