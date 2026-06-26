import * as vscode from "vscode";
import * as path from "path";

const selector: vscode.DocumentSelector = { language: "micress" };

function isCommentLine(line: string): boolean {
  return line.trimStart().startsWith("#");
}

function getBaseDir(document: vscode.TextDocument): vscode.Uri | undefined {
  if (document.isUntitled) {
    return vscode.workspace.workspaceFolders?.[0]?.uri;
  }

  return vscode.Uri.file(path.dirname(document.uri.fsPath));
}

function looksLikePath(value: string): boolean {
  return (
    value.includes("/") ||
    value.includes("\\") ||
    value.startsWith(".") ||
    value.startsWith("~")
  );
}

function getPathAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position,
): { text: string; range: vscode.Range } | undefined {
  const line = document.lineAt(position.line).text;

  if (isCommentLine(line)) {
    return undefined;
  }

  const range = document.getWordRangeAtPosition(position, /[^\s"'<>|?*]+/);

  if (!range) {
    return undefined;
  }

  const text = document.getText(range);

  if (!looksLikePath(text)) {
    return undefined;
  }

  return { text, range };
}

function resolvePath(
  document: vscode.TextDocument,
  rawPath: string,
): vscode.Uri | undefined {
  const baseDir = getBaseDir(document);

  if (!baseDir) {
    return undefined;
  }

  if (path.isAbsolute(rawPath)) {
    return vscode.Uri.file(rawPath);
  }

  return vscode.Uri.file(path.resolve(baseDir.fsPath, rawPath));
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(uri: vscode.Uri): Promise<boolean> {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    return stat.type === vscode.FileType.Directory;
  } catch {
    return false;
  }
}

export function registerPathBrowsing(context: vscode.ExtensionContext) {
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    selector,
    {
      async provideCompletionItems(document, position) {
        const found = getPathAtPosition(document, position);

        if (!found) {
          return undefined;
        }

        const raw = found.text;
        const slashIndex = Math.max(
          raw.lastIndexOf("/"),
          raw.lastIndexOf("\\"),
        );

        const directoryPart =
          slashIndex >= 0 ? raw.slice(0, slashIndex + 1) : "";
        const filePrefix = slashIndex >= 0 ? raw.slice(slashIndex + 1) : raw;

        const directoryUri = resolvePath(document, directoryPart || ".");

        if (!directoryUri || !(await isDirectory(directoryUri))) {
          return undefined;
        }

        const entries = await vscode.workspace.fs.readDirectory(directoryUri);

        return entries
          .filter(([name]) => name.startsWith(filePrefix))
          .map(([name, type]) => {
            const isDir = type === vscode.FileType.Directory;
            const item = new vscode.CompletionItem(
              name + (isDir ? "/" : ""),
              isDir
                ? vscode.CompletionItemKind.Folder
                : vscode.CompletionItemKind.File,
            );

            item.insertText = name + (isDir ? "/" : "");
            item.detail = isDir ? "Folder" : "File";

            return item;
          });
      },
    },
    "/",
    "\\",
  );

  const linkProvider = vscode.languages.registerDocumentLinkProvider(selector, {
    async provideDocumentLinks(document) {
      const links: vscode.DocumentLink[] = [];

      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;

        if (isCommentLine(line)) {
          continue;
        }

        const regex = /[^\s"'<>|?*]*[\/\\][^\s"'<>|?*]*/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line))) {
          const rawPath = match[0];
          const uri = resolvePath(document, rawPath);

          if (!uri || !(await exists(uri))) {
            continue;
          }

          const start = new vscode.Position(i, match.index);
          const end = new vscode.Position(i, match.index + rawPath.length);
          const range = new vscode.Range(start, end);

          links.push(new vscode.DocumentLink(range, uri));
        }
      }

      return links;
    },
  });

  const hoverProvider = vscode.languages.registerHoverProvider(selector, {
    async provideHover(document, position) {
      const found = getPathAtPosition(document, position);

      if (!found) {
        return undefined;
      }

      const uri = resolvePath(document, found.text);

      if (!uri || !(await exists(uri))) {
        return undefined;
      }

      return new vscode.Hover(`Path:\n\n\`${uri.fsPath}\``, found.range);
    },
  });

  context.subscriptions.push(completionProvider, linkProvider, hoverProvider);
}
