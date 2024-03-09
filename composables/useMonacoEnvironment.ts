import type { LanguageService } from '@vue/language-service';
import type * as Monaco from 'monaco-editor-core';
import EditorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker';
import VueWorker from 'monaco-volar/vue.worker?worker';
import * as onigasm from 'onigasm';
import onigasmWasm from 'onigasm/lib/onigasm.wasm?url';
import * as volar from '@volar/monaco';
import * as monaco from 'monaco-editor-core';

export function loadOnigasm():Promise<void> {
  return onigasm.loadWASM(onigasmWasm);
}

// setup monaco environment
export function setupMonacoEnv(takeoverMode = false): void {
  let initialized = false;

  monaco.languages.register({ id: 'vue', extensions: ['.vue'] });
  monaco.languages.onLanguage('vue', setup);

  if (takeoverMode) {
    monaco.languages.onLanguage('javascript', setup);
    monaco.languages.onLanguage('typescript', setup);
    monaco.languages.onLanguage('javascriptreact', setup);
    monaco.languages.onLanguage('typescriptreact', setup);
    monaco.languages.onLanguage('json', setup);
  }

  async function setup(): Promise<void> {
    if (initialized) {
      return;
    }
    initialized = true;

    (self as any).MonacoEnvironment ??= {};
    (self as any).MonacoEnvironment.getWorker ??= () => new EditorWorker();

    const getWorker = (self as any).MonacoEnvironment.getWorker;

    (self as any).MonacoEnvironment.getWorker = (_: unknown, label: string) => {
      if (label === 'vue') {
        return new VueWorker();
      }
      return getWorker();
    };

    const worker = monaco.editor.createWebWorker<LanguageService>({
      moduleId: 'vs/language/vue/vueWorker',
      label: 'vue',
      createData: {}
    });
    const languageId = takeoverMode
      ? [
        'vue',
        'javascript',
        'typescript',
        'javascriptreact',
        'typescriptreact',
        'json'
      ]
      : ['vue'];
    const getSyncUris = (): Monaco.Uri[] => monaco.editor.getModels().map((model) => model.uri);
    volar.editor.activateMarkers(
      worker,
      languageId,
      'vue',
      getSyncUris,
      monaco.editor
    );
    volar.editor.activateAutoInsertion(worker, languageId, getSyncUris, monaco.editor);
    await volar.languages.registerProvides(
      worker,
      languageId,
      getSyncUris,
      monaco.languages
    );
  }
}
