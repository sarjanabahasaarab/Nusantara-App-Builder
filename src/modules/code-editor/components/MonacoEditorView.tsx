/**
 * Nusantara App Builder - Monaco Editor View Integration
 * Phase 4: Professional Monaco Editor with custom Kotlin syntax, Android XML completion,
 * breadcrumbs, error markers, and keybindings.
 */

import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { ChevronRight, FileCode, Search, Replace, X } from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';
import { formatDocument } from '../services/xmlFormatter';
import { useUiStore } from '../../../store/uiStore';

export const MonacoEditorView: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);

  const {
    activeTabId,
    tabs,
    updateTabContent,
    updateCursorPosition,
    saveActiveFile,
    editorTheme,
    fontSize,
    wordWrap,
    autoSaveMode,
    problems,
    isSearchOpen,
    isReplaceMode,
    searchQuery,
    replaceQuery,
    matchCase,
    matchWholeWord,
    isRegex,
    setSearchQuery,
    setReplaceQuery,
    setSearchOptions,
    goToNextMatch,
    goToPrevMatch,
    replaceCurrentMatch,
    replaceAllMatches,
    toggleSearch,
    searchMatches,
    activeMatchIndex,
  } = useEditorStore();

  const showToast = useUiStore((s) => s.showToast);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Configure custom Kotlin language provider before Monaco mounts
  const handleEditorWillMount: BeforeMount = (monaco) => {
    // Register Kotlin if not already registered
    const languages = monaco.languages.getLanguages();
    if (!languages.some((l: { id: string }) => l.id === 'kotlin')) {
      monaco.languages.register({ id: 'kotlin' });

      monaco.languages.setMonarchTokensProvider('kotlin', {
        defaultToken: '',
        tokenPostfix: '.kt',
        keywords: [
          'package',
          'import',
          'class',
          'interface',
          'fun',
          'val',
          'var',
          'override',
          'private',
          'public',
          'protected',
          'internal',
          'open',
          'final',
          'abstract',
          'sealed',
          'data',
          'enum',
          'companion',
          'object',
          'if',
          'else',
          'when',
          'for',
          'while',
          'do',
          'return',
          'break',
          'continue',
          'throw',
          'try',
          'catch',
          'finally',
          'is',
          'as',
          'in',
          'out',
          'this',
          'super',
          'null',
          'true',
          'false',
          'lateinit',
          'suspend',
          'inline',
        ],
        typeKeywords: [
          'Int',
          'Long',
          'Short',
          'Byte',
          'Double',
          'Float',
          'Boolean',
          'Char',
          'String',
          'Array',
          'List',
          'Map',
          'Set',
          'Any',
          'Unit',
          'Nothing',
          'Bundle',
          'View',
          'Context',
          'AppCompatActivity',
          'Activity',
          'TextView',
          'Button',
          'EditText',
        ],
        operators: [
          '=',
          '>',
          '<',
          '!',
          '~',
          '?',
          ':',
          '==',
          '<=',
          '>=',
          '!=',
          '&&',
          '||',
          '++',
          '--',
          '+',
          '-',
          '*',
          '/',
          '&',
          '|',
          '^',
          '%',
          '->',
          '?:',
          '!!',
        ],
        tokenizer: {
          root: [
            // Identifiers and keywords
            [
              /[a-zA-Z_]\w*/,
              {
                cases: {
                  '@typeKeywords': 'type.identifier',
                  '@keywords': 'keyword',
                  '@default': 'identifier',
                },
              },
            ],
            // Whitespace
            { include: '@whitespace' },
            // Delimiters and operators
            [/[{}()[\]]/, '@brackets'],
            [
              /@operators/,
              {
                cases: {
                  '@operators': 'operator',
                  '@default': '',
                },
              },
            ],
            // Numbers
            [/\d*\.\d+([eE][-+]?\d+)?[fFdD]?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+[lL]?/, 'number.hex'],
            [/\d+[lL]?/, 'number'],
            // Strings
            [/"""/, { token: 'string.quote', bracket: '@open', next: '@mstring' }],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
          ],
          whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
          ],
          comment: [
            [/[^/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            ['\\*/', 'comment', '@pop'],
            [/[/*]/, 'comment'],
          ],
          string: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
          ],
          mstring: [
            [/[^\\"]+/, 'string'],
            [/"""/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
            [/"/, 'string'],
          ],
        },
      });

      monaco.languages.setLanguageConfiguration('kotlin', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/'],
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
      });
    }

    // Android XML autocompletion snippets
    monaco.languages.registerCompletionItemProvider('xml', {
      provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: Monaco.languages.CompletionItem[] = [
          {
            label: 'LinearLayout (vertical)',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              '<LinearLayout\n    android:layout_width="match_parent"\n    android:layout_height="wrap_content"\n    android:orientation="vertical">\n    $0\n</LinearLayout>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Android Vertical LinearLayout container',
            range,
          },
          {
            label: 'TextView',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              '<TextView\n    android:id="@+id/${1:tv_title}"\n    android:layout_width="wrap_content"\n    android:layout_height="wrap_content"\n    android:text="${2:Hello Nusantara}"\n    android:textSize="16sp" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Android TextView widget',
            range,
          },
          {
            label: 'MaterialButton',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              '<Button\n    android:id="@+id/${1:btn_submit}"\n    android:layout_width="match_parent"\n    android:layout_height="wrap_content"\n    android:text="${2:Submit}" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Android Button widget',
            range,
          },
          {
            label: 'TextInputEditText',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              '<EditText\n    android:id="@+id/${1:et_input}"\n    android:layout_width="match_parent"\n    android:layout_height="wrap_content"\n    android:hint="${2:Enter text}"\n    android:inputType="text" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Android EditText input field',
            range,
          },
        ];

        return { suggestions };
      },
    });
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (activeTabId) {
        updateCursorPosition(activeTabId, e.position.lineNumber, e.position.column);
      }
    });

    // Save shortcut Ctrl+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveActiveFile();
    });

    // Format shortcut Shift+Alt+F
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      handleFormatDocument();
    });

    // On blur handler for autoSaveMode === 'onFocusChange'
    editor.onDidBlurEditorText(() => {
      if (autoSaveMode === 'onFocusChange') {
        saveActiveFile();
      }
    });
  };

  const handleFormatDocument = () => {
    if (!activeTab || !editorRef.current) return;
    const res = formatDocument(activeTab.language, activeTab.content);
    if (res.formatted) {
      updateTabContent(activeTab.id, res.content);
      showToast(isIndo ? res.messageId || 'Format berhasil' : res.message || 'Formatted');
    } else {
      showToast(isIndo ? res.messageId || 'Tidak dapat memformat' : res.message || 'Cannot format');
    }
  };

  // Listen to global format event from Menu/Toolbar
  useEffect(() => {
    const onFormatEvt = () => handleFormatDocument();
    window.addEventListener('editor-format-document', onFormatEvt);
    return () => window.removeEventListener('editor-format-document', onFormatEvt);
  });

  // Synchronize error markers in Monaco from problems
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeTab) return;

    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    const fileProblems = problems.filter((p) => p.filePath === activeTab.path);

    const markers: Monaco.editor.IMarkerData[] = fileProblems.map((p) => ({
      startLineNumber: p.line,
      startColumn: p.column,
      endLineNumber: p.line,
      endColumn: p.column + 10,
      message: isIndo ? p.messageId : p.message,
      severity:
        p.severity === 'error'
          ? monaco.MarkerSeverity.Error
          : p.severity === 'warning'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info,
      source: p.source,
    }));

    monaco.editor.setModelMarkers(model, 'nusantara-validator', markers);
  }, [problems, activeTab, isIndo]);

  if (!activeTab) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 text-xs">
        <FileCode className="w-12 h-12 text-neutral-700 mb-3" />
        <p className="font-medium text-neutral-400">
          {isIndo ? 'Tidak ada berkas yang terbuka' : 'No file open'}
        </p>
        <p className="mt-1 text-neutral-500 text-[11px]">
          {isIndo
            ? 'Pilih berkas dari Penjelajah File di sebelah kiri atau tekan Ctrl+P untuk mencari.'
            : 'Select a file from File Explorer or press Ctrl+P to search.'}
        </p>
      </div>
    );
  }

  // Breadcrumb segments
  const pathParts = activeTab.path.split('/');

  return (
    <div className="flex-1 h-full flex flex-col bg-neutral-950 overflow-hidden relative">
      {/* Breadcrumb Bar */}
      <div className="h-6 bg-neutral-950 border-b border-neutral-900 px-3 flex items-center gap-1 text-[11px] text-neutral-400 select-none overflow-x-auto shrink-0">
        <FileCode className="w-3 h-3 text-neutral-500 shrink-0" />
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            <span
              className={
                index === pathParts.length - 1
                  ? 'text-neutral-200 font-medium'
                  : 'hover:text-neutral-300 cursor-default'
              }
            >
              {part}
            </span>
            {index < pathParts.length - 1 && (
              <ChevronRight className="w-2.5 h-2.5 text-neutral-600 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* In-Editor Search & Replace Bar */}
      {isSearchOpen && (
        <div className="absolute top-7 right-4 z-30 bg-neutral-900 border border-neutral-700 shadow-2xl rounded-md p-2 text-xs flex flex-col gap-1.5 w-84 animate-in fade-in">
          {/* Find row */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isIndo ? 'Cari...' : 'Find...'}
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500 font-mono"
              autoFocus
            />

            <span className="text-[10px] text-neutral-400 whitespace-nowrap min-w-10 text-center">
              {searchMatches.length > 0
                ? `${activeMatchIndex + 1}/${searchMatches.length}`
                : isIndo
                ? '0 hasil'
                : 'No results'}
            </span>

            <button
              onClick={() => goToPrevMatch()}
              disabled={searchMatches.length === 0}
              className="p-1 rounded text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 cursor-pointer"
              title={isIndo ? 'Sebelumnya (Shift+Enter)' : 'Previous'}
            >
              ↑
            </button>
            <button
              onClick={() => goToNextMatch()}
              disabled={searchMatches.length === 0}
              className="p-1 rounded text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 cursor-pointer"
              title={isIndo ? 'Berikutnya (Enter)' : 'Next'}
            >
              ↓
            </button>

            <button
              onClick={() => toggleSearch(false)}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Options row */}
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setSearchOptions({ matchCase: e.target.checked })}
                className="rounded border-neutral-700 bg-neutral-950 text-blue-500"
              />
              <span>{isIndo ? 'Cocokkan Huruf (Aa)' : 'Match Case'}</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={matchWholeWord}
                onChange={(e) => setSearchOptions({ matchWholeWord: e.target.checked })}
                className="rounded border-neutral-700 bg-neutral-950 text-blue-500"
              />
              <span>{isIndo ? 'Seluruh Kata' : 'Whole Word'}</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setSearchOptions({ isRegex: e.target.checked })}
                className="rounded border-neutral-700 bg-neutral-950 text-blue-500"
              />
              <span>Regex (.*)</span>
            </label>
          </div>

          {/* Replace row (if replace mode) */}
          {isReplaceMode && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-800">
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder={isIndo ? 'Ganti dengan...' : 'Replace with...'}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500 font-mono"
              />

              <button
                onClick={() => replaceCurrentMatch()}
                disabled={searchMatches.length === 0}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] disabled:opacity-40 cursor-pointer"
              >
                {isIndo ? 'Ganti' : 'Replace'}
              </button>

              <button
                onClick={() => replaceAllMatches()}
                disabled={searchMatches.length === 0}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] disabled:opacity-40 cursor-pointer"
              >
                {isIndo ? 'Semua' : 'All'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Real Monaco Editor instance */}
      <div className="flex-1 h-full w-full overflow-hidden">
        <Editor
          height="100%"
          language={activeTab.language}
          value={activeTab.content}
          theme={editorTheme}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={(val) => {
            if (val !== undefined && activeTabId) {
              updateTabContent(activeTabId, val);
            }
          }}
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            tabSize: 4,
            insertSpaces: true,
            renderWhitespace: 'selection',
            minimap: { enabled: true, maxColumn: 80, scale: 1 },
            wordWrap,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            contextmenu: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            overviewRulerBorder: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};
