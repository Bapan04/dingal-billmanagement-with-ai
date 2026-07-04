import supabase from '../config/supabaseClient.js';
import { sendAdmissionEmail } from '../services/emailService.js';
import { generateReceiptPDF } from '../services/pdfService.js';

export const admitStudent = async (req, res) => {
  const { name, email, phone, course_id, payment_type, total_fee, down_payment, installments_count } = req.body;
  
  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .single();
      
    if (courseError || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const remaining_amount = total_fee - (down_payment || 0);

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        name,
        email,
        phone,
        course_id,
        payment_type,
        total_fee,
        paid_amount: down_payment || 0,
        remaining_amount
      }])
      .select()
      .single();

    if (studentError) throw studentError;

    let paymentId = null;
    const initialAmount = down_payment || (payment_type === 'FULL' ? total_fee : 0);

    if (initialAmount > 0) {
      const { data: payment, error: payError } = await supabase
        .from('payments')
        .insert([{
          student_id: student.id,
          amount: initialAmount,
          payment_method: payment_type === 'FULL' ? 'FULL PAYMENT' : 'EMI DOWNPAYMENT'
        }])
        .select()
        .single();
        
      if (!payError && payment) {
        paymentId = payment.id;
        try {
          const receiptPath = await generateReceiptPDF(payment, student);
          await supabase.from('payments').update({ receipt_url: receiptPath }).eq('id', payment.id);
        } catch (e) {
          console.error('Initial PDF generation failed:', e);
        }
      }
    }

    if (payment_type === 'EMI' && remaining_amount > 0) {
      const emiAmount = remaining_amount / (installments_count || 3);
      const emiPlans = [];
      let currentDate = new Date();

      for (let i = 1; i <= (installments_count || 3); i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        emiPlans.push({
          student_id: student.id,
          installment_number: i,
          amount: emiAmount,
          due_date: new Date(currentDate).toISOString().split('T')[0],
          status: 'PENDING'
        });
      }

      const { error: emiError } = await supabase.from('emi_plans').insert(emiPlans);
      if (emiError) throw emiError;
    }

    await sendAdmissionEmail(email, name, course.name);

    res.status(201).json({ message: 'Student admitted successfully', student, payment_id: paymentId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, courses(name)');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*, courses(name)')
      .eq('id', id)
      .single();
    if (studentError) throw studentError;

    const { data: emiPlans, error: emiError } = await supabase
      .from('emi_plans')
      .select('*')
      .eq('student_id', id)
      .order('installment_number', { ascending: true });
      
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', id)
      .order('payment_date', { ascending: false });
    
    res.json({ student, emiPlans: emiPlans || [], payments: payments || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    // Manually cascade delete dependent records since ON DELETE CASCADE is missing
    const { error: payErr } = await supabase.from('payments').delete().eq('student_id', id);
    if (payErr) throw payErr;
    
    const { error: emiErr } = await supabase.from('emi_plans').delete().eq('student_id', id);
    if (emiErr) throw emiErr;

    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
