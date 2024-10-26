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
   

    const formdata = new FormData();

    const requestOptions = {
      method: "GET",
      body: formdata,
      redirect: "follow"
    };
    
    fetch("http://localhost:5000/generate-invoice?customer_id=1&admin_id=1&_token=eae0ff2481308a95b2029eb2282f07b5723b556b3355a3f1b8f09d2cba1ede00", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error))



    console.log('Form Data:');
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
      ["COMPANY SITE VISIT", "998521", "0", "900", "0", "0"]
    ];
  
    // Draw the first table using autoTable plugin
    doc.autoTable({
      startY: 40,
      head: headers,
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
    });
  
    // Define the starting position for the second table
    let currentY = doc.autoTable.previous.finalY + 10; // Adding some space after the first table
  
    // Define second table headers and rows
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
  
    // Draw the second table
    doc.autoTable({
      startY: currentY,
      head: secondHeader,
      body: secondRow,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
    });
  
    // Update currentY for the next section
    currentY = doc.autoTable.previous.finalY + 10;
  
    // Add the bank account details
    doc.setFontSize(10);
    doc.text("GoldQuest Global Bank Account Details", 10, currentY);
    const bankDetails = [
      ["Bank Name", "ICICI BANK LTD"],
      ["Bank A/C No", "058305004248"],
      ["Bank Branch", "Marathahalli"],
      ["Bank IFSC/ NEFT/ RTGS", "ICIC0001417"],
      ["MICR", "560229040"]
    ];
  
    bankDetails.forEach((detail, index) => {
      doc.text(detail[0], 10, currentY + 10 + index * 5);
      doc.text(detail[1], 60, currentY + 10 + index * 5);
    });
  
    // Update currentY for the next section
    currentY = doc.autoTable.previous.finalY + 10;
  
    // Add the tax details section
    doc.text("Total Amount Before Tax", 140, currentY);
    doc.text("25621", 190, currentY);
  
    doc.text("Add: CGST - 9%", 140, currentY + 10);
    doc.text("2305.89", 190, currentY + 10);
  
    doc.text("Add: SGST - 9%", 140, currentY + 20);
    doc.text("2305.89", 190, currentY + 20);
  
    doc.text("Add: IGST - 18%", 140, currentY + 30);
    doc.text("0", 190, currentY + 30);
  
    doc.text("Total Tax Amount (Round off)", 140, currentY + 40);
    doc.text("30232.78", 190, currentY + 40);
  
    doc.text("GST On Reverse Charge", 140, currentY + 50);
    doc.text("No", 190, currentY + 50);
  
    // Add the total in words
    doc.setFontSize(10);
    doc.text(
      "Invoice Amount in words: Thirty Thousand Two Hundred And Thirty Two Point Seventy Eight Rupees Only",
      10,
      currentY + 70
    );
  
    // Define third table headers and rows
    const thirdHeader = [
      ["SL NO", "Application ID", "Employee ID", "Case Received", "Candidate Full Name", "E1", "E2", "E3", "E4", "D", "C", "P", "I", "D", "A", "A", "C", "A", "Add Fee", "Pricing", "Report Date"]
    ];
  
    const thirdRow = [
      ["1", "GQ-INDV-649", "NA", "01-10-2024", "Anala V G Trinath Kumar", "N", "N", "N", "N", "N", "7", "7", "9", "9", "4", "0", "8", "10", "0", "8902", "08-10-2024"],
      ["2", "GQ-INDV-652", "NA", "04-10-2024", "Vijay Pathak", "2", "1", "3", "N", "N", "7", "8", "8", "0", "0", "0", "2", "21", "0", "6404", "21-10-2024"],
      ["3", "GQ-INDV-654", "NA", "07-10-2024", "Lokita Vijaykumar Thakrar", "N", "N", "N", "N", "N", "7", "9", "9", "0", "0", "N", "N", "16", "0", "702", "16-10-2024"],
      ["4", "GQ-INDV-657", "NA", "16-10-2024", "Vishnukant", "N", "N", "N", "N", "N", "5", "6", "6", "0", "0", "4", "16", "0", "1023", "16-10-2024"],
      ["5", "GQ-INDV-658", "NA", "16-10-2024", "Bayagaraj C", "N", "N", "N", "N", "N", "4", "4", "8", "8", "0", "0", "18", "18", "0", "8590", "18-10-2024"],
      ["Total", "", "", "", "", "2", "1", "3", "N", "N", "35", "35", "41", "4", "0", "0", "20", "16", "0", "11918", ""]
    ];
  
    // Draw the third table
    doc.autoTable({
      startY: currentY + 80, // Adjusting for spacing above this table
      head: thirdHeader,
      body: thirdRow,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
    });
  
    // Save the PDF
    doc.save("Invoice.pdf");
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
