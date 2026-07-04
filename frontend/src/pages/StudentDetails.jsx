import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, FileText, ArrowLeft, Download, CheckCircle, Clock, Eye } from 'lucide-react';

const StudentDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState({ student: null, emiPlans: [], payments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [id, token]);

  const fetchStudentData = async () => {
    try {
      const res = await axios.get(`\${import.meta.env.VITE_API_URL}/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      // Create an invisible anchor to download the file directly from backend URL
      window.open(`\${import.meta.env.VITE_API_URL}/api/payments/receipt/${paymentId}?token=${token}`, '_blank');
    } catch (err) {
      alert("Error downloading receipt");
    }
  };

  const previewReceipt = (paymentId) => {
    window.open(`\${import.meta.env.VITE_API_URL}/api/payments/receipt/${paymentId}?token=${token}&preview=true`, '_blank');
  };

  const processInstallment = async (emiPlanId, amount) => {
    if (!window.confirm(`Process payment of Rs. ${amount} for this installment?`)) return;
    
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/payments', {
        student_id: id,
        amount,
        payment_method: 'INSTALLMENT',
        emi_plan_id: emiPlanId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Payment successful! Receipt generated.');
      fetchStudentData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing payment');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading student data...</div>;
  if (!data.student) return <div className="p-8 text-center text-red-500">Student not found.</div>;

  const { student, emiPlans, payments } = data;
  const displayId = student.roll_no ? `NEXX-${String(student.roll_no).padStart(3, '0')}` : `NEXX-${student.id.substring(0,4).toUpperCase()}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/students" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Students
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4"><User className="w-6 h-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
              <p className="text-sm text-gray-500">ID: {displayId} | {student.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-500">Course: {student.courses?.name}</div>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${student.payment_type === 'EMI' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
              {student.payment_type} PAYMENT
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 text-center">
          <div className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Fee</p>
            <p className="text-2xl font-bold text-gray-900">Rs. {Number(student.total_fee).toLocaleString()}</p>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Paid Amount</p>
            <p className="text-2xl font-bold text-green-600">Rs. {Number(student.paid_amount).toLocaleString()}</p>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Remaining Balance</p>
            <p className="text-2xl font-bold text-red-600">Rs. {Number(student.remaining_amount).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EMI Plans Section */}
        {student.payment_type === 'EMI' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center"><Clock className="w-4 h-4 mr-2" /> EMI Schedule</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Inst.</th>
                    <th className="px-4 py-3 font-medium">Due Date</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {emiPlans.map(plan => (
                    <tr key={plan.id} className={plan.status === 'PAID' ? 'bg-green-50/50' : ''}>
                      <td className="px-4 py-3 text-gray-900">#{plan.installment_number}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(plan.due_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">Rs. {Number(plan.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        {plan.status === 'PAID' ? (
                          <span className="inline-flex items-center text-green-600 text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> PAID</span>
                        ) : (
                          <button onClick={() => processInstallment(plan.id, plan.amount)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm transition-colors">
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments History & Bills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center"><FileText className="w-4 h-4 mr-2" /> Payment History & Bills</h3>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <li className="p-6 text-center text-gray-500">No payments recorded.</li>
              ) : (
                payments.map(payment => (
                  <li key={payment.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Rs. {Number(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(payment.payment_date).toLocaleString()} • 
                        <span className="ml-1 font-medium text-gray-700">
                          {payment.payment_method === 'INSTALLMENT' ? 'EMI Installment Paid' : payment.payment_method + ' Payment'}
                        </span>
                      </p>
                    </div>
                    {payment.receipt_url && (
                      <div className="flex space-x-2">
                        <button onClick={() => previewReceipt(payment.id)} className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">
                          <Eye className="w-3 h-3 mr-1" /> Preview
                        </button>
                        <button onClick={() => downloadReceipt(payment.id)} className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">
                          <Download className="w-3 h-3 mr-1" /> Bill
                        </button>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
