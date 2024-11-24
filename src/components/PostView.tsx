// components/PostView.tsx
import React, { useEffect, useState } from "react";
import { PostProps } from "@/types/post";

const PostView: React.FC<PostProps> = ({
  title,
  excerpt,
  content,
  date,
}) => {
  const [sanitizedContent, setSanitizedContent] = useState<string>("");

  useEffect(() => {
    import("dompurify").then((module) => {
        const DOMPurify = module.default;
        const sanitized = DOMPurify.sanitize(content);
        setSanitizedContent(sanitized);
    });
  }, [content]);

  return (
    <article className="prose lg:prose-xl text-text-primary max-w-[43rem] mt-10 font-unna">
      <h1 className="text-text-primary">{title}</h1>
      <p className="text-text-secondary">{excerpt}</p>
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      <p className="text-sm text-text-tertiary">
        Published on {new Date(date).toLocaleDateString()}
      </p>
    </article>
  );
};

export default PostView;
