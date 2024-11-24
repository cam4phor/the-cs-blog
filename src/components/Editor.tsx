import { useCallback, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
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
import SaveHandler from "./SaveHandler";
import { PostProps } from "@/types/post";
import EditorInitializer from "./EditorInitializer";

interface EditorProps {
  onSave?: (title: string, excerpt: string, content: string) => Promise<void>;
  initialContent?: PostProps;
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

function Placeholder() {
  return (
    <div className="absolute top-0 text-text-primary items-start justify-start m-2 pointer-events-none overflow-hidden">
      Write here...
    </div>
  );
}

const Editor: React.FC<EditorProps> = ({ onSave, initialContent }) => {
  const [title, setTitle] = useState<string>(initialContent?.title ?? "");
  const [excerpt, setExcerpt] = useState<string>(initialContent?.excerpt ?? "");

  const handleSave = useCallback((htmlContent: string) => {
    if (onSave) {
      onSave(title, excerpt, htmlContent);
    } else {
      console.warn("No save handler provided");
    }
  }, [title, excerpt, onSave]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="py-10 max-w-[43rem] flex flex-col justify-between items-center">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-text-primary max-w-[43rem] bg-background-primary px-2 py-1 outline-none font-unna text-4xl"
          style={{ width: "100%", marginBottom: "1em" }}
        />
        <input
          placeholder="Excerpt"
          value={excerpt}
          maxLength={140}
          className="text-text-primary max-w-[43rem] bg-background-primary px-2 py-1 outline-none font-unna text-2xl"
          onChange={(e) => setExcerpt(e.target.value)}
          style={{ width: "100%", marginBottom: "1em" }}
        />
        <div className="bg-background-primary m-5 rounded-sm text-text-primary relative leading-5 text-left rounded-tl-xl rounded-tr-xl">
          <ToolbarPlugin />
          <div className="bg-background-primary relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="p-1 rounded-sm font-unna text-2xl min-h-40 outline-none leading-8 w-full border-none text-text-primary bg-background-secondary tracking-wide" />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {initialContent !== undefined && initialContent !== null && (
              <EditorInitializer post={initialContent} />
            )}
            <HistoryPlugin />
            <AutoFocusPlugin />
            <CodeHighlightPlugin />
            <ListPlugin />
            <LinkPlugin />
            <AutoLinkPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <SaveHandler handleSave={handleSave} />
          </div>
        </div>
      </div>
    </LexicalComposer>
  );
};

export default Editor;
