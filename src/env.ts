import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export function getEnv() {
  return dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8'));
}
