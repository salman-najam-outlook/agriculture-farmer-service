import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Translation } from './translation.entity';
import * as NodeCache from 'node-cache';

@Injectable()
export class TranslationService {
  private cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes
  private translations: Record<string, any> = {};
  private translationCache: Record<string, any> = {}; // Cache for memoization
  private languageMap: Record<string, string> = {
    en: 'english',
    hi: 'hindi',
    mr: 'marathi',
    ne: 'nepali',
    es: 'spanish',
    sw: 'swahili',
    id: 'indonesian',
    fr: 'french',
    pt: 'portugese',
    ar: 'arabic',
    bn: 'bengali',
    om: 'oromo',
    so: 'somali',
    vi: 'vietnamese',
    am: 'amharic',
    el: 'greek',
    zh: 'mandarin',
    tr: 'turkish',
    ja: 'japanese',
    nl: 'dutch',
    it: 'italian',
  };

  constructor(
    @InjectModel(Translation)
    private translationModel: typeof Translation,
  ) {}

  private async loadTranslations(lang: string): Promise<Record<string, any>> {
    const cacheKey = `translations_${lang}`;
    const cachedTranslations = this.cache.get(cacheKey);
    
    if (cachedTranslations) {
      this.translations = cachedTranslations;
      return cachedTranslations;
    }

    const langColumn = this.languageMap[lang] || 'english'; // Default to English if code not found

    // Fetch translations from the database
    const translations = await this.translationModel.findAll();

    const translationMap = translations.reduce((acc, translation) => {
      const sanitizedKey = this.sanitizeKey(translation['english']);
      acc[sanitizedKey] = translation[langColumn] || translation['english'];
      return acc;
    }, {});

    // Store in cache
    this.cache.set(cacheKey, translationMap);
    return translationMap;
  }

  // Main method to translate an object
  async translateObject(obj: any, { req }, keysToSkip: string[] = [], maxDepth: number = 3): Promise<any> {
    try {
      const lang = req.headers.lang || 'en';

      // Load translations for the current language
      this.translations = await this.loadTranslations(lang);

      // Convert Sequelize instances to plain objects
      const plainObj = Array.isArray(obj) ? obj.map(item => item?.toJSON ? item?.toJSON() : item) : (obj?.toJSON ? obj?.toJSON() : obj);

      // Ensure non-nullable fields are preserved
      const nonNullableFields = ['id', 'createdAt', 'updatedAt'];
      const allKeysToSkip = [...keysToSkip, ...nonNullableFields];

      return this.translateRecursive(plainObj, allKeysToSkip, 0, maxDepth);
    } catch (error) {
      throw new Error('Translation error: ' + error.message);
    }
  }

  // Recursive method to translate nested objects
  private async translateRecursive(
    obj: any,
    keysToSkip: string[],
    currentDepth: number,
    maxDepth: number
  ): Promise<any> {
    if (currentDepth > maxDepth) {
      return obj; // Stop recursion if depth exceeds the maximum
    }

    if (Array.isArray(obj)) {
      // If the object is an array, translate each element
      return Promise.all(obj.map(item => this.translateRecursive(item, keysToSkip, currentDepth + 1, maxDepth)));
    }

    if (typeof obj === 'object' && obj !== null) {
      const translatedObj = {};

      for (const key of Object.keys(obj)) {
        const value = await obj[key]; // Await the value if it's a Promise

        if (keysToSkip.includes(key)) {
          // Skip translation, but preserve the original value
          translatedObj[key] = value;
          continue;
        }

        if (typeof value === 'object' && value !== null) {
          // If the value is another object or array, recursively translate it
          translatedObj[key] = value.dataValues
            ? await this.translateRecursive(value.dataValues, keysToSkip, currentDepth + 1, maxDepth)
            : await this.translateRecursive(value, keysToSkip, currentDepth + 1, maxDepth);
        } else {
          // Translate non-object values
          const sanitizedKey = this.sanitizeKey(value);
          translatedObj[key] = this.translations[sanitizedKey] !== undefined ? this.translations[sanitizedKey] : value;
        }
      }

      return translatedObj;
    }

    return obj; // Return non-object values as is
  }

  // Translate a single word
  translateWord(word: string, { req }): string {
    try {
      const lang = req.headers.lang || 'en';
      const sanitizedWord = this.sanitizeKey(word);
      const cacheKey = `word_${sanitizedWord}_${lang}`;
      const cachedTranslation = this.cache.get(cacheKey);

      if (cachedTranslation) {
        return cachedTranslation as string;
      }

      const translation = this.translations[sanitizedWord] || word; // Fallback to the original word
      this.cache.set(cacheKey, translation);
      return translation;
    } catch (error) {
      throw new Error('Translation error: ' + error.message);
    }
  }

  // Helper function to sanitize keys
  sanitizeKey(key: string): string {
    return `${key}`?.replace(/\s+/g, '_').toLowerCase(); 
  }
}
