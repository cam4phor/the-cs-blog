import { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import exampleTheme from "./themes/ExampleTheme";


interface EditorProps {
  onSave?: (title: string, excerpt: string, content: string) => Promise<void>;
}

const initialConfig = {
  namespace: "MyEditor",
  theme: exampleTheme,
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
  onError(error: Error) {
    console.error("Lexical Error:", error);
  },
};

const Toolbar: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  console.log(editor.getEditorState());

  return (
    <div className="">
      <button
        onClick={formatBold}
        className="border-none flex text-text-secondary bg-background-secondary px-2 py-1 m-1 rounded-md font-bold cursor-pointer align-middle"
      >
        B
      </button>
      <button
        onClick={formatItalic}
        className="border-none flex text-text-secondary bg-background-secondary px-2 py-1 m-1 rounded-md italic cursor-pointer align-middle"
      >
        I
      </button>
      <button
        onClick={formatUnderline}
        className="border-none flex text-text-secondary bg-background-secondary px-2 py-1 m-1 rounded-md underline cursor-pointer align-middle"
      >
        U
      </button>
      {/* Add more formatting options as needed */}
    </div>
  );
};

function Placeholder() {
  return <div className="absolute top-0 text-text-primary items-start justify-start m-2 pointer-events-none overflow-hidden">Write here...</div>;
}

const Editor: React.FC<EditorProps> = ({ onSave }) => {
  const [title, setTitle] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const handleSave = async (): Promise<void> => {
    if (onSave) {
      await onSave(title, excerpt, content);
    } else {
      console.warn("No save handler provided");
    }
  };

  return (
    <div className="py-10 px-96 flex flex-col justify-between items-center">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-text-primary bg-background-primary px-2 py-1 outline-none"
        style={{ width: "100%", fontSize: "1.5em", marginBottom: "1em" }}
      />
      <input
        placeholder="Excerpt"
        value={excerpt}
        maxLength={140}
        className="text-text-primary bg-background-primary px-2 py-1 outline-none"
        onChange={(e) => setExcerpt(e.target.value)}
        style={{ width: "100%", marginBottom: "1em" }}
      />
      <LexicalComposer initialConfig={initialConfig}>
        <div className="bg-background-primary m-5 rounded-sm text-text-primary relative leading-5 text-left rounded-tl-xl rounded-tr-xl">
          <ToolbarPlugin />
          <div className="bg-background-primary relative">
            <RichTextPlugin
              contentEditable={<ContentEditable className="p-1 rounded-sm min-h-40 outline-none text-sm leading-6 w-full border-none text-text-secondary bg-background-secondary" />}
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <CodeHighlightPlugin />
            <ListPlugin />
            <LinkPlugin />
            <AutoLinkPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </div>
      </LexicalComposer>
      <button
        onClick={handleSave}
        className="bg-background-secondary text-text-tertiary p-2 rounded-md m-2"
      >
        Save Post
      </button>
    </div>
  );
};

export default Editor;
