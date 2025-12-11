import * as vscode from 'vscode';
import { TREE_ITEMS } from '../config/treeData';

class TreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
		if (!element) {
			const categories = Object.keys(TREE_ITEMS);
			return categories.map(category => {
				const item = new vscode.TreeItem(
					category,
					vscode.TreeItemCollapsibleState.Collapsed
				);
				return item;
			});
		}

		const category = element.label as keyof typeof TREE_ITEMS;
		const categoryData = TREE_ITEMS[category];

		if (categoryData) {
			const root = categoryData[0];
			return root.children.map(child => {
				const item = new vscode.TreeItem(child.label, vscode.TreeItemCollapsibleState.None);
				item.command = {
					command: 'leetml.openDocument',
					title: child.title,
					arguments: [`${category}`]
				};
				return item;
			});
		}

		return [];
	}
}

export default TreeDataProvider;