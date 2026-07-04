import supabase from '../config/supabaseClient.js';
import { generateReceiptPDF } from '../services/pdfService.js';
import { sendPaymentEmail } from '../services/emailService.js';

export const processPayment = async (req, res) => {
  const { student_id, amount, payment_method, emi_plan_id } = req.body;
  
  try {
    // 1. Record Payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        student_id,
        amount,
        payment_method,
        emi_plan_id: emi_plan_id || null
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // 2. Get Student details for receipt
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();

    if (studentError) throw studentError;

    // 3. Update EMI Plan if provided
    if (emi_plan_id) {
      await supabase
        .from('emi_plans')
        .update({ status: 'PAID', payment_date: new Date().toISOString() })
        .eq('id', emi_plan_id);
    }

    // 4. Update Student totals
    const newPaidAmount = Number(student.paid_amount) + Number(amount);
    const newRemainingAmount = Number(student.remaining_amount) - Number(amount);

    await supabase
      .from('students')
      .update({
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount
      })
      .eq('id', student_id);

    // 5. Generate Receipt PDF
    const receiptPath = await generateReceiptPDF(payment, student);

    // 6. Send Email
    await sendPaymentEmail(student.email, student.name, amount, !!emi_plan_id);

    // Update payment record with receipt path (could be S3 URL in prod)
    await supabase.from('payments').update({ receipt_url: receiptPath }).eq('id', payment.id);

    res.status(200).json({ message: 'Payment processed successfully', payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const downloadReceipt = async (req, res) => {
  const { id } = req.params;
  const { preview } = req.query;
  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, students(*)')
      .eq('id', id)
      .single();
      
    if (error || !payment) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    if (preview === 'true') {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt_${payment.id}.pdf`);
    }

    await generateReceiptPDF(payment, payment.students, res);

  } catch (err) {
    res.status(500).json({ message: 'Error downloading receipt' });
  }
};
