import * as vscode from 'vscode';
import { ScriptItem, ScriptsProvider } from './ScriptsProvider';
import { EXT_NAME } from './constants';
import { Configuration } from './settings';
import { NvmProvider } from './NvmProvider';

export function activate(context: vscode.ExtensionContext) {
	// multi workspace folders support
	const workspaceFolders = vscode.workspace.workspaceFolders || [];
	// default open settings
	const settings = vscode.workspace.getConfiguration(EXT_NAME);

	// register: nvm palette
	let useNvm: Map<string, boolean> | null = null;
	const nvmProvider = new NvmProvider();
	vscode.window.registerTreeDataProvider('nvm', nvmProvider);
	// nvm.reload
	vscode.commands.registerCommand('nvm.reload', () => {
		nvmProvider.refresh();
	});
	// nvm.choice -> choose the node version
	vscode.commands.registerCommand('nvm.choice', (item: vscode.TreeItem) => {
		useNvm = new Map<string, boolean>();
		nvmProvider.nodeVersion = (item.label as vscode.TreeItemLabel)?.label;
		nvmProvider.refresh();
		vscode.window.showInformationMessage(`Choose node version -> ${nvmProvider.nodeVersion} successfully`);
	});

	// register: run palette
	const nodeScriptsProvider = new ScriptsProvider(workspaceFolders, context);
	vscode.window.registerTreeDataProvider('run', nodeScriptsProvider);
	// run.refresh
	context.subscriptions.push(
		vscode.commands.registerCommand('run.reload', () => nodeScriptsProvider.reload())
	);
	// run.add
	vscode.commands.registerCommand('run.add', async (node: ScriptItem) => {
		// label desc
		const label = await vscode.window.showInputBox({
			placeHolder: 'Type the script name',
			validateInput(value) {
				if (!value || /\s+/.test(value)) {
					return 'Input value can\'t empty or contain whitespace';
				}
				return null;
			}
		});
		if (!label) {
			return;
		}

		const desc = await vscode.window.showInputBox({
			placeHolder: `Type the (${label}) script value`,
			validateInput(value) {
				if (!value) {
					return 'Input value can\'t empty';
				}
			}
		});
		if (!desc) {
			return;
		}

		nodeScriptsProvider.add(node, label, desc);
	});
	// run.delete
	vscode.commands.registerCommand('run.delete', (node: ScriptItem) => {
		nodeScriptsProvider.delete(node);
	});
	vscode.commands.registerCommand('run.deleteAll', (node: ScriptItem) => {
		nodeScriptsProvider.deleteAll(node);
	});

	// run type
	function run(node: ScriptItem, isNewTerminal: boolean = true) {
		let name = isNewTerminal ? node.label : 'run';
		let terminal = vscode.window.terminals.find(t => t.name === name);
		let whichType = settings.get(Configuration.whichType) || node.whichType || 'npm';

		if (!terminal) {
			terminal = vscode.window.createTerminal({
				name,
				iconPath: new vscode.ThemeIcon('keyboard'),
				cwd: node.rootPath,
			});
		}

		// Send Ctrl+C to stop the current process
		// terminal.sendText('\x03');

		// show terminal window
		if (settings.get(Configuration.terminal) === true) {
			terminal.show();
		} else {
			terminal.hide();
		}
		
		let terminalTxt = '';
		if (node.type === 1) {
			terminalTxt = (node.description || '') as string;
		} else {
			terminalTxt = `${whichType} run ${node.label}`;
		}

		if (!terminalTxt) {
			return;
		}

		if (useNvm !== null && !useNvm.get(node.label) && nvmProvider.nodeVersion) {
			terminal.sendText(`nvm use ${nvmProvider.nodeVersion}`);
			useNvm.set(node.label, true);
		}

		terminal.sendText(terminalTxt, true);
	}
	// run.play
	vscode.commands.registerCommand('run.play', async (node: ScriptItem) => {
		run(node, false);
	});
	// run.play-new
	vscode.commands.registerCommand('run.play-new', async (node: ScriptItem) => {
		run(node);
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
