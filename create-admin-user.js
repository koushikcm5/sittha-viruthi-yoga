// Create admin user via registration then manually update in database
const API_URL = 'https://feisty-tenderness-production.up.railway.app/api';

async function createAdmin() {
  console.log('Creating admin user via registration...');
  
  try {
    // Register as normal user first
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        phone: '1234567890',
        password: 'Admin123'
      })
    });
    
    const data = await response.json();
    console.log('Registration response:', data);
    
    if (response.ok) {
      console.log('\n✅ Admin user created!');
      console.log('\n⚠️  IMPORTANT: You need to manually update this user to ADMIN role in Railway MySQL:');
      console.log('\nRun this SQL in Railway MySQL Data tab:');
      console.log('UPDATE user SET role="ADMIN", email_verified=1, approved=1 WHERE username="admin";');
      console.log('\nThen login with:');
      console.log('Username: admin');
      console.log('Password: Admin123');
    } else {
      console.log('❌ Registration failed:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdmin();
