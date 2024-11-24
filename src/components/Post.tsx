import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Send } from 'lucide-react';
import type { Post as PostType, Comment } from '../types';

interface PostProps {
  post: PostType;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}

export default function Post({ post, onLike, onComment }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(post.id, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-start space-x-4">
        <img
          src={post.user.profileImage}
          alt={post.user.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-gray-900">{post.user.name}</h4>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-gray-900">{post.content}</p>
          
          <div className="mt-3 flex items-center space-x-6">
            <button 
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 ${
                post.hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments.length}</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-4 space-y-4">
              {post.comments.map((comment: Comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img
                    src={comment.user.profileImage}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {comment.user.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-800 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handleSubmitComment} className="mt-4 flex items-start space-x-3">
                <img
                  src={post.user.profileImage}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className={`mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      !newComment.trim()
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Comment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}