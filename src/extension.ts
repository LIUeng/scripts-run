import * as vscode from 'vscode';
import { ScriptItem, ScriptsProvider } from './ScriptsProvider';
import { EXT_NAME } from './constants';
import { Configuration } from './settings';

export function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) 
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	const nodeScriptsProvider = new ScriptsProvider(rootPath, context);

	// cache terminal
	const terminals = new Map<string, vscode.Terminal>();
	// default open settings
	const settings = vscode.workspace.getConfiguration(EXT_NAME);

	// register
	vscode.window.registerTreeDataProvider('run', nodeScriptsProvider);

	// run.refresh
	context.subscriptions.push(
		vscode.commands.registerCommand('run.refresh', () => nodeScriptsProvider.refresh())
	);

	// run.add
	vscode.commands.registerCommand('run.add', () => {
		
	});

	// run.delete
	vscode.commands.registerCommand('run.delete', (node: ScriptItem) => {
		nodeScriptsProvider.delete(node);
	});

	// run.play
	vscode.commands.registerCommand('run.play', (node: ScriptItem) => {
		let terminal;

		if (terminals.has(node.label)) {
			terminal = terminals.get(node.label);
		} else {
			terminal = vscode.window.createTerminal({
				name: `${node.label} Scripts.Run`,
				iconPath: new vscode.ThemeIcon('keyboard'),
				cwd: rootPath,
				// shellPath: 'npm',
				// shellArgs: ['run', node.script],
			});
			terminals.set(node.label, terminal);
		}

		if (!terminal) {
			return;
		}

		// show terminal window
		if (settings.get(Configuration.terminal) === true) {
			terminal.show();
		} else {
			terminal.hide();
		}

		terminal.sendText(`npm run ${node.script}`, true);
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
