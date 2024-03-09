<template>
    <div
      ref="monacoEditorElement"
      class="monaco-editor-container"
    />
  </template>
  
  <script setup lang="ts">
  import { loadGrammars, loadTheme } from 'monaco-volar';
  import * as monaco from 'monaco-editor-core';
  import { setupMonacoEnv, loadOnigasm } from '@/composables/useMonacoEnvironment';
  
  const monacoEditorElement = ref<HTMLElement>();

  const afterReady = (theme: string) => {
    (self as any).monaco = monaco;
    const data = '<template></template>';
    const model = monaco.editor.createModel(data, 'vue', monaco.Uri.parse('file:///files/demo.vue'));
    const editorInstance = monaco.editor.create(monacoEditorElement.value!, {
      theme,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false
      },
      inlineSuggest: {
        enabled: false
      },
      'semanticHighlighting.enabled': true
    });
    editorInstance.setModel(model);
  
    // Support for semantic highlighting
    const t = (editorInstance as any)._themeService._theme;
    t.getTokenStyleMetadata = (
      type: string,
      modifiers: string[],
      _language: string
    ) => {
      const _readonly = modifiers.includes('readonly');
      switch (type) {
        case 'function':
        case 'method':
          return { foreground: 12 };
        case 'class':
          return { foreground: 11 };
        case 'variable':
        case 'property':
          return { foreground: _readonly ? 21 : 9 };
        default:
          return { foreground: 0 };
      }
    };
  
    loadGrammars(monaco, editorInstance);
  };
  
  onMounted(async () => {
    Promise.all([setupMonacoEnv(), loadOnigasm(), loadTheme(monaco.editor)]).then(
      ([, , theme]) => {
        afterReady(theme.dark);
      }
    );
  });
  
  </script>
  <style lang="pcss">
  .monaco-editor-container {
    width: 100vw;
    height: 100vh;
  
    .monaco-editor,
    .preview.inline,
    .overflow-guard {
      height: 100% !important;
      width: 100% !important;
    }
  }
  </style>
  