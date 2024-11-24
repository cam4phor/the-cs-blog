import fs from "fs";
import path from "path";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { PostProps } from "@/types/post";
import Editor from "@/components/Editor";
import CreateEditPostPage from "@/components/CreateEditPost";

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

const EditorPage: React.FC<{ post: PostProps }> = ({post}): JSX.Element => {
    console.log(post);
  return <CreateEditPostPage post={post} />;
}

export default EditorPage;
