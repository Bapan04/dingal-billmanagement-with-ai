import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Students = () => {
  const { token, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // ALL, EMI, FULL
  const [courseFilter, setCourseFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, courseRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_URL + '/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(import.meta.env.VITE_API_URL + '/api/courses', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStudents(studentRes.data);
        setCourses(courseRes.data);
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student and all their billing data?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting student');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchPayment = paymentFilter === 'ALL' ? true : s.payment_type === paymentFilter;
    const matchCourse = courseFilter === 'ALL' ? true : s.course_id === courseFilter;
    return matchPayment && matchCourse;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students Directory</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage enrolled students</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setPaymentFilter('ALL')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${paymentFilter === 'ALL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>All Students</button>
          <button onClick={() => setPaymentFilter('FULL')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${paymentFilter === 'FULL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Full Payment</button>
          <button onClick={() => setPaymentFilter('EMI')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${paymentFilter === 'EMI' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>EMI Plan</button>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-600">Filter Course:</label>
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]">
            <option value="ALL">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading students...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-gray-100">Student Name</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100">Course</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100">Payment Type</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100">Total Fee</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100">Balance</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No students found for this filter.</td></tr>
              ) : (
                filteredStudents.map(student => {
                  const displayId = student.roll_no ? `NEXX-${String(student.roll_no).padStart(3, '0')}` : `NEXX-${student.id.substring(0,4).toUpperCase()}`;
                  return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">ID: {displayId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.courses?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.payment_type === 'EMI' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {student.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Rs. {Number(student.total_fee).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">Rs. {Number(student.remaining_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                      <Link to={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                        View Details
                      </Link>
                      {user?.role === 'CORE_ADMIN' && (
                        <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded">Delete</button>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Students;
