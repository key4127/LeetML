import * as vscode from 'vscode';
import TreeDataProvider from './provider/treeDataProvider';
import { TREE_ITEMS } from './config/treeData';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "leetml" is now active!');

	const provider = new TreeDataProvider();
	const treeView = vscode.window.createTreeView(
		'main',
		{treeDataProvider: provider}
	);
	context.subscriptions.push(treeView);

	const disposable = vscode.commands.registerCommand('leetml.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from LeetML!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
