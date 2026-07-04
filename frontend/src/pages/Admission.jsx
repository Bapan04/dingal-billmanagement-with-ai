import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Admission = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course_id: '',
    payment_type: 'FULL',
    total_fee: '',
    down_payment: '',
    installments_count: '3'
  });
  
  const [lastPaymentId, setLastPaymentId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + '/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses', err);
      }
    };
    fetchCourses();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-fill total fee when course changes
      if (name === 'course_id') {
        const selectedCourse = courses.find(c => c.id === value);
        if (selectedCourse) {
          updated.total_fee = selectedCourse.fee;
          // Default down payment to 20% if EMI
          updated.down_payment = updated.payment_type === 'EMI' ? Math.round(selectedCourse.fee * 0.2) : '';
        }
      }

      // Auto-adjust down payment if payment type changes
      if (name === 'payment_type') {
        if (value === 'FULL') {
          updated.down_payment = '';
        } else if (value === 'EMI' && updated.total_fee) {
          updated.down_payment = Math.round(updated.total_fee * 0.2);
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setLastPaymentId(null);

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/students/admit', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Student successfully admitted and billed!');
      if (res.data.payment_id) setLastPaymentId(res.data.payment_id);
      
      setFormData({
        name: '', email: '', phone: '', course_id: '', payment_type: 'FULL', total_fee: '', down_payment: '', installments_count: '3'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error admitting student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800">New Student Admission</h2>
        <p className="text-sm text-gray-500 mt-1">Enroll a student and generate the initial bill</p>
      </div>
      
      {success && (
        <div className="m-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center justify-between">
          <span>{success}</span>
          {lastPaymentId && (
            <button 
              type="button"
              onClick={() => window.open(`\${import.meta.env.VITE_API_URL}/api/payments/receipt/${lastPaymentId}?token=${token}`, '_blank')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors"
            >
              Download Bill Receipt
            </button>
          )}
        </div>
      )}
      {error && <div className="m-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Student Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              {courses.length === 0 ? (
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-200">
                  No courses available. Please go to the <b>Courses</b> tab to add them first, or ensure your Database is connected.
                </div>
              ) : (
                <select name="course_id" value={formData.course_id} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                  <option value="">-- Choose a course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - Rs. {c.fee}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Billing & Payment</h3>
          
          <div className="flex space-x-6 mb-6">
            <label className="flex items-center cursor-pointer p-4 border border-gray-200 rounded-lg flex-1 hover:bg-gray-50 transition-colors">
              <input type="radio" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" name="payment_type" value="FULL" checked={formData.payment_type === 'FULL'} onChange={handleChange} />
              <span className="ml-3 font-medium text-gray-900">Direct Full Payment</span>
            </label>
            <label className="flex items-center cursor-pointer p-4 border border-gray-200 rounded-lg flex-1 hover:bg-gray-50 transition-colors">
              <input type="radio" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" name="payment_type" value="EMI" checked={formData.payment_type === 'EMI'} onChange={handleChange} />
              <span className="ml-3 font-medium text-gray-900">EMI Plan</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-lg border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee (Rs)</label>
              <input type="number" name="total_fee" value={formData.total_fee} readOnly className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" />
            </div>
            
            {formData.payment_type === 'EMI' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (Rs)</label>
                  <input type="number" name="down_payment" value={formData.down_payment} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Installments</label>
                  <select name="installments_count" value={formData.installments_count} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="9">9 Months</option>
                    <option value="12">12 Months</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading || !formData.course_id} className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50">
            {loading ? 'Processing...' : 'Complete Admission & Generate Bill'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Admission;
