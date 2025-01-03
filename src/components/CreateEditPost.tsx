// pages/create-post.tsx
import { PostProps } from '@/types/post';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

const NoSSREditor = dynamic(() => import('@/components/Editor'), { ssr: false });

function generateUniqueId() {
  const randomString = Date.now().toString(36) + Math.random().toString(36).substr(2)
  return randomString;
}

const CreateEditPostPage: React.FC<{post?: PostProps}> = ({post}) => {
  const [isNew] = useState(post?.id !== null ? false : true);
  
  const handleSave = useCallback(async (title: string, excerpt: string, content: string) => {
    const currentPost = {
      id: isNew ? generateUniqueId() : post?.id, // rectify this so that post.id is never null
      title,
      excerpt,
      content,
      date: new Date().toISOString(),
      isNew
    };
    const response = await fetch('/api/save-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentPost),
    });

    // Redirect to the post page or display a success message
  }, [isNew, post]);

  return <NoSSREditor onSave={handleSave} initialContent={isNew ? undefined : post} />;
};

export default CreateEditPostPage;

