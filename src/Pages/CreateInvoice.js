import React, { useEffect, useState } from 'react';
import { useData } from './DataContext';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css'
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
const CreateInvoice = () => {
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
    e.preventDefault();
    const formData = {
      clientCode,
      invoiceNumber,
      invoiceDate,
      month,
      year,
    };
    console.log('Form Data:', formData);
    generatePdf();

  };

  const generatePdf = () => {
    const doc = new jsPDF();

    // Add the "Bill To" Section
    doc.setFontSize(10);
    doc.text("BILL TO", 10, 10);
    doc.text("Attention:", 10, 20);
    doc.text("INDIVIDUAL", 10, 25);
    doc.text("Bangalore, Karnataka, India", 10, 30);

    // Add the Invoice Details Section
    doc.text("GSTIN", 160, 10);
    doc.text("State", 160, 15);
    doc.text("Karnataka", 180, 15);
    doc.text("Invoice Date", 160, 20);
    doc.text("10 Oct, 2024", 180, 20);
    doc.text("Invoice Number", 160, 25);
    doc.text("INV-INDV-OCT-10", 180, 25);
    doc.text("State Code", 160, 30);

    // Define table headers and rows
    const headers = [["Product Description", "SAC Code", "Qty", "Rate", "Additional Fee", "Taxable Amount"]];
    const rows = [
      ["LATEST EMPLOYMENT-1", "998521", "2", "123", "0", "246"],
      ["EX-EMPLOYMENT-2", "998521", "2", "123", "0", "246"],
      ["PREVIOUS EMPLOYMENT-3", "998521", "0", "123", "0", "0"],
      ["POST GRADUATION", "998521", "1", "1234", "0", "1234"],
      ["GRADUATION", "998521", "1", "3245", "0", "3245"],
      // Add more rows as needed, following the structure in your image
      ["COMPANY SITE VISIT", "998521", "0", "900", "0", "0"]
    ];

    // Draw the table using autoTable plugin
    doc.autoTable({
      startY: 40,
      head: headers,
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
    });

    // Add page numbers at the bottom
    doc.text("Page 1/3", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });


    doc.setFontSize(10);
    doc.text("BILL TO", 10, 10);
    doc.text("Attention:", 10, 20);
    doc.text("INDIVIDUAL", 10, 25);
    doc.text("Bangalore, Karnataka, India", 10, 30);

    // Add the Invoice Details Section
    doc.text("GSTIN", 160, 10);
    doc.text("State", 160, 15);
    doc.text("Karnataka", 180, 15);
    doc.text("Invoice Date", 160, 20);
    doc.text("10 Oct, 2024", 180, 20);
    doc.text("Invoice Number", 160, 25);
    doc.text("INV-INDV-OCT-10", 180, 25);
    doc.text("State Code", 160, 30);

    // Define table headers and rows
    const secondHeader = [["Product Description", "SAC Code", "Qty", "Rate", "Additional Fee", "Taxable Amount"]];
    const secondRow = [
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

    // Draw the table
    doc.autoTable({
      startY: 40,
      head: secondHeader,
      body: secondRow,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
    });

    // Add the bank account details
    doc.setFontSize(10);
    doc.text("GoldQuest Global Bank Account Details", 10, doc.autoTable.previous.finalY + 10);
    const bankDetails = [
      ["Bank Name", "ICICI BANK LTD"],
      ["Bank A/C No", "058305004248"],
      ["Bank Branch", "Marathahalli"],
      ["Bank IFSC/ NEFT/ RTGS", "ICIC0001417"],
      ["MICR", "560229040"]
    ];

    bankDetails.forEach((detail, index) => {
      doc.text(detail[0], 10, doc.autoTable.previous.finalY + 20 + index * 5);
      doc.text(detail[1], 60, doc.autoTable.previous.finalY + 20 + index * 5);
    });

    // Add the tax details section
    const taxY = doc.autoTable.previous.finalY + 50;
    doc.text("Total Amount Before Tax", 140, taxY);
    doc.text("25621", 190, taxY);

    doc.text("Add: CGST - 9%", 140, taxY + 10);
    doc.text("2305.89", 190, taxY + 10);

    doc.text("Add: SGST - 9%", 140, taxY + 20);
    doc.text("2305.89", 190, taxY + 20);

    doc.text("Add: IGST - 18%", 140, taxY + 30);
    doc.text("0", 190, taxY + 30);

    doc.text("Total Tax Amount (Round off)", 140, taxY + 40);
    doc.text("30232.78", 190, taxY + 40);

    doc.text("GST On Reverse Charge", 140, taxY + 50);
    doc.text("No", 190, taxY + 50);

    // Add the total in words
    doc.setFontSize(10);
    doc.text(
      "Invoice Amount in words: Thirty Thousand Two Hundred And Thirty Two Point Seventy Eight Rupees Only",
      10,
      taxY + 70
    );

    const thirdHeader = [
      ["SL NO", "Application ID", "Employee ID", "Case Received", "Candidate Full Name", "E1", "E2", "E3", "E4", "D", "C", "P", "I", "D", "A", "A", "C", "A", "Add Fee", "Pricing", "Report Date"]
    ];

    const thirdRow = [
      ["1", "GQ-INDV-649", "NA", "01-10-2024", "Anala V G Trinath Kumar", "N", "N", "N", "N", "N", "7", "7", "9", "9", "4", "0", "8", "10", "0", "8902", "08-10-2024"],
      ["2", "GQ-INDV-652", "NA", "04-10-2024", "Vijay Pathak", "2", "1", "3", "N", "N", "7", "8", "8", "0", "0", "0", "2", "21", "0", "6404", "21-10-2024"],
      ["3", "GQ-INDV-654", "NA", "07-10-2024", "Lokita Vijaykumar Thakrar", "N", "N", "N", "N", "N", "7", "9", "9", "0", "0", "N", "N", "16", "0", "702", "16-10-2024"],
      ["4", "GQ-INDV-657", "NA", "16-10-2024", "Vishnukant", "N", "N", "N", "N", "N", "5", "6", "6", "0", "0", "4", "16", "0", "1023", "16-10-2024"],
      ["5", "GQ-INDV-658", "NA", "16-10-2024", "Bayagaraj C", "N", "N", "N", "N", "N", "4", "4", "8", "8", "0", "0", "18", "18", "0", "8590", "18-10-2024"],
      ["Total", "", "", "", "", "2", "2", "3", "3", "0", "0", "0", "0", "0", "0", "8", "25621"]
    ];

    // Draw the table
    doc.autoTable({
      startY: 20,
      head: thirdHeader,
      body: thirdRow,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 40 },
        5: { cellWidth: 10 },
        6: { cellWidth: 10 },
        7: { cellWidth: 10 },
        8: { cellWidth: 10 },
        // Customize further columns as needed
        19: { cellWidth: 20 },
        20: { cellWidth: 20 }
      }
    });

    // Add the footer for terms and conditions
    const footerY = doc.autoTable.previous.finalY + 10;
    doc.setFontSize(10);
    doc.text(
      "Make all your payment Cheques, RTGS/NEFT Payable to :\"GOLDQUEST GLOBAL HR SERVICES PRIVATE LIMITED\".",
      10,
      footerY
    );
    doc.text(
      "Payment to be made as per the terms of Agreement, Payments received after due date shall be liable of interest @ 3% per month,",
      10,
      footerY + 5
    );
    doc.text(
      "part of month taken as full month. Any discrepancy shall be intimated within 3 working days receipt of bill.",
      10,
      footerY + 10
    );
    doc.text(
      "Please email us at accounts@goldquestglobal.com / Contact Us: +91 9945891310",
      10,
      footerY + 15
    );

    // Save the generated PDF
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
