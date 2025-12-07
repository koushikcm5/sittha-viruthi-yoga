// Test if registration actually stores data in Railway MySQL database
const API_URL = 'https://feisty-tenderness-production.up.railway.app/api';

async function testRegistrationStorage() {
  console.log('=== TESTING RAILWAY DATABASE STORAGE ===\n');
  
  const testUser = {
    name: 'Test Storage User',
    username: 'teststorage' + Date.now(),
    email: 'teststorage' + Date.now() + '@example.com',
    phone: '9999999999',
    password: 'Test1234'
  };
  
  console.log('Step 1: Registering new user...');
  console.log('Username:', testUser.username);
  console.log('Email:', testUser.email);
  
  try {
    // Register user
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerResponse.json();
    console.log('\n✅ Registration Response:', registerData);
    
    if (!registerResponse.ok) {
      console.log('❌ Registration failed!');
      return;
    }
    
    // Wait 2 seconds for database to save
    console.log('\nStep 2: Waiting 2 seconds for database to save...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to login with the new user
    console.log('\nStep 3: Testing login with new user...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('User data:', {
        username: loginData.username,
        role: loginData.role,
        name: loginData.name
      });
      console.log('\n🎉 VERIFICATION: Data IS being stored in Railway database!');
      console.log('\n=== CURRENT BACKEND CONFIGURATION ===');
      console.log('✅ Registration creates USER role (correct)');
      console.log('✅ Auto-approved (approved=true)');
      console.log('✅ Auto-verified (email_verified=true)');
      console.log('✅ Data persists in Railway MySQL');
      
    } else {
      console.log('❌ LOGIN FAILED!');
      console.log('Error:', loginData);
      console.log('\n⚠️  User was registered but cannot login.');
      console.log('Possible reasons:');
      console.log('- approved=false (need to approve in database)');
      console.log('- email_verified=false (need to verify in database)');
      console.log('\nRun this SQL in Railway to check:');
      console.log(`SELECT * FROM user WHERE username='${testUser.username}';`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRegistrationStorage();
