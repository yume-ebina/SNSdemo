import type { Post, User } from '../types';

const STORAGE_KEYS = {
  POSTS: 'praise_platform_posts',
  USERS: 'praise_platform_users',
  AUTH: 'praise_platform_auth',
} as const;

// Base64画像を圧縮
function compressImage(base64: string): string {
  if (!base64.startsWith('data:image')) return base64;
  const maxLength = 100000;
  if (base64.length > maxLength) {
    return base64.substring(0, maxLength);
  }
  return base64;
}

// 文字列の長さを制限
function truncateString(str: string, maxLength: number): string {
  if (typeof str !== 'string') return str;
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

// 投稿データを最適化
function optimizePost(post: Post): Post {
  return {
    ...post,
    content: truncateString(post.content, 280),
    user: {
      ...post.user,
      profileImage: compressImage(post.user.profileImage)
    },
    comments: post.comments.slice(-10).map(comment => ({
      ...comment,
      content: truncateString(comment.content, 140),
      user: {
        ...comment.user,
        profileImage: compressImage(comment.user.profileImage)
      }
    })),
    mentionedUsers: post.mentionedUsers.map(user => ({
      ...user,
      profileImage: compressImage(user.profileImage)
    }))
  };
}

// デモユーザーの初期設定
const defaultUsers = [
  {
    email: 'test@example.com',
    password: 'test1234',
    id: '1',
    name: 'テストユーザー',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    email: 'anmiku6464@gmail.com',
    password: 'test1234',
    id: '2',
    name: 'ミク',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export function saveUser(user: User | null): void {
  if (user) {
    try {
      const users = getAllUsers();
      const optimizedUser = {
        ...user,
        profileImage: compressImage(user.profileImage)
      };
      
      const existingUserIndex = users.findIndex(u => u.id === user.id);
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = optimizedUser;
      } else {
        users.push(optimizedUser);
      }
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      updateUserInPosts(optimizedUser);
    } catch (error) {
      console.error('ユーザー情報の保存に失敗:', error);
    }
  }
}

export function getUser(): User | null {
  try {
    const auth = getAuth();
    if (!auth) return null;
    
    const users = getAllUsers();
    return users[0] || defaultUsers[0];
  } catch (error) {
    console.error('ユーザー情報の取得に失敗:', error);
    return defaultUsers[0];
  }
}

export function getAllUsers(): User[] {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    const existingUsers = users ? JSON.parse(users) : [];
    if (existingUsers.length === 0) {
      return defaultUsers;
    }
    return existingUsers;
  } catch (error) {
    console.error('ユーザー一覧の取得に失敗:', error);
    return defaultUsers;
  }
}

export function savePosts(posts: Post[]): void {
  try {
    const optimizedPosts = posts.slice(0, 20).map(optimizePost);
    const CHUNK_SIZE = 5;
    for (let i = 0; i < optimizedPosts.length; i += CHUNK_SIZE) {
      const chunk = optimizedPosts.slice(i, i + CHUNK_SIZE);
      const key = `${STORAGE_KEYS.POSTS}_${Math.floor(i / CHUNK_SIZE)}`;
      localStorage.setItem(key, JSON.stringify(chunk));
    }
    localStorage.setItem(`${STORAGE_KEYS.POSTS}_count`, String(Math.ceil(optimizedPosts.length / CHUNK_SIZE)));
  } catch (error) {
    console.error('投稿の保存に失敗:', error);
  }
}

export function getPosts(): Post[] {
  try {
    const countStr = localStorage.getItem(`${STORAGE_KEYS.POSTS}_count`);
    const count = countStr ? parseInt(countStr, 10) : 0;
    let posts: Post[] = [];
    
    for (let i = 0; i < count; i++) {
      const chunk = localStorage.getItem(`${STORAGE_KEYS.POSTS}_${i}`);
      if (chunk) {
        const parsedChunk = JSON.parse(chunk);
        posts = posts.concat(parsedChunk);
      }
    }
    
    return posts.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt),
      comments: post.comments.map(comment => ({
        ...comment,
        createdAt: new Date(comment.createdAt)
      }))
    }));
  } catch (error) {
    console.error('投稿の取得に失敗:', error);
    return [];
  }
}

export function updateUserInPosts(updatedUser: User): void {
  try {
    const posts = getPosts();
    const updatedPosts = posts.map(post => {
      let updatedPost = { ...post };
      
      if (post.user.id === updatedUser.id) {
        updatedPost.user = updatedUser;
      }
      
      if (post.mentionedUsers) {
        updatedPost.mentionedUsers = post.mentionedUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
      }
      
      updatedPost.comments = post.comments.map(comment => {
        if (comment.user.id === updatedUser.id) {
          return { ...comment, user: updatedUser };
        }
        return comment;
      });
      
      return updatedPost;
    });
    
    savePosts(updatedPosts);
  } catch (error) {
    console.error('投稿内のユーザー情報の更新に失敗:', error);
  }
}

export function saveAuth(isLoggedIn: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isLoggedIn));
  } catch (error) {
    console.error('認証情報の保存に失敗:', error);
  }
}

export function getAuth(): boolean {
  try {
    const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
    return auth ? JSON.parse(auth) : false;
  } catch (error) {
    console.error('認証情報の取得に失敗:', error);
    return false;
  }
}