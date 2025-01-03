import fs from "fs";
import path from "path";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { PostProps } from "@/types/post";
import PostView from "@/components/PostView";

const PostPage: React.FC<{ post: PostProps }> = ({ post }) => {
  return <PostView {...post} />;
};

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

export default PostPage;
