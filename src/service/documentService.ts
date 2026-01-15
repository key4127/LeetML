import * as vscode from 'vscode';
import * as path from 'path';
import { getHtmlForWebview } from '../view/webview';
import { EditCodeService } from '../type/interface';

export class DocumentService {
    private extensionPath: string;
    private panels: Map<string, vscode.WebviewPanel> = new Map();

    constructor(extensionPath: string, private editCodeService?: EditCodeService) {
        this.extensionPath = extensionPath;
    }

    public movePanelToRight(docName: string) {
        const panel = this.panels.get(docName);
        if (panel) {
            panel.reveal(vscode.ViewColumn.Two);
        }
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
                existingPanel.reveal();
                return;
            }

            const doc = await vscode.workspace.openTextDocument(docPath);
            const panel = vscode.window.createWebviewPanel(
                'leetml.markdownPreview',
                docName,
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: []
                }
            );
            panel.webview.options = {
                enableScripts: true,
                localResourceRoots: []
            };

            panel.webview.html = getHtmlForWebview(doc.getText(), true, docName);

            const messageHandler = panel.webview.onDidReceiveMessage(
                async (message) => {
                    switch (message.command) {
                        case 'openCodeEditor':
                            if (this.editCodeService) {
                                await this.editCodeService.editCode(message.mainTitle, message.sectionTitle, message.docName);
                            }
                            break;
                    }
                }
            );
            panel.onDidDispose(() => {
                this.panels.delete(docName);
            });
            
            this.panels.set(docName, panel);

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open document: ${error}`);
        }
    }

    public async revive(panel: vscode.WebviewPanel, docName: string) {
        const docPath = path.join(
            this.extensionPath,
            'resources',
            'docs',
            docName + '.md');

        try {
            const doc = await vscode.workspace.openTextDocument(docPath);

            panel.webview.options = { enableScripts: true };
            panel.webview.html = getHtmlForWebview(doc.getText(), true, docName);

            panel.webview.onDidReceiveMessage(async (message) => {
                if (message.command === 'openCodeEditor') {
                    await this.editCodeService?.editCode(
                        message.mainTitle,
                        message.sectionTitle,
                        message.docName
                    );
                }
            })

            this.panels.set(docName, panel);
            panel.onDidDispose(() => this.panels.delete(docName));
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to revive: ${error}`)
            panel.dispose();
        }
    }
}