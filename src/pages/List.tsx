import React, { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getPosts } from '../services/storage';
import type { Post } from '../types';

type SortField = 'user' | 'content' | 'createdAt' | 'likes' | 'comments';
type SortDirection = 'asc' | 'desc';

export default function List() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const posts = getPosts();

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter(
        (post) =>
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const modifier = sortDirection === 'asc' ? 1 : -1;
        switch (sortField) {
          case 'user':
            return modifier * a.user.name.localeCompare(b.user.name);
          case 'content':
            return modifier * a.content.localeCompare(b.content);
          case 'createdAt':
            return modifier * (a.createdAt.getTime() - b.createdAt.getTime());
          case 'likes':
            return modifier * (a.likes - b.likes);
          case 'comments':
            return modifier * (a.comments.length - b.comments.length);
          default:
            return 0;
        }
      });
  }, [posts, searchTerm, sortField, sortDirection]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Posts List</h1>
          <p className="mt-2 text-sm text-gray-700">
            A comprehensive list of all posts with sorting and filtering capabilities.
          </p>
        </div>
      </div>

      <div className="mt-4 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search posts or users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
      </div>

      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      <button
                        onClick={() => handleSort('user')}
                        className="group inline-flex items-center gap-x-2"
                      >
                        User
                        {getSortIcon('user')}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      <button
                        onClick={() => handleSort('content')}
                        className="group inline-flex items-center gap-x-2"
                      >
                        Content
                        {getSortIcon('content')}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="group inline-flex items-center gap-x-2"
                      >
                        Posted
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      <button
                        onClick={() => handleSort('likes')}
                        className="group inline-flex items-center gap-x-2"
                      >
                        Likes
                        {getSortIcon('likes')}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      <button
                        onClick={() => handleSort('comments')}
                        className="group inline-flex items-center gap-x-2"
                      >
                        Comments
                        {getSortIcon('comments')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAndSortedPosts.map((post: Post) => (
                    <tr key={post.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <div className="flex items-center">
                          <img
                            src={post.user.profileImage}
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                          <span className="ml-2">{post.user.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-md truncate">
                        {post.content}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {post.likes}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {post.comments.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}