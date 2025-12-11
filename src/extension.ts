import * as vscode from 'vscode';
import TreeDataProvider from './provider/treeDataProvider';
import { DocumentService } from './service/documentService';
import { EditCodeService } from './service/editCodeService';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "leetml" is now active!');

	const treeDataProvider = new TreeDataProvider();
	const treeView = vscode.window.createTreeView(
		'main',
		{treeDataProvider: treeDataProvider}
	);
	context.subscriptions.push(treeView);

	const editCodeService = new EditCodeService(context.extensionPath);
	const documentService = new DocumentService(context.extensionPath, editCodeService);
	editCodeService.setDocumentService(documentService);

	const openDocCommand = vscode.commands.registerCommand(
		'leetml.openDocument',
		async (docName: string) => {
			await documentService.openDocument(docName);
		}
	);
	context.subscriptions.push(openDocCommand);

	const openCodeEditorCommand = vscode.commands.registerCommand(
		'leetml.openCodeEditor',
		async (mainTitle: string, sectionTitle: string) => {
		    await editCodeService.editCode(mainTitle, sectionTitle);
	    }
    );
	context.subscriptions.push(openCodeEditorCommand);

	context.subscriptions.push({
		dispose: () => editCodeService.dispose()
	});
}

export function deactivate() {}
