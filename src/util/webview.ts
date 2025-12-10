export function getHtmlForWebview(markdownContent: string, includeButtons: boolean = false, docName?: string): string {
    const htmlContent = convertMarkdownToHtml(markdownContent, includeButtons);

    let scriptTag = '';
    if (includeButtons) {
        scriptTag = `<script>
                function executeCommand(sectionTitle) {
                    try {
                        // 获取一级标题
                        const h1Element = document.querySelector('h1');
                        const mainTitle = h1Element ? h1Element.textContent : '';

                        // 获取文档名称
                        const bodyElement = document.querySelector('body');
                        const docName = bodyElement ? bodyElement.getAttribute('data-docname') : '';

                        // 调用VS Code命令
                        const vscode = window.acquireVsCodeApi();
                        vscode.postMessage({
                            command: 'executeSectionCommand',
                            mainTitle: mainTitle,
                            sectionTitle: sectionTitle,
                            docName: docName
                        });
                    } catch (error) {
                        console.error('Error in executeCommand:', error);
                    }
                }
            </script>`;
    }

    return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { box-sizing: border-box; }
                body {
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                    font-weight: 400;
                    letter-spacing: 0.025em;
                    line-height: var(--vscode-editor-line-height);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 20px 60px 40px;
                    max-width: 900px;
                    margin: 0 auto;
                }
                pre {
                    background: var(--vscode-textCodeBlock-background);
                    border: 1px solid var(--vscode-textBlockQuote-border);
                    border-radius: 3px;
                    padding: 16px;
                    overflow-x: auto;
                    margin: 16px 0;
                }
                code {
                    background: var(--vscode-textCodeBlock-background);
                    color: var(--vscode-textPreformat-foreground);
                    font-family: var(--vscode-editor-font-family);
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-size: 0.9em;
                }
                pre code {
                    background: transparent;
                    padding: 0;
                    border-radius: 0;
                    font-size: inherit;
                }
                h1, h2, h3, h4, h5, h6 {
                    color: var(--vscode-editor-foreground);
                    margin-top: 24px;
                    margin-bottom: 16px;
                    font-weight: 600;
                    line-height: 1.25;
                }
                h1 { font-size: 2em; border-bottom: 1px solid var(--vscode-textSeparator-foreground); padding-bottom: 0.3em; }
                h2 { font-size: 1.5em; }
                h3 { font-size: 1.25em; }
                h4 { font-size: 1em; }
                h5 { font-size: 0.875em; }
                h6 { font-size: 0.85em; }
                p { margin: 16px 0; }
                ul, ol { margin: 16px 0; padding-left: 32px; }
                li { margin: 4px 0; }
                li p { margin: 8px 0; }
                blockquote {
                    background: var(--vscode-textBlockQuote-background);
                    border-left: 4px solid var(--vscode-textBlockQuote-border);
                    padding: 8px 16px;
                    margin: 16px 0;
                    color: var(--vscode-textBlockQuote-foreground);
                }
                a {
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                }
                a:hover, a:active {
                    color: var(--vscode-textLink-activeForeground);
                    text-decoration: underline;
                }
                strong { font-weight: 600; }
                em { font-style: italic; }
                table {
                    border-collapse: collapse;
                    margin: 16px 0;
                    width: 100%;
                    border: 1px solid var(--vscode-panel-border);
                }
                th, td {
                    border: 1px solid var(--vscode-panel-border);
                    padding: 6px 12px;
                }
                th {
                    background-color: var(--vscode-textBlockQuote-background);
                    font-weight: 600;
                }
                hr {
                    border: none;
                    border-top: 1px solid var(--vscode-textSeparator-foreground);
                    margin: 24px 0;
                }
            </style>
        </head>
        <body data-docname="${docName || ''}">
            ${htmlContent}
            ${scriptTag}
        </body>
        </html>`;
}

export function convertMarkdownToHtml(markdownContent: string, includeButtons: boolean = false): string {
    if (!markdownContent) return '';

    let html = markdownContent;

    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><code>${code}</code></pre>`;
    });

    html = html.replace(/`([^`\n]+)`/g, (match, code) => {
        return `<code>${code}</code>`;
    });

    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    if (includeButtons) {
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2><div style="text-align: right; margin-bottom: 16px;"><button onclick="executeCommand(\'$1\')" style="background-color: var(--vscode-button-background); color: var(--vscode-button-foreground); border: 1px solid var(--vscode-button-border); padding: 4px 8px; border-radius: 3px; cursor: pointer;">执行</button></div>');
    } else {
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    }
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    const listRegex = /^(\s*)([-*])\s+(.*)$/gm;
    let inList = false;
    let listLevel = 0;

    html = html.split('\n').map(line => {
        const listMatch = line.match(/^(\s*)([-*])\s+(.*)$/);
        if (listMatch) {
            const indent = listMatch[1].length;
            const marker = listMatch[2];
            const content = listMatch[3];

            if (!inList || indent !== listLevel) {
                if (inList) {
                    return '</ul>\n' + '<ul>\n<li>' + content + '</li>';
                } else {
                    inList = true;
                    listLevel = indent;
                    return '<ul>\n<li>' + content + '</li>';
                }
            } else {
                return '<li>' + content + '</li>';
            }
        } else if (inList) {
            inList = false;
            listLevel = 0;
            return '</ul>\n' + line;
        }
        return line;
    }).join('\n');

    if (inList) {
        html += '\n</ul>';
    }

    const orderedListRegex = /^(\s*)(\d+)\.\s+(.*)$/gm;
    let inOrderedList = false;
    let orderedListLevel = 0;

    html = html.split('\n').map(line => {
        const orderedListMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (orderedListMatch) {
            const indent = orderedListMatch[1].length;
            const number = orderedListMatch[2];
            const content = orderedListMatch[3];

            if (!inOrderedList || indent !== orderedListLevel) {
                if (inOrderedList) {
                    return '</ol>\n' + '<ol>\n<li>' + content + '</li>';
                } else {
                    inOrderedList = true;
                    orderedListLevel = indent;
                    return '<ol>\n<li>' + content + '</li>';
                }
            } else {
                return '<li>' + content + '</li>';
            }
        } else if (inOrderedList) {
            inOrderedList = false;
            orderedListLevel = 0;
            return '</ol>\n' + line;
        }
        return line;
    }).join('\n');

    if (inOrderedList) {
        html += '\n</ol>';
    }

    const lines = html.split('\n');
    const processedLines: string[] = [];
    let paragraphBuffer: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('<h') || trimmed.startsWith('<ul') ||
            trimmed.startsWith('<ol') || trimmed.startsWith('<li') || trimmed.startsWith('<pre') ||
            trimmed.startsWith('<blockquote') || trimmed.startsWith('</')) {
            if (paragraphBuffer.length > 0) {
                processedLines.push('<p>' + paragraphBuffer.join(' ') + '</p>');
                paragraphBuffer = [];
            }
            processedLines.push(line);
        } else {
            paragraphBuffer.push(line);
        }
    }

    if (paragraphBuffer.length > 0) {
        processedLines.push('<p>' + paragraphBuffer.join(' ') + '</p>');
    }

    html = processedLines.join('\n');

    html = html.replace(/\n/g, '<br>');

    html = html.replace(/(<br>)+/g, '<br>');
    html = html.replace(/<p>(<br>)+/g, '<p>');
    html = html.replace(/(<br>)+<\/p>/g, '</p>');

    return html;
}