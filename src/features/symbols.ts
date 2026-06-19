import * as vscode from "vscode";

export function registerDocumentSymbols(context: vscode.ExtensionContext) {
  const documentSymbolProvider: vscode.DocumentSymbolProvider = {
    provideDocumentSymbols(document) {
      const lines = document.getText().split(/\r?\n/);
      const symbols: vscode.DocumentSymbol[] = [];
      let currentSection: vscode.DocumentSymbol | undefined;

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1];

        const headingMatch = line.match(/^#\s+(.+?)\s*$/);

        if (!headingMatch) {
          continue;
        }

        const title = headingMatch[1];

        const isSection = /^#\s*=+\s*$/.test(nextLine);
        const isSubsection = /^#\s*-+\s*$/.test(nextLine);

        if (!isSection && !isSubsection) {
          continue;
        }

        const symbolRange = new vscode.Range(i, 0, i + 1, nextLine.length);
        const titleStart = line.indexOf(title);
        const selectionRange = new vscode.Range(
          i,
          titleStart,
          i,
          titleStart + title.length,
        );

        const symbol = new vscode.DocumentSymbol(
          title,
          "",
          isSection ? vscode.SymbolKind.Package : vscode.SymbolKind.Namespace,
          symbolRange,
          selectionRange,
        );

        if (isSection) {
          symbols.push(symbol);
          currentSection = symbol;
        } else if (currentSection) {
          currentSection.children.push(symbol);
        } else {
          symbols.push(symbol);
        }
      }

      return symbols;
    },
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { language: "micress" },
      documentSymbolProvider,
    ),
  );
}
