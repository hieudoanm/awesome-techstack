import axios from 'axios';
import { writeFileSync } from 'fs';
import yaml from 'js-yaml';

const main = async () => {
  try {
    const url =
      'https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml';
    const response = await axios.get<string>(url);
    const data = response.data;
    const json: Record<string, any> = yaml.load(data) as Record<string, any>;
    const allLanguages = Object.keys(json).map((key) => {
      const language = json[key];
      return { ...language, language: key };
    });
    const allKeys = allLanguages
      .map((language) => Object.keys(language))
      .flat()
      .sort()
      .filter((value, index, array) => array.indexOf(value) === index);
    const languages = allLanguages.map((l) => {
      const language: Record<string, any> = {};
      for (const key of allKeys) {
        language[key] = l[key] || '';
      }
      return language;
    });
    await writeFileSync('./data/languages.yml', data);
    await writeFileSync(
      './data/languages.json',
      JSON.stringify(languages, null, 2)
    );

    const csvHeaders = allKeys.join(',');
    const csvRows = languages
      .map((language) => allKeys.map((key) => `"${language[key]}"`).join(','))
      .join('\n');
    const csv = `${csvHeaders}\n${csvRows}`;
    await writeFileSync('./data/languages.csv', csv);
    process.exit(0);
  } catch (error) {
    console.error('Error', error);
    process.exit(1);
  }
};

main().catch((error) => console.error(error));
