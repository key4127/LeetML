import * as vscode from 'vscode';

class TreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
		if (!element) {
			return [new vscode.TreeItem('Welcome', vscode.TreeItemCollapsibleState.Expanded)];
		}

		const child = new vscode.TreeItem('Practice', vscode.TreeItemCollapsibleState.None);
		child.command = {
			"command": "leetml.startPractice",
			"title": "Start Practice"
		};
		return [child];
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "leetml" is now active!');

	const provider = new TreeDataProvider();
	vscode.window.createTreeView('leetml-view', {treeDataProvider: provider});

	const disposable = vscode.commands.registerCommand('leetml.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from LeetML!');
	});

	context.subscriptions.push(disposable);
	//context.subscriptions.push(view);
}

export function deactivate() {}
