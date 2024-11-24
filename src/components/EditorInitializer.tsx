import { Post, PostProps } from "@/types/post";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useEffect } from "react";
import { $getRoot } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const EditorInitializer: React.FC<{ post: PostProps }> = ({ post }) => {
  const [editor] = useLexicalComposerContext();
  const content = post.content;
  useEffect(() => {
    if (content) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear(); 
        root.append(...nodes);
      });
    }
  }, [content, editor]);

  return null;
};

export default EditorInitializer;
