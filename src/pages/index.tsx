import fs from 'fs';
import path from 'path';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { Post } from '@/types/post';
import { PostThumb } from '@/components/PostThumb';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home({
    posts,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
    return (
        <div className="bg-background-primary text-text-primary">
            <div className="flex flex-col min-h-screen">
                {/* Header */}
                <header className="fixed top-0 left-0 w-full bg-background-primary text-text-primary shadow-md dark:shadow-glow z-10">
                    <div className="container mx-auto px-20 flex justify-between items-center">
                        <nav className="container px-3 py-2 flex justify-between items-center">
                            {/* Logo */}
                            <div className="font-bold">
                                <Link href="/" className="font-custom text-3xl tracking-extra-wide">
                                    THE-CS-BLOG
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="space-x-6">
                                <ThemeToggle />
                                <Link href="/" className="text-text-secondary hover:text-text-primary">
                                    Home
                                </Link>
                                <Link href="/about" className="text-text-secondary hover:text-text-primary">
                                    About
                                </Link>
                                <Link href="/blog" className="text-text-secondary hover:text-text-primary">
                                    Blog
                                </Link>
                            </div>
                        </nav>
                    </div>
                </header>

                <main className="flex-grow pt-2 bg-background-primary text-text-primary">
                    <div className="container mx-auto px-12 py-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-12">
                            {posts.map((post: Post, index: number) => (
                                <PostThumb
                                    key={index}
                                    post={{
                                        id: post.id,
                                        title: post.title,
                                        excerpt: post.excerpt,
                                        content: '<p>Full content here</p>',
                                        date: '2024-11-15',
                                        image: '/assets/default.png',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </main>
                {/* Footer */}
                <footer className="bg-background-secondary text-text-primary shadow-md">
                    <div className="text-center">
                        <p>© {new Date().getFullYear()} the-cs-blog</p>
                    </div>
                </footer>
            </div>
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
