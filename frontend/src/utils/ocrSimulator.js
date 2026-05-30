/** Simulates Tesseract OCR output for demo mode (no backend). */
const VENDORS = ["Zoho Corporation","AWS India","Google Workspace","Airtel Business",
  "Razorpay Pvt Ltd","Jio Fiber Enterprise","Adobe Systems India",
  "Tata Consultancy Services","Infosys BPO","Freshworks Inc"];
const CATS = ["SAAS","UTILITIES","SERVICES","RENT","TRAVEL"];
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = a => a[rand(0,a.length-1)];
const iso  = ms => new Date(ms).toISOString().slice(0,10);

export function simulateOcrText(file) {
  const vendor=pick(VENDORS), cat=pick(CATS), amount=rand(4000,130000);
  const gst=Math.floor(amount*.18), total=amount+gst;
  const invDate=iso(Date.now()-rand(5,45)*864e5);
  const dueDate=iso(+new Date(invDate)+(Math.random()>.35?rand(25,35):-rand(3,10))*864e5);
  const invNum=`INV-${rand(10000,99999)}`;
  return `TAX INVOICE\n${vendor.toUpperCase()}\nGSTIN: 29AABCZ1234F1Z5\n\nInvoice No   : ${invNum}\nInvoice Date : ${invDate}\nDue Date     : ${dueDate}\nCategory     : ${cat}\n\nBilled To: Your Company Pvt Ltd\n\nDESCRIPTION                    AMOUNT\n-------------------------------\nProfessional Services          ${amount}\nCGST @ 9%                      ${Math.floor(gst/2)}\nSGST @ 9%                      ${Math.floor(gst/2)}\n-------------------------------\nTOTAL (INR)                    ${total}\n\nBank: HDFC Bank | IFSC: HDFC0001234`;
}
