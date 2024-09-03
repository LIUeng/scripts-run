import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs";
import { Configuration } from "./settings";
import { EXT_NAME } from "./constants";
import { globSync } from 'glob';
import { pathExists } from "./utils";

export class ScriptsProvider implements vscode.TreeDataProvider<ScriptItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ScriptItem | undefined | void
  > = new vscode.EventEmitter();

  onDidChangeTreeData?:
    | vscode.Event<void | ScriptItem | ScriptItem[] | null | undefined>
    | undefined = this._onDidChangeTreeData.event;

  private storagePath: string;
  private scripts: Map<string, ScriptItem[]>;
  private settings: vscode.WorkspaceConfiguration;
  
  constructor(private workspaceFolders: readonly vscode.WorkspaceFolder[], context: vscode.ExtensionContext) {
    this.storagePath = path.join(context.extensionPath, '.manifest.json');
    this.scripts = new Map<string, ScriptItem[]>();
    this.settings = vscode.workspace.getConfiguration(EXT_NAME);
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  reload() {
    this.scripts = new Map<string, ScriptItem[]>();
    this.refresh();
  }

  getTreeItem(element: ScriptItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChild(node?: ScriptItem | undefined): ScriptItem[] {
    // parallel
    if (node) {
      return this.getScriptsWithFolders(node.rootPath);
    }
    return this.workspaceFolders.map((workspaceFolder, index) => {
      const rootPath = workspaceFolder.uri.fsPath;
      return new ScriptItem(
        path.basename(rootPath),
        index === 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
        '',
        rootPath,
        pathExists(path.join(rootPath, 'package.json')) ? 'lastScriptFolder' : void 0
      );
    });
  }

  getChildren(
    node?: ScriptItem | undefined
  ): vscode.ProviderResult<ScriptItem[]> {
    if (!this.workspaceFolders.length) {
      vscode.window.showInformationMessage("Empty workspace");
      return Promise.resolve([]);
    }
    return Promise.resolve(this.getChild(node));
  }


  private getScriptsInPackageJson(rootPath: string): ScriptItem[] {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), "utf-8"));
    const scripts: ScriptsRun.StorageValue = packageJson.scripts || {};
    return Object.keys(scripts).map((name) => {
      return new ScriptItem(
        name,
        vscode.TreeItemCollapsibleState.None,
        scripts[name],
        rootPath,
        'scriptItem'
      );
    });
  }

  private getStorageScripts(rootPath: string): ScriptItem[] {
    if (pathExists(this.storagePath) && rootPath) {
      try {
        const storageData: ScriptsRun.StorageProps = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
        const scripts: null | ScriptsRun.StoragePropsValue = storageData[rootPath];
        if (!scripts) {
          return [];
        }
        return scripts.map(item => {
          return new ScriptItem(item.k, vscode.TreeItemCollapsibleState.None, item.v, rootPath, 'scriptItem', 1);
        });
      } catch(e) {
        // ignore error
      }
    }
    return [];
  }

  // find scripts in package.json
  // also find in cache
  getScriptsWithFolders(rootPath: string): ScriptItem[] {
    let result: ScriptItem[] = [];
    const dirs = globSync("**", {
      cwd: rootPath,
      maxDepth: 1,
      ignore: this.settings.get(Configuration.exclude) as string[],
    }).slice(1);
    // current package.json
    if (dirs.includes('package.json')) {
      // cache find
      let packageJsonScripts: ScriptItem[] = this.getStorageScripts(rootPath);
      if (this.scripts.has(rootPath)) {
        packageJsonScripts = this.scripts.get(rootPath) as ScriptItem[];
      } else {
        packageJsonScripts = packageJsonScripts.concat(this.getScriptsInPackageJson(rootPath));
        this.scripts.set(rootPath, packageJsonScripts);
      }
      result = result.concat(packageJsonScripts);
    }
    // level recursive
    if (this.settings.get(Configuration.tree)) {
      let toggle = false;
      dirs.forEach(dir => {
        const cwd = path.join(rootPath, dir);
        const stats = fs.statSync(path.join(rootPath, dir));
        if (stats.isDirectory()) {
          const node = new ScriptItem(
            path.basename(cwd),
            !toggle ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
            '',
            cwd,
            pathExists(path.join(cwd, 'package.json')) ? 'lastScriptFolder' : void 0
          );
          const children = this.getChild(node);
          if (children.length > 0) {
            result.push(node);
          }
          toggle = true;
        }
      });
    }
    return result;
  }

  // fs write storage data
  updateScriptsStorage(node: ScriptItem, type: ScriptsRun.StorageOperate = 'add') {
    // only custom script need write
    if (node.type !== 1 && type !== 'delAll') {
      return;
    }
    let stream: ScriptsRun.StorageProps = {};
    let rootPath = node.rootPath;
    try {
      stream = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
    } catch(e) {
      stream = {};
    }
    switch(type) {
      case 'add':
        let cacheNode = { k: node.label, v: node.script };
        if (stream[rootPath]) {
          stream[rootPath].push(cacheNode);
        } else {
          stream[rootPath] = [cacheNode];
        }
        break;
      case 'del':
        let cacheNodes = stream[rootPath];
        let removeIdx = cacheNodes.findIndex(s => s.k === node.label);
        if (~removeIdx) {
          cacheNodes.splice(removeIdx, 1);
        }
        break;
      case 'delAll':
        stream[rootPath] = [];
        break;
    }
    fs.writeFileSync(this.storagePath, JSON.stringify(stream), {
      encoding: 'utf-8',
      flag: 'w+'
    });
  }

  // delete item
  delete(node: ScriptItem) {
    if (this.scripts.has(node.rootPath)) {
      const cacheScripts = this.scripts.get(node.rootPath) || [];
      const delIdx = cacheScripts.findIndex(item => item.label === node.label && node.type === item.type);
      if (~delIdx) {
        cacheScripts?.splice(delIdx, 1);
        this.updateScriptsStorage(node, 'del');
        this.refresh();
      }
    }
  }

  // delete root path items below
  deleteAll(node: ScriptItem) {
    if (this.scripts.has(node.rootPath)) {
      this.scripts.set(node.rootPath, []);
      this.updateScriptsStorage(node, 'delAll');
      this.refresh();
    }
  }

  // add script item
  add(node: ScriptItem, label: string, desc: string): void {
    let scriptItem = new ScriptItem(label, vscode.TreeItemCollapsibleState.None, desc, node.rootPath, 'scriptItem', 1);
    if (this.scripts.has(node.rootPath)) {
      const scripts = this.scripts.get(node.rootPath) || [];
      if (scripts.find(s => s.label === label)) {
        vscode.window.showErrorMessage('The script name is repeat. Please add it again. Otherwise, an error occurs');
        return void 0;
      } else {
        // cache the custom scripts
        if (this.settings.get(Configuration.cache)) {
          this.updateScriptsStorage(scriptItem);
        }
        scripts.unshift(scriptItem);
      }
    } else {
      this.scripts.set(node.rootPath, [scriptItem]);
    }
    this.refresh();
  }
}

export class ScriptItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly script: string,
    public readonly rootPath: string,
    public readonly levelValue: string = 'scriptFolder',
    public readonly type: number = 0
  ) {
    super(label, collapsibleState);

    // extend props
    this.description = script;
    this.tooltip = script;

    // context value
    this.contextValue = levelValue;

    // icon
    this.iconPath = 
      levelValue === "scriptItem"
        ? type === 1
          ? new vscode.ThemeIcon("reactions")
          : new vscode.ThemeIcon("repl")
        : new vscode.ThemeIcon("root-folder");
  }
}
