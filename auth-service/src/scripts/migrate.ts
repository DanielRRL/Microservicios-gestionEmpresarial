import pool from '../config/database';

async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Starting database migration...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table "users" created');
    
    // Create tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token VARCHAR(500) NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('passwordReset')),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table "tokens" created');
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
      CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens(expires_at);
    `);
    console.log('Indexes created');
    
    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
