import * as path from 'node:path';
import { pathExists } from './utils';
import { globSync } from 'glob';
import * as childProcess from 'child_process';

/**
 * If not specific nvm path, default ~/.nvm
 * @param nvmPath nvm install path
 * @returns node versions already install
 */
export function getNvmList(nvmPath: string | undefined): string[] {
  if (!nvmPath) {
    nvmPath = path.join(process.env.HOME || '~', '.nvm');
  }

  let versions = ['system'];
  let versionsPath = path.join(nvmPath, 'versions', 'node');
  if (pathExists(versionsPath)) {
    versions.push(...globSync('**', {
      cwd: versionsPath,
      maxDepth: 1
    }).slice(1)) ;
  }

  return versions;
}

export function getNodeVersion(): string {
  let version;

  try {
    version = childProcess.execSync('node -v', { encoding: 'utf-8' }) as string;
  } catch(e) {
    version = '';
  }

  return version.trim();
}

// default alias
// export function getNvmNodeVersion(nvmPath: string | undefined): string | null {
//   if (!nvmPath) {
//     nvmPath = path.join(process.env.HOME || '~', '.nvm');
//   }
  
//   let aliasPath = path.join(nvmPath, 'alias', 'default');
//   if (pathExists(aliasPath)) {
//     let str = fs.readFileSync(aliasPath, 'utf-8');

//     return str.trim();
//   }

//   return null;
// }

// node bin path
export function whichNode(): string {
  let str;

  try {
    str = childProcess.execSync('which node', { encoding: 'utf-8' }) as string;
  } catch(e) {
    return '';
  }
  
  // not found
  if (/node\s*not\s*found/.test(str)) {
    return '';
  }

  if (/\.?nvm/.test(str)) {
    let matches;
    if ((matches = str.match(/v?(?:\d+.?)+/))) {
      return matches[0];
    }
  }

  return 'system';
}