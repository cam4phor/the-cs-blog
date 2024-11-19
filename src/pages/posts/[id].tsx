import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { EditorState } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { PostProps } from '@/types/post';

export function Post({
    post,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
    useEffect(() => {
        Prism.highlightAll();
    }, []);

    return (
        <div>
            <Head>
                <title>{post.title}</title>
                <meta name="description" content={post.excerpt} />
            </Head>
            <header>
                <h1>{post.title}</h1>
            </header>
            <article dangerouslySetInnerHTML={{ __html: post.content }} />
            <footer>
                <p>© {new Date().getFullYear()} My Blog</p>
            </footer>
        </div>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const postsDirectory = path.join(process.cwd(), 'data');
    const filenames = fs.readdirSync(postsDirectory);
    const paths = filenames.map((filename) => ({
        params: { id: filename.replace('.json', '') },
    }));

    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<{ post: PostProps }> = async ({
    params,
}) => {
    const postsDirectory = path.join(process.cwd(), 'data');
    const fullPath = path.join(postsDirectory, `${params?.id}.json`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const post: PostProps = JSON.parse(fileContents);

    return { props: { post } };
};

export default function EditorPage(): JSX.Element {
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [excerpt, setExcerpt] = useState<string>('');

    const handleSave = async (): Promise<void> => {
        try {
            const response = await fetch('/api/save-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, excerpt, content }),
            });

            if (response.ok) {
                alert('Post saved');
            } else {
                alert('Error saving post');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            alert('An unexpected error occurred.');
        }
    };

    const initialConfig = {
        namespace: 'MyEditor',
        theme: {
            paragraph: 'editor-paragraph',
        },
        onError(error: Error) {
            console.error('Lexical Error:', error);
        },
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
                        const serializedContent = JSON.stringify(editorState);
                        setContent(serializedContent);
                    }}
                />
                <HistoryPlugin />
            </LexicalComposer>
            <button onClick={handleSave}>Save Post</button>
        </div>
    );
}
