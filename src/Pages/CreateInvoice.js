import React, { useEffect, useState } from 'react';
import { useData } from './DataContext';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css'
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useApi } from '../ApiContext';
const CreateInvoice = () => {
  const { API_URL } = useApi();
  const { listData, fetchData } = useData();
  const [clientCode, setClientCode] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const options = listData.map(client => ({
    name: client.name + `(${client.client_unique_id})`,
    value: client.id,
  }));
  console.log('listData', listData)
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleSubmit = (e) => {
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");
    e.preventDefault();
    const formdata = new FormData();
    const requestOptions = {
      method: "GET",
      body: formdata,
      redirect: "follow"
    };
    fetch(`${API_URL}/generate-invoice?customer_id=${clientCode}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error))
    console.log('Form Data:');
    generatePdf();
  };
  const generatePdf = () => {
    const doc = new jsPDF();
    // Document Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", 105, 15, { align: "center" });
    // Section: Bill To & Invoice Details Side-by-Side
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 10, 25);
    doc.setFont("helvetica", "normal");
    doc.text("Attention: INDIVIDUAL", 10, 30);
    doc.text("Location: Bangalore, Karnataka, India", 10, 35);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", 140, 25);
    doc.setFont("helvetica", "normal");
    const invoiceDetails = [
      ["GSTIN", ""],
      ["State", "Karnataka"],
      ["Invoice Date", "10 Oct, 2024"],
      ["Invoice Number", "INV-INDV-OCT-10"],
      ["State Code", ""]
    ];
    let yPosition = 30;
    invoiceDetails.forEach(([label, value]) => {
      doc.text(`${label}:`, 140, yPosition);
      doc.text(value, 180, yPosition);
      yPosition += 5;
    });
    // Divider Line
    yPosition += 5; // Move down for divider
    doc.line(10, yPosition, 200, yPosition);
    // First Table
    const headers1 = [["Product Description", "SAC Code", "Qty", "Rate", "Additional Fee", "Taxable Amount"]];
    const rows1 = [
      ["LATEST EMPLOYMENT-1", "998521", "2", "123", "0", "246"],
      ["EX-EMPLOYMENT-2", "998521", "2", "123", "0", "246"],
      ["PREVIOUS EMPLOYMENT-3", "998521", "0", "123", "0", "0"],
      ["POST GRADUATION", "998521", "1", "1234", "0", "1234"],
      ["GRADUATION", "998521", "1", "3245", "0", "3245"],
      ["COMPANY SITE VISIT", "998521", "0", "900", "0", "0"]
    ];
    doc.autoTable({
      startY: yPosition + 5, // Start table below the divider
      head: headers1,
      body: rows1,
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.2 },
      theme: 'grid',
    });
    // Space for the second table
    yPosition = doc.autoTable.previous.finalY + 10;
    // Second Table
    const headers2 = [["Product Description", "SAC Code", "Qty", "Rate", "Additional Fee", "Taxable Amount"]];
    const rows2 = [
      ["UAN/ITR/FORM 26AS", "998521", "0", "675", "0", "0"],
      ["EMPLOYMENT SITE VISIT", "998521", "0", "890", "0", "0"],
      ["EDUCATION/ACADEMIC", "998521", "0", "78", "0", "0"],
      ["FCA", "998521", "0", "78", "0", "0"],
      ["PROOF OF ADDRESS CHECK", "998521", "0", "67", "0", "0"],
      ["DIGITAL ADDRESS", "998521", "0", "20", "0", "0"],
      ["12TH-STD", "998521", "0", "500", "0", "0"],
      ["BANK STATEMENT CHECK", "998521", "0", "00", "0", "0"],
      ["GAP CHECK", "998521", "0", "0", "0", "0"],
      ["Total", "", "18", "", "", "25621"]
    ];
    doc.autoTable({
      startY: yPosition,
      head: headers2,
      body: rows2,
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.2 },
      theme: 'grid',
    });
    // Bank Account & Tax Details
    yPosition = doc.autoTable.previous.finalY + 15; // Add space before the bank details
    doc.setFont("helvetica", "bold");
    doc.text("GoldQuest Global Bank Account Details", 10, yPosition);
    doc.text("Tax Details", 140, yPosition);
    doc.setFont("helvetica", "normal");
    const bankDetails = [
      ["Bank Name", "ICICI BANK LTD"],
      ["Bank A/C No", "058305004248"],
      ["Bank Branch", "Marathahalli"],
      ["Bank IFSC/ NEFT/ RTGS", "ICIC0001417"],
      ["MICR", "560229040"]
    ];
    const taxDetails = [
      { label: "Total Amount Before Tax", amount: "25621" },
      { label: "Add: CGST - 9%", amount: "2305.89" },
      { label: "Add: SGST - 9%", amount: "2305.89" },
      { label: "Add: IGST - 18%", amount: "0" },
      { label: "Total Tax Amount (Round off)", amount: "30232.78" },
      { label: "GST On Reverse Charge", amount: "No" }
    ];
    bankDetails.forEach(([label, value], index) => {
      const rowY = yPosition + 10 + index * 5;
      doc.text(`${label}:`, 10, rowY);
      doc.text(value, 60, rowY);
      if (taxDetails[index]) {
        const taxDetail = taxDetails[index];
        doc.text(`${taxDetail.label}:`, 140, rowY);
        doc.text(taxDetail.amount, 190, rowY);
      }
    });
    // Invoice Amount in Words
    yPosition += bankDetails.length * 5 + 20; // Adjust spacing before amount in words
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Amount in Words:", 10, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text("Thirty Thousand Two Hundred And Thirty Two Point Seventy Eight Rupees Only", 10, yPosition + 5);
    // Third Table
    const headers3 = [
      ["SL NO", "Application ID", "Employee ID", "Case Received", "Candidate Full Name", "E1", "E2", "E3", "E4", "D", "C", "P", "I", "D", "A", "A", "C", "A", "Add Fee", "Pricing", "Report Date"]
    ];
    const rows3 = [
      ["1", "GQ-INDV-649", "NA", "01-10-2024", "Anala V G Trinath Kumar", "N", "N", "N", "N", "N", "7", "7", "9", "9", "4", "0", "8", "10", "0", "8902", "08-10-2024"],
      ["2", "GQ-INDV-652", "NA", "04-10-2024", "Vijay Pathak", "2", "1", "3", "N", "N", "7", "8", "8", "0", "0", "0", "2", "21", "0", "6404", "21-10-2024"],
      ["3", "GQ-INDV-654", "NA", "07-10-2024", "Lokita Vijaykumar Thakrar", "N", "N", "N", "N", "N", "7", "9", "9", "0", "0", "N", "N", "16", "0", "702", "16-10-2024"],
      ["4", "GQ-INDV-657", "NA", "16-10-2024", "Vishnukant", "N", "N", "N", "N", "N", "5", "4", "4", "4", "4", "37", "65", "0", "27598", ""]
    ];
    doc.autoTable({
      startY: yPosition + 20, // Ensure spacing before the third table
      head: headers3,
      body: rows3,
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.2 },
      theme: 'grid',
    });
    // Finalize PDF
    doc.save("invoice.pdf");
  };
  return (
    <div className="bg-[#F7F6FB] p-12">
      <div className="bg-white p-12 rounded-md w-full mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Generate Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clrefin" className="block mb-2">Client Code:</label>
            <SelectSearch
              options={options}
              value={clientCode}
              name="language"
              placeholder="Choose your language"
              onChange={(value) => setClientCode(value)}
              search
            />
          </div>
          <div>
            <label htmlFor="invnum" className="block mb-2">Invoice Number:</label>
            <input
              type="text"
              name="invnum"
              id="invnum"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="invoice_date" className="block mb-2">Invoice Date:</label>
            <input
              type="date"
              name="invoice_date"
              id="invoice_date"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="moinv" className="block mb-2">Month:</label>
            <select
              id="inmnth"
              name="inmnth"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">--Select Month--</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              id="inyer"
              name="inyer"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">--Select Year--</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div className="text-left">
            <button type="submit" className="p-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-blue-400">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateInvoice;
