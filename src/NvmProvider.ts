import * as vscode from 'vscode';
import { getNodeVersion, getNvmList } from './nvm';
import { EXT_NAME } from './constants';
import { Configuration } from './settings';

export class NvmProvider implements vscode.TreeDataProvider<NvmItem> {
  settings: vscode.WorkspaceConfiguration;
  nodeVersion: string;

  constructor() {
    this.settings = vscode.workspace.getConfiguration(EXT_NAME);
    this.nodeVersion = getNodeVersion();
  }

  private _onChangeTreeData: vscode.EventEmitter<NvmItem | undefined | void> = new vscode.EventEmitter();

  onDidChangeTreeData?: vscode.Event<void | NvmItem | NvmItem[] | null | undefined> | undefined = this._onChangeTreeData.event;

  // click if command it is undefined
  // resolveTreeItem(item: vscode.TreeItem, element: NvmItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
  //   return item;
  // }

  getTreeItem(element: NvmItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  
  getChildren(/* element?: NvmItem | undefined */): Promise<NvmItem[] | null | undefined> {
    const nvmList = getNvmList(this.settings.get(Configuration.whichNvm));
    const isNvm = nvmList.includes(this.nodeVersion);
    const versionRegex = new RegExp(`^v?${isNvm ? this.nodeVersion : 'system'}`);
    return Promise.resolve(nvmList.map(v => {
      let match: boolean = versionRegex.test(v);
      return new NvmItem({
        label: v,
        highlights: match ? [[0, v.length]] : []
      }, vscode.TreeItemCollapsibleState.None, match);
    }));
  }

  refresh() {
    this._onChangeTreeData.fire();
  }
}

export class NvmItem extends vscode.TreeItem {
  constructor(
    public readonly label: vscode.TreeItemLabel,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly match: boolean,
    public readonly levelValue: string = 'nvmItem'
  ) {
    super(label, collapsibleState);
    this.iconPath = match ? new vscode.ThemeIcon('unlock') : new vscode.ThemeIcon('lock');
    this.contextValue = match ? 'nvmMatchItem' : levelValue;
  }
}