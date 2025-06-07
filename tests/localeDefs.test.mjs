import fs from 'fs';
import path from 'path';

describe('All locale files are valid JSON and all supported locales are present', () => {
  const localesDir = path.join(process.cwd(), 'src', 'locales');
  const supportedLocales = [
    "bg", "cs", "da", "de", "el", "en-GB", "en-US", "es-419", "es-ES", "fi", "fr", "hi", "hr", "hu", "id", "it", "ja", "ko", "lt", "nl", "no", "pl", "pt-BR", "ro", "ru", "sv-SE", "th", "tr", "uk", "vi", "zh-CN", "zh-TW"
  ];
  const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
  const foundLocales = files.map(f => f.replace(/\.json$/, ''));

  for (const file of files) {
    const filePath = path.join(localesDir, file);
    test(`${file} parses as valid JSON and is a supported locale`, () => {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow(`${file} is not valid JSON`);
      const locale = file.replace(/\.json$/, '');
      expect(supportedLocales.includes(locale)).toBe(true);
    });
  }

  test('all supported locales are present', () => {
    for (const locale of supportedLocales) {
      expect(foundLocales).toContain(locale);
    }
  });

  const enUSPath = path.join(localesDir, 'en-US.json');
  const enUSContent = fs.readFileSync(enUSPath, 'utf8');
  const enUSKeys = Object.keys(JSON.parse(enUSContent));
  for (const file of files) {
    if (file === 'en-US.json') continue;
    const filePath = path.join(localesDir, file);
    test(`${file} has the same keys as en-US.json`, () => {
      const content = fs.readFileSync(filePath, 'utf8');
      const keys = Object.keys(JSON.parse(content));
      const missing = enUSKeys.filter(k => !keys.includes(k));
      const extra = keys.filter(k => !enUSKeys.includes(k));
      expect(missing).toEqual([], `${file} is missing keys: ${missing.join(', ')}`);
      expect(extra).toEqual([], `${file} has extra keys: ${extra.join(', ')}`);
    });
  }
});
