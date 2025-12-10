import * as vscode from 'vscode';
import * as path from 'path';
import { getHtmlForWebview } from '../util/webview';
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
                existingPanel.reveal(vscode.ViewColumn.One);
                return;
            }

            const doc = await vscode.workspace.openTextDocument(docPath);
            const panel = vscode.window.createWebviewPanel(
                'markdownPreview',
                docName,
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: []
                }
            );
            // 设置webview的选项，让JavaScript可以访问docName
            panel.webview.options = {
                enableScripts: true,
                localResourceRoots: []
            };

            // 在HTML中嵌入docName信息
            panel.webview.html = getHtmlForWebview(doc.getText(), true, docName);

            // 处理webview消息
            const messageHandler = panel.webview.onDidReceiveMessage(
                async (message) => {
                    switch (message.command) {
                        case 'executeSectionCommand':
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
}