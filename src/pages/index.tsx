import fs from "fs";
import path from "path";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Post } from "@/types/post";
import { PostThumb } from "@/components/PostThumb";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
  return (
    <div className="container mx-auto px-12 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-12">
        {posts.map((post: Post, index: number) => (
          <PostThumb
            key={index}
            post={{
              id: post.id,
              title: post.title,
              excerpt: post.excerpt,
              content: "<p>Full content here</p>",
              date: "2024-11-15",
              image: "/assets/default.png",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps<{ posts: Post[] }> = async () => {
  const postsDirectory = path.join(process.cwd(), "data");
  const filenames = fs.readdirSync(postsDirectory);

  const posts: Post[] = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { id, title, excerpt } = JSON.parse(fileContents);
    return { id, title, excerpt };
  });

  return { props: { posts } };
};
