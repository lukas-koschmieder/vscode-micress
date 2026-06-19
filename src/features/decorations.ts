import * as vscode from "vscode";

export function registerDecorations(
  context: vscode.ExtensionContext,
): vscode.Disposable {
  const disposables: vscode.Disposable[] = [];

  const sectionDecoration = vscode.window.createTextEditorDecorationType({
    borderWidth: "1px 0 0 0",
    borderStyle: "solid",
    borderColor: new vscode.ThemeColor("editorGroup.border"),
    isWholeLine: true,
  });

  const subsectionDecoration = vscode.window.createTextEditorDecorationType({
    borderWidth: "1px 0 0 0",
    borderStyle: "dotted",
    borderColor: new vscode.ThemeColor("editorWidget.border"),
    isWholeLine: true,
  });

  disposables.push(sectionDecoration, subsectionDecoration);

  function updateDecorations(editor: vscode.TextEditor | undefined) {
    if (!editor || editor.document.languageId !== "micress") {
      return;
    }

    const sectionDecorations: vscode.DecorationOptions[] = [];
    const subsectionDecorations: vscode.DecorationOptions[] = [];
    const doc = editor.document;

    for (let i = 0; i < doc.lineCount - 1; i++) {
      const line = doc.lineAt(i).text;
      const next = doc.lineAt(i + 1).text;

      if (/^#\s+.+/.test(line) && /^#\s*=+\s*$/.test(next)) {
        sectionDecorations.push({ range: doc.lineAt(i).range });
      } else if (/^#\s+.+/.test(line) && /^#\s*-+\s*$/.test(next)) {
        subsectionDecorations.push({ range: doc.lineAt(i).range });
      }
    }

    editor.setDecorations(sectionDecoration, sectionDecorations);
    editor.setDecorations(subsectionDecoration, subsectionDecorations);
  }

  updateDecorations(vscode.window.activeTextEditor);

  disposables.push(
    vscode.window.onDidChangeActiveTextEditor(updateDecorations),
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;

      if (editor?.document === event.document) {
        updateDecorations(editor);
      }
    }),
  );

  return vscode.Disposable.from(...disposables);
}
