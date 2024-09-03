import * as fs from 'node:fs';

export function pathExists(path: string): boolean {
  try {
    fs.accessSync(path);
  } catch (err) {
    return false;
  }
  return true;
}