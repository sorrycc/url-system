import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export function getEnv() {
  const envPath = path.join(__dirname, '../.env');
  return fs.existsSync(envPath)
    ? dotenv.parse(fs.readFileSync(envPath, 'utf-8'))
    : process.env;
}
