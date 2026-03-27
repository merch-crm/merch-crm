


async function testLogin() {
  console.log('Starting login test...');
  process.env.DB_SSL = 'false';
  const { auth } = await import('../lib/auth');
  
  const email = 'admin@test.com';
  const password = 'testpassword123';
  
  console.log(`Attempting to sign in with ${email}...`);
  
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      }
    });
    console.log('Login result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Login error:', error);
  }
  process.exit(0);
}

testLogin();
