import { useEffect, useState, useRef, RefObject } from "react";
import * as monaco from "monaco-editor";

interface MonacoEditorOptions extends monaco.editor.IStandaloneEditorConstructionOptions {}

export function useMonaco(
  containerRef: RefObject<HTMLDivElement>,
  options: MonacoEditorOptions = {}
) {
  const [isMonacoLoading, setIsMonacoLoading] = useState(true);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsMonacoLoading(true);

    // Configure Monaco features if needed
    if (monaco.languages.getLanguages().findIndex(lang => lang.id === 'java') === -1) {
      // Setup Java language features
      monaco.languages.registerCompletionItemProvider("java", {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          
          // Basic Java completion suggestions
          const suggestions = [
            {
              label: "public",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "public",
              range,
            },
            {
              label: "private",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "private",
              range,
            },
            {
              label: "protected",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "protected",
              range,
            },
            {
              label: "class",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "class",
              range,
            },
            {
              label: "interface",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "interface",
              range,
            },
            {
              label: "extends",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "extends",
              range,
            },
            {
              label: "implements",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "implements",
              range,
            },
            {
              label: "System.out.println",
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: "System.out.println(${1:value});",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "for",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "if",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "if (${1:condition}) {\n\t${2}\n}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "try-catch",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "try {\n\t${1}\n} catch (${2:Exception} e) {\n\t${3}\n}",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
          ];

          return { suggestions };
        },
      });
    }

    const defaultOptions: MonacoEditorOptions = {
      value: options.value || "",
      language: "java",
      theme: "vs-light",
      fontSize: 14,
      scrollBeyondLastLine: false,
      minimap: { enabled: true },
      automaticLayout: true,
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      // Create the editor instance
      const editor = monaco.editor.create(
        containerRef.current,
        mergedOptions
      );
      
      editorRef.current = editor;
      setIsMonacoLoading(false);
      
      return () => {
        editor.dispose();
      };
    } catch (error) {
      console.error("Failed to initialize Monaco editor:", error);
      setIsMonacoLoading(false);
    }
  }, [containerRef, options.value]);

  return {
    editor: editorRef.current,
    monaco,
    isMonacoLoading,
  };
}
