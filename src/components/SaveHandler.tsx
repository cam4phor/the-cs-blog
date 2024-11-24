import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";

interface SaveHandlerProps {
  handleSave: (htmlContent: string) => void;
}

const SaveHandler: React.FC<SaveHandlerProps> = ({ handleSave }) => {
  const [editor] = useLexicalComposerContext();

  const savePost = async (): Promise<void> => {
    let htmlContent = "";
    editor.update(() => {
      htmlContent = $generateHtmlFromNodes(editor);
    });

    if (handleSave) {
      handleSave(htmlContent);
    } else {
      console.warn("No save handler provided");
    }
  };

  return (
    <button
      onClick={savePost}
      className="bg-background-secondary text-text-primary p-2 rounded-md m-2"
    >
      Save Post
    </button>
  );
};

export default SaveHandler;
