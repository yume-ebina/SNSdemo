export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  postId: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  content: string;
  mentionedUsers: User[];
  createdAt: Date;
  user: User;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
}