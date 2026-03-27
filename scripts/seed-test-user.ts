import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Starting seed...');
  process.env.DB_SSL = 'false';
  const { db } = await import('../lib/db');
  const schema = await import('../lib/schema');
  const { hashPassword } = await import('../lib/password');
  
  const email = 'admin@test.com';
  const password = 'testpassword123';
  
  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });

    let userId;
    if (!existingUser) {
      userId = uuidv4();
      await db.insert(schema.users).values({
        id: userId,
        name: 'Test Admin',
        email: email,
        roleId: null,
        emailVerified: true
      });
      console.log('User created');
    } else {
      userId = (existingUser as any).id;
      console.log('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    
    // Upsert account
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(schema.accounts.userId, userId)
    });

    if (!existingAccount) {
      await db.insert(schema.accounts).values({
        id: uuidv4(),
        userId: userId,
        accountId: email,
        providerId: 'email',
        password: hashedPassword
      });
      console.log('Account created');
    } else {
      await db.update(schema.accounts)
        .set({ password: hashedPassword })
        .where(eq(schema.accounts.userId, userId));
      console.log('Account password updated');
    }

    console.log('Account created/verified');
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
  process.exit(0);
}

seed();
