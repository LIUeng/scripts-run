import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs";
import { Configuration } from "./settings";
import { EXT_NAME } from "./constants";

export class ScriptsProvider implements vscode.TreeDataProvider<ScriptItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ScriptItem | undefined | void
  > = new vscode.EventEmitter<ScriptItem | undefined | void>();
  onDidChangeTreeData?:
    | vscode.Event<void | ScriptItem | ScriptItem[] | null | undefined>
    | undefined = this._onDidChangeTreeData.event;

  private storagePath: string;
  private scripts: null | Array<ScriptItem>;
  private settings: vscode.WorkspaceConfiguration;
  
  constructor(private workspaceRoot: string | undefined, context: vscode.ExtensionContext) {
    this.storagePath = path.join(context.extensionPath, '.manifest.json');
    this.scripts = this._init();
    this.settings = vscode.workspace.getConfiguration(EXT_NAME);
  }

  _init() {
    if (!this.workspaceRoot) {
      return [];
    }

    // storage data
    let scripts = this.getStorageScripts();
    const packageJsonPath = path.join(this.workspaceRoot, "package.json");

    if (scripts && scripts.length > 0) {
      scripts = scripts;
    } else if (this.pathExists(packageJsonPath)) {
      scripts = this.getScriptsInPackageJson(packageJsonPath);
    } else {
      vscode.window.showInformationMessage(
        "Workspace has no package.json scripts"
      );
      scripts = [];
    }

    return scripts;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ScriptItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: ScriptItem | undefined
  ): vscode.ProviderResult<ScriptItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("Empty workspace");
      return Promise.resolve([]);
    }

    // parallel
    if (element) {
      return Promise.resolve([]);
    }

    // write storage data
    // wait settings
    if (this.settings.get(Configuration.storage) && this.scripts) {
      this.writeScriptsStorage();
    }

    return Promise.resolve(this.scripts);
  }

  // getParent?(element: ScriptItem): vscode.ProviderResult<ScriptItem> {}
  // resolveTreeItem?(
  //   item: vscode.TreeItem,
  //   element: ScriptItem,
  //   token: vscode.CancellationToken
  // ): vscode.ProviderResult<vscode.TreeItem> {}

  private pathExists(path: string): boolean {
    try {
      fs.accessSync(path);
    } catch (err) {
      return false;
    }
    return true;
  }

  private getScriptsInPackageJson(path: string): Array<ScriptItem> {
    if (this.workspaceRoot) {
      const packageJson = JSON.parse(fs.readFileSync(path, "utf-8"));
      const scripts: { [k: string]: string } = packageJson.scripts || {};

      return Object.keys(scripts).map((name) => {
        return new ScriptItem(
          name,
          vscode.TreeItemCollapsibleState.None,
          scripts[name]
        );
      });
    }

    return [];
  }

  private getStorageScripts(): null | Array<ScriptItem> {
    if (this.pathExists(this.storagePath) && this.workspaceRoot) {
      try {
        const storageData: { [k: string]: [] } = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
        const scripts: null | ScriptsRun.StoragePropsValue = storageData[this.workspaceRoot];
        if (!scripts) {
          return null;
        }
        return scripts.map(item => {
          return new ScriptItem(item.k, vscode.TreeItemCollapsibleState.None, item.v);
        });
      } catch(e) {
        return null;
      }
    }
    return null;
  }

  // fs write storage data
  writeScriptsStorage() {
    if (!this.scripts || !this.workspaceRoot) {
      return;
    }

    let stream: ScriptsRun.StorageProps = {};
    try {
      stream = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
    } catch(e) {
      stream = {};
    }
    stream[this.workspaceRoot] = this.scripts.map(item => ({ k: item.script, v: item.scriptContent }));

    fs.writeFileSync(this.storagePath, JSON.stringify(stream), {
      encoding: 'utf-8',
      flag: 'w+'
    });
  }

  // delete item
  delete(node: ScriptItem) {
    if (!this.scripts || !this.workspaceRoot) {
      return;
    }

    const delIdx = this.scripts.findIndex(item => item.label === node.label);
    this.scripts.splice(delIdx, 1);

    // refresh
    this.refresh();
  }
}

export class ScriptItem extends vscode.TreeItem {
  public scriptContent: string;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly script: string
  ) {
    super(label, collapsibleState);

    // custom props
    this.script = label;
    this.scriptContent = script;

    // extend props
    this.label = label.toLocaleUpperCase();
    this.description = script;
    this.tooltip = script;
  }

  contextValue?: string | undefined = "scriptItem";

  iconPath = new vscode.ThemeIcon('plug');
}
