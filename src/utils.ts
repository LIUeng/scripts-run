import * as fs from 'node:fs';
import * as path from 'node:path';

export function pathExists(_path: string): boolean {
  try {
    fs.accessSync(_path);
  } catch (err) {
    return false;
  }
  return true;
}

// get which type
// npm yarn pnpm
export function getWhichType(rootPath: string): 'npm' | 'yarn' | 'pnpm' {
  if (pathExists(path.join(rootPath, 'yarn.lock'))) {
    return 'yarn';
  } else if (pathExists(path.join(rootPath, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  return 'npm';
}