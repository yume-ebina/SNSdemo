import { createClient } from '@libsql/client';

const client = createClient({
  url: import.meta.env.VITE_DATABASE_URL || 'file:local.db',
});

// データベース接続のエラーハンドリング
async function checkConnection() {
  try {
    await client.execute('SELECT 1');
    console.log('データベース接続成功');
  } catch (error) {
    console.error('データベース接続エラー:', error);
    throw new Error('データベースに接続できません');
  }
}

// 型定義
interface DBError extends Error {
  code?: string;
}

// エラーハンドリングのためのラッパー関数
async function executeQuery<T>(
  query: string,
  params: any[] = []
): Promise<T> {
  try {
    const result = await client.execute({
      sql: query,
      args: params
    });
    return result as T;
  } catch (error) {
    const dbError = error as DBError;
    console.error('クエリ実行エラー:', dbError);
    
    if (dbError.code === 'SQLITE_CONSTRAINT') {
      throw new Error('データの制約違反が発生しました');
    }
    if (dbError.code === 'SQLITE_BUSY') {
      throw new Error('データベースがビジー状態です');
    }
    
    throw new Error('データベースエラーが発生しました');
  }
}

export async function initializeDatabase() {
  await checkConnection();
  
  const queries = [
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
  ];

  for (const query of queries) {
    await executeQuery(query);
  }
}

export async function getUser(email: string) {
  const query = 'SELECT * FROM users WHERE email = ?';
  const result = await executeQuery(query, [email]);
  return result.rows[0];
}

export async function updateUser(user: any) {
  const query = `
    UPDATE users 
    SET name = ?, profile_image = ?
    WHERE id = ?
  `;
  await executeQuery(query, [user.name, user.profileImage, user.id]);
}

export async function getPosts() {
  const query = `
    SELECT 
      p.*,
      u.name as user_name,
      u.profile_image as user_profile_image,
      COUNT(DISTINCT l.user_id) as likes_count,
      COUNT(DISTINCT c.id) as comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 20
  `;
  const result = await executeQuery(query);
  return result.rows;
}

export default client;