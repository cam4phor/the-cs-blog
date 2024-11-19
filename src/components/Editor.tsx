import { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { EditorState } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

interface EditorProps {
  onSave?: (title: string, excerpt: string, content: string) => Promise<void>;
}

const initialConfig = {
  namespace: 'MyEditor',
  theme: {
    paragraph: 'editor-paragraph',
  },
  onError(error: Error) {
    console.error('Lexical Error:', error);
  },
};

const Editor: React.FC<EditorProps> = ({ onSave }) => {
  const [title, setTitle] = useState<string>('');
  const [excerpt, setExcerpt] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const handleSave = async (): Promise<void> => {
    if (onSave) {
      await onSave(title, excerpt, content);
    } else {
      console.warn('No save handler provided');
    }
  };

  return (
    <div>
      <h1>Create a New Blog Post</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', fontSize: '1.5em', marginBottom: '1em' }}
      />
      <textarea
        className={"flex"}
        placeholder="Excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        style={{ width: '100%', height: '4em', marginBottom: '1em' }}
      />
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<div className="editor-placeholder">Write here...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin
          onChange={(editorState: EditorState) => {
            const jsonContent = JSON.stringify(editorState);
            setContent(jsonContent);
          }}
        />
        <HistoryPlugin />
      </LexicalComposer>
      <button onClick={handleSave}>Save Post</button>
    </div>
  );
};

export default Editor;
