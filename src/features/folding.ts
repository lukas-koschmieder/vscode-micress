import * as vscode from "vscode";

export function registerFolding(context: vscode.ExtensionContext) {
  const foldingProvider: vscode.FoldingRangeProvider = {
    provideFoldingRanges(document) {
      const lines = document.getText().split(/\r?\n/);
      const headings: { line: number; level: 1 | 2 }[] = [];

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1];

        if (!/^#\s+(.+?)\s*$/.test(line)) {
          continue;
        }

        if (/^#\s*=+\s*$/.test(nextLine)) {
          headings.push({ line: i, level: 1 });
        } else if (/^#\s*-+\s*$/.test(nextLine)) {
          headings.push({ line: i, level: 2 });
        }
      }

      const ranges: vscode.FoldingRange[] = [];

      for (let i = 0; i < headings.length; i++) {
        const current = headings[i];

        let endLine = lines.length - 1;

        for (let j = i + 1; j < headings.length; j++) {
          const next = headings[j];

          if (next.level <= current.level) {
            endLine = next.line - 1;
            break;
          }
        }

        if (endLine > current.line + 1) {
          ranges.push(
            new vscode.FoldingRange(
              current.line,
              endLine,
              vscode.FoldingRangeKind.Region,
            ),
          );
        }
      }

      return ranges;
    },
  };

  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(
      { language: "micress" },
      foldingProvider,
    ),
  );
}
