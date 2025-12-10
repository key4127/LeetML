import * as vscode from 'vscode';
import * as path from 'path';
import { getHtmlForWebview } from '../util/webview';

export class DocumentService {
    private extensionPath: string;
    private panels: Map<string, vscode.WebviewPanel> = new Map();

    constructor(extensionPath: string) {
        this.extensionPath = extensionPath;
    }

    public async openDocument(docName: string) {
        const docPath = path.join(
            this.extensionPath,
            'resources',
            'docs',
            docName + '.md');

        try {
            const existingPanel = this.panels.get(docName);
            if (existingPanel) {
                existingPanel.reveal(vscode.ViewColumn.One);
                return;
            }

            const doc = await vscode.workspace.openTextDocument(docPath);
            const panel = vscode.window.createWebviewPanel(
                'markdownPreview',
                docName,
                vscode.ViewColumn.One,
                {}
            );
            panel.webview.html = getHtmlForWebview(doc.getText());
            panel.onDidDispose(() => {
                this.panels.delete(docName);
            });
            
            this.panels.set(docName, panel);

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open document: ${error}`);
        }
    }
}