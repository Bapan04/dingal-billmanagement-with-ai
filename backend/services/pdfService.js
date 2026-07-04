import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function numberToWords(num) {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : '';
  return str === '' ? 'Zero Only' : str + ' Only';
}

import os from 'os';

export const generateReceiptPDF = async (paymentData, studentData, customStream = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      
      let writeStream = customStream;
      let filePath = null;

      if (!customStream) {
        const receiptsDir = path.join(os.tmpdir(), 'receipts');
        if (!fs.existsSync(receiptsDir)) {
          fs.mkdirSync(receiptsDir, { recursive: true });
        }

        const fileName = `receipt_${paymentData.id}.pdf`;
        filePath = path.join(receiptsDir, fileName);
        writeStream = fs.createWriteStream(filePath);
      }

      doc.pipe(writeStream);

      // --- 1. Header Section ---
      // Try to embed the provided logo image, if available
      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDirPath = path.dirname(currentFilePath);
      const logoPath = path.join(currentDirPath, '..', 'assets', 'logo.png');
      
      if (fs.existsSync(logoPath)) {
        // Embed image scaled down to act as a logo
        doc.image(logoPath, 40, 35, { width: 75 });
      } else {
        doc.fontSize(20).font('Helvetica-Bold').text('DINGAL INSTITUTE', 40, 50);
      }

      doc.fontSize(14).font('Helvetica-Bold').text('TAX INVOICE CUM RECEIPT', 200, 35, { align: 'right' });
      doc.fontSize(10).font('Helvetica-Bold').text('DINGAL INSTITUTE', 200, 55, { align: 'right' });
      doc.font('Helvetica').fontSize(9).text('Connaught Place (CP),', 200, 70, { align: 'right' });
      doc.text('New Delhi - 110001', 200, 82, { align: 'right' });
      doc.text('Phone: +91 9217179762 | Email: info@dingal.com', 200, 94, { align: 'right' });
      
      doc.moveDown(3);

      // --- 2. Details Boxes ---
      const topY = 125;
      doc.rect(40, topY, 255, 80).stroke(); // Left box
      doc.rect(295, topY, 260, 80).stroke(); // Right box

      // Left Box Content
      doc.font('Helvetica-Bold').fontSize(9).text('GSTIN NO:', 45, topY + 5);
      doc.font('Helvetica').text('07AABCU2368K1Z3', 130, topY + 5);
      
      doc.font('Helvetica-Bold').text('INVOICE NO:', 45, topY + 25);
      doc.font('Helvetica').text(paymentData.id.substring(0, 8).toUpperCase(), 130, topY + 25);
      
      doc.font('Helvetica-Bold').text('DATE OF INVOICE:', 45, topY + 45);
      doc.font('Helvetica').text(new Date(paymentData.payment_date).toLocaleDateString('en-GB'), 140, topY + 45);
      
      doc.font('Helvetica-Bold').text('PLACE OF SUPPLY:', 45, topY + 65);
      doc.font('Helvetica').text('DELHI', 140, topY + 65);

      // Right Box Content
      const displayId = studentData.roll_no ? `DINGAL-${String(studentData.roll_no).padStart(3, '0')}` : `DINGAL-${studentData.id.substring(0, 4).toUpperCase()}`;

      doc.font('Helvetica-Bold').text("RECEIVER'S DETAIL (BILLED TO)", 300, topY + 5);
      doc.font('Helvetica-Bold').text('NAME:', 300, topY + 25);
      doc.font('Helvetica').text(studentData.name.toUpperCase(), 370, topY + 25);
      
      doc.font('Helvetica-Bold').text('STUDENT ID:', 300, topY + 45);
      doc.font('Helvetica').text(displayId, 370, topY + 45);
      
      doc.font('Helvetica-Bold').text('STATE:', 300, topY + 65);
      doc.font('Helvetica').text('DELHI', 370, topY + 65);

      // --- 3. Table Header ---
      const tableTop = 220;
      doc.rect(40, tableTop, 515, 30).fillAndStroke('#f0f0f0', '#000');
      doc.fillColor('#000').font('Helvetica-Bold').fontSize(8);
      
      doc.text('DESCRIPTION OF SERVICES', 45, tableTop + 10, { width: 150 });
      doc.text('SAC', 200, tableTop + 10);
      doc.text('TAXABLE\nVALUE', 240, tableTop + 5, { align: 'right', width: 60 });
      doc.text('CGST (9%)', 310, tableTop + 10, { align: 'right', width: 60 });
      doc.text('SGST (9%)', 380, tableTop + 10, { align: 'right', width: 60 });
      doc.text('TOTAL\nAMOUNT', 480, tableTop + 5, { align: 'right', width: 70 });

      // --- 4. Table Row (Calculations) ---
      const rowY = 250;
      doc.rect(40, rowY, 515, 60).stroke();
      
      // Calculate GST (assuming amount is inclusive of 18% GST)
      const totalAmount = Number(paymentData.amount);
      const taxableValue = (totalAmount / 1.18).toFixed(2);
      const cgst = (taxableValue * 0.09).toFixed(2);
      const sgst = (taxableValue * 0.09).toFixed(2);

      let serviceDesc = 'COMMERCIAL TRAINING & COACHING';
      if (paymentData.payment_method === 'INSTALLMENT') serviceDesc += '\n(EMI INSTALLMENT)';
      else if (paymentData.payment_method === 'EMI DOWNPAYMENT') serviceDesc += '\n(EMI DOWNPAYMENT)';
      else serviceDesc += '\n(FULL COURSE FEE)';

      doc.font('Helvetica').fontSize(8);
      doc.text(serviceDesc, 45, rowY + 10, { width: 140 });
      doc.text('999293', 200, rowY + 10);
      doc.text(taxableValue, 240, rowY + 10, { align: 'right', width: 60 });
      doc.text(cgst, 310, rowY + 10, { align: 'right', width: 60 });
      doc.text(sgst, 380, rowY + 10, { align: 'right', width: 60 });
      doc.font('Helvetica-Bold').text(totalAmount.toFixed(2), 480, rowY + 10, { align: 'right', width: 70 });

      // Draw vertical lines for the table
      doc.moveTo(195, tableTop).lineTo(195, rowY + 60).stroke();
      doc.moveTo(235, tableTop).lineTo(235, rowY + 60).stroke();
      doc.moveTo(310, tableTop).lineTo(310, rowY + 60).stroke();
      doc.moveTo(380, tableTop).lineTo(380, rowY + 60).stroke();
      doc.moveTo(450, tableTop).lineTo(450, rowY + 60).stroke();

      // --- 5. Total Row ---
      const totalRowY = rowY + 60;
      doc.rect(40, totalRowY, 515, 20).stroke();
      doc.font('Helvetica-Bold').text('INVOICE TOTAL (INCL. GST)', 240, totalRowY + 6);
      doc.text(totalAmount.toFixed(2), 480, totalRowY + 6, { align: 'right', width: 70 });

      // --- 6. Footer Information ---
      const footerY = totalRowY + 30;
      doc.font('Helvetica').fontSize(9);
      doc.text('INVOICE VALUE (IN WORDS): ', 40, footerY);
      doc.font('Helvetica-Bold').text(`Rupees ${numberToWords(Math.round(totalAmount))}`, 190, footerY);
      
      doc.font('Helvetica').text(`Received by: ${paymentData.payment_method}`, 40, footerY + 15);

      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(8);
      doc.text('CERTIFIED THAT THE PARTICULARS GIVEN ABOVE ARE TRUE AND CORRECT');
      doc.moveDown();
      doc.text('TERMS & CONDITIONS');
      doc.font('Helvetica').fontSize(7);
      doc.text('1) Fee once paid is not refundable / adjustable / transferable.');
      doc.text('2) Any Disputes are subject to the jurisdiction of DELHI.');

      // Signature Placeholder
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('For DINGAL INSTITUTE', 350, footerY + 60, { align: 'right' });
      doc.text('AUTH. SIGNATORY / ACCOUNTANT', 350, footerY + 110, { align: 'right' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};
