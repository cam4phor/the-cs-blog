import fs from "fs";
import path from "path";
import Head from "next/head";
import { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/themes/prism.css";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { PostProps } from "@/types/post";
import Editor from "@/components/Editor";
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
  const postsDirectory = path.join(process.cwd(), "data");
  const filenames = fs.readdirSync(postsDirectory);
  const paths = filenames.map((filename) => ({
    params: { id: filename.replace(".json", "") },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<{ post: PostProps }> = async ({
  params,
}) => {
  const postsDirectory = path.join(process.cwd(), "data");
  const fullPath = path.join(postsDirectory, `${params?.id}.json`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const post: PostProps = JSON.parse(fileContents);

  return { props: { post } };
};

const EditorPage = (): JSX.Element => {
  return <Editor />;
}

export default EditorPage;
