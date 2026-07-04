import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', fee: '', duration: '' });
  const [message, setMessage] = useState('');

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/courses', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Course created successfully!');
      setFormData({ name: '', fee: '', duration: '' });
      fetchCourses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating course');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`\${import.meta.env.VITE_API_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      alert('Error deleting course. It might be assigned to students.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
          <p className="text-sm text-gray-500 mt-1">Add or view active courses for the institute</p>
        </div>
      </div>

      {user?.role === 'CORE_ADMIN' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Add New Course</h2>
          {message && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">{message}</div>}
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Course Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Cyber Security" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="w-48">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Fee (Rs)</label>
              <input type="number" value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})} placeholder="e.g. 50000" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="w-48">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Duration</label>
              <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 6 Months" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Course'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <th className="px-6 py-4 font-medium border-b border-gray-100">Course Name</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100">Fee</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100">Duration</th>
              {user?.role === 'CORE_ADMIN' && <th className="px-6 py-4 font-medium border-b border-gray-100 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length === 0 ? (
              <tr><td colSpan={user?.role === 'CORE_ADMIN' ? '4' : '3'} className="px-6 py-8 text-center text-gray-500">No courses available. Ask CORE_ADMIN to add some.</td></tr>
            ) : (
              courses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{course.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">Rs. {Number(course.fee).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{course.duration}</td>
                  {user?.role === 'CORE_ADMIN' && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Courses;
