import * as vscode from "vscode";
import { registerDecorations } from "./features/decorations";
import { registerFolding } from "./features/folding";
import { registerDocumentSymbols } from "./features/symbols";
import { registerPathBrowsing } from "./features/pathBrowsing";

export function activate(context: vscode.ExtensionContext) {
  registerDocumentSymbols(context);
  registerFolding(context);
  registerPathBrowsing(context);

  let decorationsDisposable: vscode.Disposable | undefined;

  const updateDecorationsFeature = () => {
    const enabled = vscode.workspace
      .getConfiguration("micress")
      .get<boolean>("decorations.enabled", true);

    decorationsDisposable?.dispose();
    decorationsDisposable = enabled ? registerDecorations(context) : undefined;
  };

  updateDecorationsFeature();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("micress.decorations.enabled")) {
        updateDecorationsFeature();
      }
    }),
  );
}

export function deactivate() {}
