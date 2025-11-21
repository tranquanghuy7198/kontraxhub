import { Editor, Monaco } from "@monaco-editor/react";
import type * as monacoType from "monaco-editor";
import { forwardRef, useImperativeHandle, useRef } from "react";
import "./vscode-editor.scss";

const TRANSPARENT = "#00000000";

export type GenerateAction = {
  id: string;
  label: string;
  generate: () => any;
};

interface VSCodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined, event: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  genActions?: GenerateAction[];
}

interface VSCodeEditorRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string | undefined;
}

const VSCodeEditor = forwardRef<VSCodeEditorRef, VSCodeEditorProps>(
  ({ value, onChange, onBlur, placeholder, disabled, genActions }, ref) => {
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      blur: () =>
        editorRef.current?.getModel()?.setValue(editorRef.current?.getValue()),
      getValue: () => editorRef.current?.getValue(),
    }));

    const handleEditorDidMount = (
      editor: monacoType.editor.IStandaloneCodeEditor,
      monaco: Monaco
    ) => {
      editorRef.current = editor;

      // New action: generate default JSON value
      if (genActions && genActions.length > 0)
        genActions.forEach((action, index) => {
          editor.addAction({
            id: action.id,
            label: action.label,
            contextMenuGroupId: "0_generation",
            contextMenuOrder: index,
            run: (editor) => {
              const model = editor.getModel();
              if (!model) return; // should not happen
              const generated = action.generate();
              model.setValue(JSON.stringify(generated, null, 2));
            },
          });
        });

      // Set custom theme
      monaco.editor.defineTheme("custom-theme", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#141414",
          "editor.focusBorder": TRANSPARENT,
          focusBorder: TRANSPARENT,
          "editor.lineHighlightBackground": TRANSPARENT,
          "editor.lineHighlightBorder": TRANSPARENT,
        },
      });
      monaco.editor.setTheme("custom-theme");
    };

    const handleEditorChange = (value: string | undefined) => {
      onChange?.(value, null);
    };

    const handleEditorBlur = () => {
      onBlur?.();
    };

    return (
      <div>
        <Editor
          value={value || ""}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          defaultLanguage="json"
          height={150}
          options={{
            minimap: { enabled: false },
            tabSize: 2,
            lineNumbers: "off",
            readOnly: disabled,
            placeholder: placeholder,
            automaticLayout: true,
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
          className="ant-input-json"
        />
        <div style={{ display: "none" }} onBlur={handleEditorBlur} />
      </div>
    );
  }
);

export default VSCodeEditor;
