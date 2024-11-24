import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL || !process.env.DATABASE_AUTH_TOKEN) {
  throw new Error('データベースの設定が見つかりません。.envファイルを確認してください。');
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});

export async function initializeDatabase() {
  try {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profile_image TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id)
      )`,
      `CREATE TABLE IF NOT EXISTS likes (
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id)
      )`
    ]);

    console.log('データベースの初期化が完了しました');
  } catch (error) {
    console.error('データベースの初期化に失敗:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    const result = await client.execute({
      sql: `SELECT COUNT(*) as count FROM users WHERE email = ?`,
      args: ['test@example.com']
    });

    if (result.rows[0].count === 0) {
      await client.execute({
        sql: `INSERT INTO users (id, name, email, password, profile_image) 
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          '1',
          'テストユーザー',
          'test@example.com',
          'test1234',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        ]
      });
      console.log('初期データの投入が完了しました');
    } else {
      console.log('初期データは既に存在します');
    }
  } catch (error) {
    console.error('初期データの投入に失敗:', error);
    throw error;
  }
}

export default client;