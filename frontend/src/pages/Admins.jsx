import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const Admins = () => {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (user?.role !== 'CORE_ADMIN') {
    return <div className="p-6 text-red-500">You do not have permission to view this page.</div>;
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Admin user created successfully!');
      setFormData({ name: '', email: '', password: '', role: 'ADMIN' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center text-gray-800 border-b border-gray-200 pb-4">
        <ShieldCheck className="w-8 h-8 mr-3 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-sm text-gray-500">Create new staff accounts to manage admissions and billing.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {message && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">{message}</div>}
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-600">
                <option value="ADMIN">Regular Admin (Admissions/Billing only)</option>
                <option value="CORE_ADMIN">Core Admin (Full Access)</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admins;
