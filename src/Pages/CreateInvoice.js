import React, { useEffect, useState } from 'react';
import { useData } from './DataContext';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css'
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useCustomFunction } from '../CustomFunctionsContext'


const CreateInvoice = () => {
  const wordify = useCustomFunction();
  const { listData, fetchData } = useData();
  const [clientCode, setClientCode] = useState('');
  const [serviceNames, setServiceNames] = useState([]);
  const [serviceInfo, setServiceInfo] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companyInfo, setCompanyInfo] = useState([]);
  const [overallServiceAmount, setOverallServiceAmount] = useState([]);
  const [cgst, setCgst] = useState([]);
  const [sgst, setSgst] = useState([]);
  const [totalTax, setTotalTax] = useState([]);
  const [totalAmount, setTotalAmount] = useState([]);

  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: '',
    month: '',
    year: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev, [name]: value
    }))
  }

  const options = listData.map(client => ({
    name: client.name + `(${client.client_unique_id})`,
    value: client.id,
  }));
  console.log('listData', listData)
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");

    // Construct the query string with parameters
    const queryString = new URLSearchParams({
      customer_id: clientCode,
      admin_id: admin_id,
      _token: storedToken,
    }).toString();

    const requestOptions = {
      method: "GET", // Use GET method
      redirect: "follow",
    };

    fetch(`https://goldquestreact.onrender.com/generate-invoice?${queryString}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((dataRaw) => {
        const data = JSON.parse(dataRaw);
        setServiceNames(data.serviceNames);

        setCustomer(data.customer);
        setApplications(data.applications);
        setCompanyInfo(data.companyInfo);
        setOverallServiceAmount(data.finalArr.costInfo.overallServiceAmount);
        setCgst(data.finalArr.costInfo.cgst);
        setSgst(data.finalArr.costInfo.sgst);
        setTotalTax(data.finalArr.costInfo.totalTax);
        setTotalAmount(data.finalArr.costInfo.totalAmount);
        setServiceInfo(data.finalArr.serviceInfo);

        generatePdf(); // Call generatePdf only after successful response
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });

    console.log('Form Data:'); // This should be logged only if you have actual form data to log
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
    doc.text(`Attention: ${customer.name}`, 10, 30);
    doc.text(`Location:${customer.address} `, 10, 35);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", 140, 25);
    doc.setFont("helvetica", "normal");
    const invoiceDetails = [
      ["GSTIN", `${customer.gst_number}`],
      ["State", `${customer.state}`],
      ["Invoice Date", new Date(formData.invoice_date).toLocaleDateString()],
      ["Invoice Number", `${formData.invoice_number}`],
      ["State Code", `${customer.state_code}`]
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
    console.log(serviceInfo);
    // Map serviceInfo to the desired format
    const rows1 = serviceInfo.map(service => [
      service.serviceTitle,     // Service Title
      "998521",                 // Static value (can be changed)
      service.count.toString(), // Count (converted to string)
      service.price.toString(),                   // Static value (can be changed)
      "0",                      // Static value (can be changed)
      service.totalCost.toString() // Total Cost (converted to string)
    ]);

    // Generate the table
    doc.autoTable({
      startY: yPosition + 5, // Start table below the divider
      head: headers1,
      body: rows1,
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
      ["Bank Name", String(companyInfo.bank_name)], // Ensure these are strings
      ["Bank A/C No", String(companyInfo.bank_account_number)],
      ["Bank Branch", String(companyInfo.bank_branch_name)],
      ["Bank IFSC/ NEFT/ RTGS", String(companyInfo.bank_ifsc)], // Corrected spelling
      ["MICR", String(companyInfo.bank_micr)]
    ];

    const taxDetails = [
      { label: "Total Amount Before Tax", amount: String(overallServiceAmount) },
      { label: `Add: CGST - ${cgst.percentage}%`, amount: String(cgst.tax) },
      { label: `Add: SGST - ${sgst.percentage}%`, amount: String(sgst.tax) },
      {
        label: `Total Tax - ${parseInt(cgst.percentage) + parseInt(sgst.percentage)}%`,
        amount: String(totalTax)
      },
      { label: "Total Tax Amount (Round off)", amount: String(totalAmount) },
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


    function getServicePriceById(serviceId) {
      const service = serviceInfo.find(item => item.serviceId === serviceId);
      return service ? service.price : "NIL";
    }


    const formattedTotalAmount = parseInt(totalAmount);
    const words = wordify(formattedTotalAmount);
    console.log('words', words)
    doc.text(words, 10, yPosition + 5);
    // Third Table
    const serviceCodes = serviceNames.map(service => service.shortCode);
    // Create the headers for the table
    const headers3 = [
      ["SL NO", "Application ID", "Employee ID", "Case Received", "Candidate Full Name", ...serviceCodes, "Add Fee", "Pricing", "Report Date"]
    ];
    const rows3 = applications[0].applications.map((app, index) => {
      let totalCost = 0;

      const applicationRow = [
        index + 1, // SL NO
        app.application_id, // Application ID
        app.employee_id, // Employee ID
        app.created_at.split("T")[0], // Case Received (formatted)
        app.name,
        ...serviceNames.map(service => {
          if (!service || !service.id) {
            return "NIL";
          }

          // Check if the serviceId exists in the application's statusDetails
          const serviceExists = app.statusDetails.some(
            detail => detail.serviceId === service.id.toString()
          );

          if (serviceExists) {
            const colPrice = getServicePriceById(service.id);

            // Update the serviceIndexPrice, summing it with colPrice for each occurrence
            if (service.serviceIndexPrice) {
              service.serviceIndexPrice += colPrice;
            } else {
              service.serviceIndexPrice = colPrice;
            }

            // Increment the total cost by colPrice
            totalCost += colPrice;
            return colPrice;
          } else {
            return "NIL";
          }
        }),
        "0", // Other fields as needed
        totalCost,
        app.report_date ? app.report_date.split("T")[0] : "" // Report Date (formatted)
      ];

      return applicationRow;
    });

    const serviceCodePrices = serviceNames.map(service => service.serviceIndexPrice);
    const overAllTotalCost = serviceCodePrices.reduce((acc, price) => acc + price, 0);
    const totalRow = [
      { content: "Total", colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
      ...serviceCodePrices,
      "0",
      overAllTotalCost,
      ""
    ];
    rows3.push(totalRow);

    console.log(`serviceNames - `, serviceNames);
    // Example of how to use the autoTable method
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
            <label htmlFor="invoice_number" className="block mb-2">Invoice Number:</label>
            <input
              type="text"
              name="invoice_number"
              id="invoice_number"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={formData.invoice_number}
              onChange={handleChange}
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
              value={formData.invoice_date}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="moinv" className="block mb-2">Month:</label>
            <select
              id="month"
              name="month"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={formData.month}
              onChange={handleChange}
            >
              <option value="">--Select Month--</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              id="year"
              name="year"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={formData.year}
              onChange={handleChange}
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
