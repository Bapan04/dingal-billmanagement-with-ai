import supabase from '../config/supabaseClient.js';
import jwt from 'jsonwebtoken';

// Note: In a real app with Supabase, you would typically use Supabase Auth.
// Since we want to manage roles and custom logins, we can use standard auth
// or query the `users` table directly for a simple custom implementation.

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // -------------------------------------------------------------
    // TEMPORARY BYPASS: Hardcoded admin account for easy testing
    // -------------------------------------------------------------
    if (email === 'admin@dingal.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: '12345678-1234-1234-1234-123456789012', role: 'CORE_ADMIN' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
      );
      return res.json({ 
        token, 
        user: { id: '12345678-1234-1234-1234-123456789012', name: 'Super Admin', role: 'CORE_ADMIN' } 
      });
    }

    // Normal database lookup
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user || user.password_hash !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In a full impl, bcrypt.compare(password, user.password_hash) goes here.

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  // Requires auth middleware to check if req.user.role === 'CORE_ADMIN'
  try {
    // Generate password hash here
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, role, password_hash: password }]) // password should be hashed
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};
