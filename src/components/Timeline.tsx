import React, { useState, useEffect } from 'react';
import Post from './Post';
import NewPost from './NewPost';
import { Search } from 'lucide-react';
import type { Post as PostType, Comment, User } from '../types';
import { savePosts, getPosts } from '../services/storage';

interface TimelineProps {
  currentUser: User;
}

export default function Timeline({ currentUser }: TimelineProps) {
  const [posts, setPosts] = useState<PostType[]>(getPosts());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      savePosts(posts);
    } catch (error) {
      console.error('Failed to save posts:', error);
    }
  }, [posts]);

  const handleNewPost = (content: string) => {
    const newPost: PostType = {
      id: Date.now().toString(),
      content,
      mentionedUsers: [],
      createdAt: new Date(),
      user: currentUser,
      likes: 0,
      hasLiked: false,
      comments: []
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
          hasLiked: !post.hasLiked
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      user: currentUser,
      postId,
      createdAt: new Date()
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedComments = [...post.comments, newComment];
        return {
          ...post,
          comments: updatedComments.slice(-50)
        };
      }
      return post;
    }));
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <div className="sticky top-16 bg-white z-40 py-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="投稿を検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <NewPost onPost={handleNewPost} currentUser={currentUser} />
      
      <div className="space-y-4">
        {filteredPosts.map(post => (
          <Post 
            key={post.id} 
            post={post}
            onLike={handleLike}
            onComment={handleComment}
          />
        ))}
      </div>
    </div>
  );
}