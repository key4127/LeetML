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
            const uri = vscode.Uri.parse(`leetml://workspace/${mainTitle}/${sectionTitle}.py`);

            const document = await vscode.workspace.openTextDocument(uri);

            const editor = await vscode.window.showTextDocument(document, {
                viewColumn: vscode.ViewColumn.One,
                preserveFocus: false
            });

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


    public dispose() {
        this.codeEditors.clear();
    }
}