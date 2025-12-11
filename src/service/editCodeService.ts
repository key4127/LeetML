import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class EditCodeService {
    private codeEditors: Map<string, vscode.TextEditor> = new Map();
    private documentService?: { movePanelToRight: (docName: string) => void };
    private userCodesDir: string;

    constructor(extensionPath: string) {
        this.userCodesDir = path.join(extensionPath, 'user-written-codes');

        if (!fs.existsSync(this.userCodesDir)) {
            fs.mkdirSync(this.userCodesDir, { recursive: true });
        }
    }

    public setDocumentService(documentService: { movePanelToRight: (docName: string) => void }) {
        this.documentService = documentService;
    }

    public async editCode(mainTitle: string, sectionTitle: string, docName?: string) {
        if (!sectionTitle || typeof sectionTitle !== 'string') {
            throw new Error('sectionTitle is required and must be a string');
        }

        const key = `${mainTitle || 'Unknown'}_${sectionTitle}`;

        const existingEditor = this.codeEditors.get(key);
        if (existingEditor) {
            await vscode.window.showTextDocument(existingEditor.document, {
                viewColumn: vscode.ViewColumn.One,
                preserveFocus: false
            });
            return;
        }

        try {
            await this.performAtomicEditCode(mainTitle, sectionTitle, docName);

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open code editor: ${error}`);
        }
    }

    private async performAtomicEditCode(mainTitle: string, sectionTitle: string, docName?: string) {
        const key = `${mainTitle}_${sectionTitle}`;

        try {
            if (!fs.existsSync(this.userCodesDir)) {
                fs.mkdirSync(this.userCodesDir, { recursive: true });
            }

            const fileName = `${mainTitle}-${sectionTitle}.py`.toLowerCase();
            const filePath = path.join(this.userCodesDir, fileName);

            let document: vscode.TextDocument;

            if (fs.existsSync(filePath)) {
                document = await vscode.workspace.openTextDocument(filePath);
            } else {
                const initialContent = this.getInitialCodeTemplate(mainTitle, sectionTitle);
                fs.writeFileSync(filePath, initialContent, 'utf8');
                document = await vscode.workspace.openTextDocument(filePath);
            }

            const editor = await vscode.window.showTextDocument(document, {
                viewColumn: vscode.ViewColumn.One,
                preserveFocus: false
            });

            await this.setEditorLabel(editor, `${mainTitle} - ${sectionTitle}`);

            if (docName && this.documentService) {
                this.documentService.movePanelToRight(docName);
            }

            this.codeEditors.set(key, editor);

            const disposable = vscode.window.onDidChangeVisibleTextEditors(editors => {
                if (!editors.includes(editor)) {
                    this.codeEditors.delete(key);
                    disposable.dispose();
                }
            });

        } catch (error) {
            try {
                await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

                await vscode.commands.executeCommand('vscode.setEditorLayout', {
                    orientation: 0,
                    groups: [{ size: 1.0 }]
                });
            } catch (recoveryError) {
                console.warn('Failed to recover from error:', recoveryError);
            }
            throw error;
        }
    }

    private getInitialCodeTemplate(mainTitle: string, sectionTitle: string): string {
        const safeMainTitle = mainTitle || 'Unknown';
        const safeSectionTitle = sectionTitle || 'Unknown';

        return `# ${safeMainTitle} - ${safeSectionTitle}
def ${safeSectionTitle.replace(/\s+/g, '_')}_function():
    """
    Implementation for ${safeSectionTitle}
    """
    pass
`;
    }

    private async setEditorLabel(editor: vscode.TextEditor, label: string) {
        // 使用VS Code的私有API设置标签页名称（如果可用）
        // 对于未命名文档，默认会显示"Untitled-X"，这里我们保持原样
        // 用户可以通过配置隐藏或自定义标签页显示
    }

    public dispose() {
        this.codeEditors.clear();
    }
}