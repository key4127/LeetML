import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export default class FileSystemProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile = this._onDidChangeFile.event;

    private extensionPath: string;

    constructor(extensionPath: string) {
        this.extensionPath = extensionPath;
    }

    watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[] }): vscode.Disposable {
        return new vscode.Disposable(() => {});
    }

    stat(uri: vscode.Uri): vscode.FileStat {
        const realPath = this.getRealPath(uri);
        if (fs.existsSync(realPath)) {
            const stats = fs.statSync(realPath);
            return {
                type: stats.isDirectory() ? vscode.FileType.Directory : vscode.FileType.File,
                ctime: stats.ctime.getTime(),
                mtime: stats.mtime.getTime(),
                size: stats.size
            };
        }

        return {
            type: vscode.FileType.File,
            ctime: Date.now(),
            mtime: Date.now(),
            size: 0
        };
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
        const realPath = this.getRealPath(uri);
        if (fs.existsSync(realPath)) {
            return fs.readdirSync(realPath).map(name => {
                const itemPath = path.join(realPath, name);
                const stat = fs.statSync(itemPath);
                return [name, stat.isDirectory() ? vscode.FileType.Directory : vscode.FileType.File];
            });
        }
        return [];
    }

    createDirectory(uri: vscode.Uri): void {
        const realPath = this.getRealPath(uri);
        fs.mkdirSync(realPath, { recursive: true });
    }

    readFile(uri: vscode.Uri): Uint8Array {
        const realPath = this.getRealPath(uri);
        if (fs.existsSync(realPath)) {
            return fs.readFileSync(realPath);
        }

        const content = this.getInitialContent(uri);
        this.writeFile(uri, new TextEncoder().encode(content), { create: true, overwrite: true });
        return new TextEncoder().encode(content);
    }

    writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean }): void {
        const realPath = this.getRealPath(uri);
        const dir = path.dirname(realPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(realPath, content);
        this._onDidChangeFile.fire([{
            type: vscode.FileChangeType.Changed,
            uri: uri
        }]);
    }

    delete(uri: vscode.Uri, options: { recursive: boolean }): void {
        const realPath = this.getRealPath(uri);
        if (fs.existsSync(realPath)) {
            if (options.recursive && fs.statSync(realPath).isDirectory()) {
                fs.rmSync(realPath, { recursive: true });
            } else {
                fs.unlinkSync(realPath);
            }
        }
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): void {
        const oldPath = this.getRealPath(oldUri);
        const newPath = this.getRealPath(newUri);
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
        }
    }

    private getRealPath(uri: vscode.Uri): string {
        const parts = uri.path.split('/');
        const mainTitle = parts[1] || 'Unknown';
        const sectionTitle = parts[2]?.replace('.py', '') || 'Unknown';
        const fileName = `${mainTitle}-${sectionTitle}.py`.toLowerCase();
        return path.join(this.extensionPath, 'user-written-codes', fileName);
    }

    private getInitialContent(uri: vscode.Uri): string {
        const parts = uri.path.split('/');
        const mainTitle = parts[1] || 'Unknown';
        const sectionTitle = parts[2]?.replace('.py', '') || 'Unknown';

        return `# ${mainTitle} - ${sectionTitle}
def ${sectionTitle.replace(/\s+/g, '_')}_function():
    """
    Implementation for ${sectionTitle}
    """
    pass
`;
    }
}