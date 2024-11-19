import { PostProps } from "@/types/post"
import Link from "next/link"

export const PostThumb = ({post}: {post: PostProps}): JSX.Element => {
    return (
        <div key={post.id} className={"flex flex-col text-center p-1"} >
            <h2>
                <Link href={`/posts/${post.id}`}>
                    {post.title}
                </Link>
            </h2>
            <p>{post.excerpt}</p>
        </div>
    )
}