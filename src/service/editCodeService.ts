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

        const uri = vscode.Uri.parse(`leetml://workspace/${mainTitle}/${sectionTitle}.py`);

        try {
            const doc = await vscode.workspace.openTextDocument(uri);

            await vscode.window.showTextDocument(doc, {
                viewColumn: vscode.ViewColumn.One,
                preserveFocus: false,
                preview: false
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open code editor: ${error}`);
        }
    }

    public dispose() {
        this.codeEditors.clear();
    }
}