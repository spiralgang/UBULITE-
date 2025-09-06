/**
 * Puter.js Authentication Template
 * Use this template to add authentication functionality
 */

class PuterAuth {
  constructor() {
    this.initialized = false;
    this.user = null;
  }

  async initialize() {
    if (typeof puter === 'undefined') {
      throw new Error('Puter.js not available');
    }
    
    if (!puter.auth) {
      throw new Error('Puter.js Authentication not available');
    }
    
    this.initialized = true;
    
    // Check if user is already logged in
    try {
      this.user = await puter.auth.getUser();
    } catch (error) {
      console.log('No user currently logged in');
    }
    
    console.log('✅ Puter.js Auth initialized');
  }

  async login(credentials) {
    if (!this.initialized) await this.initialize();

    try {
      const user = await puter.auth.login(credentials);
      this.user = user;
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    if (!this.initialized) await this.initialize();

    try {
      await puter.auth.logout();
      this.user = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    if (!this.initialized) await this.initialize();

    try {
      const user = await puter.auth.getUser();
      this.user = user;
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  isLoggedIn() {
    return this.user !== null;
  }

  getUser() {
    return this.user;
  }
}

// Usage Example:
/*
const auth = new PuterAuth();

// Login
const loginResult = await auth.login({
  username: 'user@example.com',
  password: 'password123'
});

if (loginResult.success) {
  console.log('Logged in as:', loginResult.user);
}

// Check current user
if (auth.isLoggedIn()) {
  console.log('Current user:', auth.getUser());
}

// Logout
await auth.logout();
*/
