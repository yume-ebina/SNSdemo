import { createClient } from '@libsql/client';
import type { User, Post, Comment } from '../types';
import { z } from 'zod';

const client = createClient({
  url: import.meta.env.VITE_DATABASE_URL,
  authToken: import.meta.env.VITE_DATABASE_AUTH_TOKEN
});

const signupSchema = z.object({
  name: z.string().min(2, '名前は2文字以上で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください')
});

export async function createUser(userData: z.infer<typeof signupSchema>): Promise<User> {
  try {
    // メールアドレスの重複チェック
    const existingUser = await client.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [userData.email]
    });

    if (existingUser.rows.length > 0) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    // 新規ユーザーの作成
    const userId = crypto.randomUUID();
    const defaultProfileImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

    const result = await client.execute({
      sql: `INSERT INTO users (id, name, email, password, profile_image)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *`,
      args: [userId, userData.name, userData.email, userData.password, defaultProfileImage]
    });

    return transformUser(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ユーザー登録中にエラーが発生しました');
  }
}

export async function updateUser(user: User): Promise<User> {
  try {
    const result = await client.execute({
      sql: `UPDATE users 
            SET name = ?, profile_image = ?
            WHERE id = ?
            RETURNING *`,
      args: [user.name, user.profileImage, user.id]
    });

    if (!result.rows[0]) {
      throw new Error('ユーザーの更新に失敗しました');
    }

    return transformUser(result.rows[0]);
  } catch (error) {
    console.error('ユーザー更新エラー:', error);
    throw new Error('プロフィールの更新中にエラーが発生しました');
  }
}

export async function getUser(email: string): Promise<User | null> {
  try {
    const result = await client.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: [email]
    });

    return result.rows[0] ? transformUser(result.rows[0]) : null;
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    throw new Error('ユーザー情報の取得中にエラーが発生しました');
  }
}

function transformUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    profileImage: row.profile_image,
    password: row.password
  };
}