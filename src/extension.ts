import * as vscode from 'vscode';
import TreeDataProvider from './provider/treeDataProvider';
import { DocumentService } from './service/documentService';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "leetml" is now active!');

	const treeDataProvider = new TreeDataProvider();
	const treeView = vscode.window.createTreeView(
		'main',
		{treeDataProvider: treeDataProvider}
	);
	context.subscriptions.push(treeView);

	const documentService = new DocumentService(context.extensionPath);
	const openDocCommand = vscode.commands.registerCommand(
		'leetml.openDocument',
		async (docName: string) => {
			await documentService.openDocument(docName);
		}
	);
	context.subscriptions.push(openDocCommand);

	const helloWorldCommand = vscode.commands.registerCommand('leetml.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from LeetML!');
	});
	context.subscriptions.push(helloWorldCommand);
}

export function deactivate() {}
