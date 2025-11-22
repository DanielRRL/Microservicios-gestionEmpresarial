import dotenv from 'dotenv';
import { UserModel } from '../models/User';
import pool from '../config/database';

dotenv.config();

async function createAdmin() {
  try {
    console.log(' Creating admin user.');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@loyestask.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    // Check if admin already exists
    const existingAdmin = await UserModel.findByEmail(adminEmail);
    
    if (existingAdmin) {
      console.log(' Admin user already exists:', adminEmail);
      return;
    }

    const admin = await UserModel.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });
    
    console.log('Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', adminPassword);
    console.log('Please change the password after first login');
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createAdmin().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
