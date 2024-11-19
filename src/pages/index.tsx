import fs from 'fs';
import path from 'path';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { Post } from '@/types/post';
import { PostThumb } from '@/components/PostThumb';

export default function Home({
    posts,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
    return (
        <div>
            <header>
                <h1>My Blog </h1>
            </header>
            <main>
                <div className={"flex justify-center items-center w-full h-full"}>
                    {
                        posts.map((post: Post, index: number) => (
                            <PostThumb
                                key={index}
                                post={{
                                    id: post.id,
                                    title: post.title,
                                    excerpt: post.excerpt,
                                    content: '<p>Full content here</p>',
                                    date: '2024-11-15',
                                }}
                            />
                        ))
                    }
                </div>
            </main>
            < footer >
                <p>© {new Date().getFullYear()} My Blog </p>
            </footer>
        </div>
    );
}

export const getStaticProps: GetStaticProps<{ posts: Post[] }> = async () => {
    const postsDirectory = path.join(process.cwd(), 'data');
    const filenames = fs.readdirSync(postsDirectory);

    const posts: Post[] = filenames.map((filename) => {
        const filePath = path.join(postsDirectory, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { id, title, excerpt } = JSON.parse(fileContents);
        return { id, title, excerpt };
    });

    return { props: { posts } };
};
