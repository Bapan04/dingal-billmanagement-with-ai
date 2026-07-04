import supabase from '../config/supabaseClient.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Total Students
    const { count: studentCount, error: studentError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    if (studentError) throw studentError;

    // Active Courses
    const { count: courseCount, error: courseError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    if (courseError) throw courseError;

    // Total Revenue (sum of all amounts in payments table)
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('amount');
    if (paymentError) throw paymentError;
    
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Recent Admissions (latest 5 students)
    const { data: recentAdmissions, error: recentError } = await supabase
      .from('students')
      .select('id, name, email, created_at, courses(name)')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentError) throw recentError;

    res.json({
      totalStudents: studentCount || 0,
      activeCourses: courseCount || 0,
      totalRevenue: totalRevenue || 0,
      recentAdmissions: recentAdmissions || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
