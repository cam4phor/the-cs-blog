import { PostProps } from "@/types/post";
import Link from "next/link";

export const PostThumb = ({ post }: { post: PostProps }): JSX.Element => {
    const defaultImage = '/assets/default.png'; // Path to your default image
    const imageSrc = post.image || defaultImage;

    return (
        <div
            key={post.id}
            className="m-2 p-4 bg-background-secondary text-text-secondary shadow-xl dark:shadow-glow rounded-md border h-[350px] border-border w-4/5 flex flex-col justify-self-center self-center"
        >
            <div className="h-full w-full">
                <Link
                    href={`/posts/${post.id}`}
                    className="block h-full w-full"
                >
                    {/* Image */}
                    <img
                        className="w-full h-2/3 object-cover object-center rounded-md"
                        src={imageSrc}
                        alt={post.title}
                    />
                    {/* Title */}
                    <div className="text-xl font-bold text-text-primary my-2">
                        {post.title}
                    </div>
                    {/* Excerpt */}
                    <p className="text-text-secondary text-sm">{post.excerpt}</p>
                </Link>
            </div>
        </div>
    );
};
