import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

export class Cache {
  cache: Map<string, any> = new Map();
  filePath: string;

  constructor(opts: { filePath: string }) {
    mkdirp.sync(path.dirname(opts.filePath));
    this.filePath = opts.filePath;
    const content = fs.existsSync(opts.filePath)
      ? fs.readFileSync(opts.filePath, 'utf-8')
      : `{}`;
    const json = JSON.parse(content);
    this.cache = new Map(Object.entries(json));
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
    // save to file
    const json = Object.fromEntries(this.cache.entries());
    fs.writeFileSync(this.filePath, JSON.stringify(json, null, 2));
  }
}
