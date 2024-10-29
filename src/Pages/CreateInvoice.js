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
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");
    const queryString = new URLSearchParams({
      customer_id: clientCode,
      admin_id: admin_id,
      _token: storedToken,
      month: formData.month,
      year: formData.year,
    }).toString();
    const requestOptions = {
      method: "GET",
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
        generatePdf();
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });
  };
  function getTotalAdditionalFeeByService(serviceId) {
    let totalFee = 0;
    for (const appGroup of applications) {
      for (const application of appGroup.applications) {
        // Sum up the additionalFee for the specified serviceId in each application's statusDetails
        for (const statusDetail of application.statusDetails) {
          if (statusDetail.serviceId === String(serviceId)) {
            const fee = parseFloat(statusDetail.additionalFee) || 0;
            totalFee += fee;
          }
        }
      }
    }
    return totalFee;
  }
  function calculatePercentage(amount, percentage) {
    return (amount * percentage) / 100;
  }
  function getServicePriceById(serviceId) {
    const service = serviceInfo.find(item => item.serviceId === serviceId);
    return service ? service.price : "NIL";
  }
  function getTotalAdditionalFee(id) {
    for (const appGroup of applications) {
      for (const application of appGroup.applications) {
        if (application.id === id) {
          // Calculate the total additionalFee for the matching application
          const totalAdditionalFee = application.statusDetails.reduce((total, statusDetail) => {
            const fee = parseFloat(statusDetail.additionalFee) || 0;
            return total + fee;
          }, 0);
          return totalAdditionalFee;
        }
      }
    }
    // If no application with the specified ID is found, return 0 or null
    return 0;
  }
  const generatePdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10; // Initial y-position for content alignment

    // Set Logo (Uncomment and update the path if you have a logo image)
    // const logoImg = 'path/to/your/logo.png';
 
    const logoImg = "https://i0.wp.com/goldquestglobal.in/wp-content/uploads/2024/03/goldquestglobal.png?w=771&ssl=1";
    const imgWidth = 50;
    const imgHeight = 20;
    doc.addImage(logoImg, 'PNG', 10, yPosition, imgWidth, imgHeight);
    
    const addressLines = companyInfo.address.split(',');
    // Add Company Information

    let formattedLine1 = '';
    let formattedLine2 = '';
    let formattedLine3 = '';

    // Loop through the address array
    for (let i = 0; i < addressLines.length; i++) {
      if (i === 0) {
        formattedLine1 += addressLines[i]; // First element
      } else if (i === 1) {
        formattedLine1 += `, ${addressLines[i]}`; // Second element
      } else if (i === 2) {
        formattedLine2 = addressLines[i]; // Third element
      } else if (i >= 4 && i <= 6) {
        // For Bangalore, Karnataka, and India
        if (i > 4) {
          formattedLine3 += `, `;
        }
        formattedLine3 += addressLines[i];
      } else if (i === 7) {
        formattedLine3 += `, ${addressLines[i]}`; // Pincode
      }
    }

    const companyInfoArray = [
      companyInfo.name,
      companyInfo.gstin,
      formattedLine1,
      formattedLine2,
      formattedLine3,
      "Website: http://www.goldquestglobal.in"
    ];

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Align text to the right of the logo
    companyInfoArray.forEach((line, index) => {
        doc.text(line, 10 + imgWidth + 10, yPosition + (index * 5)); // Positioned to the right of the logo
    });

    yPosition += imgHeight + 10;

    // Add a divider line
    doc.setLineWidth(0.5);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 5;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // BILL TO section
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 10, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(`Attention: ${customer.name}`, 10, yPosition + 5);
    doc.text(`Location: ${customer.address}`, 10, yPosition + 10);
    yPosition += 15;

    // Invoice Details section
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", 140, yPosition);
    doc.setFont("helvetica", "normal");
    const invoiceDetails = [
      ["GSTIN", `${customer.gst_number}`],
      ["State", `${customer.state}`],
      ["Invoice Date", new Date(formData.invoice_date).toLocaleDateString()],
      ["Invoice Number", `${formData.invoice_number}`],
      ["State Code", `${customer.state_code}`]
    ];
    let invoiceYPosition = yPosition + 5;
    invoiceDetails.forEach(([label, value]) => {
      doc.text(`${label}:`, 140, invoiceYPosition);
      doc.text(value, 180, invoiceYPosition);
      invoiceYPosition += 5;
    });

    // Draw line separator
    invoiceYPosition += 5;
    doc.line(10, invoiceYPosition, pageWidth - 10, invoiceYPosition);
    invoiceYPosition += 5;

    // Product Details Table
    const headers1 = [["Product Description", "SAC Code", "Qty", "Rate", "Additional Fee", "Taxable Amount"]];
    let overallServiceAdditionalFeeAmount = 0;
    const rows1 = serviceInfo.map(service => {
      const serviceAdditionalFee = getTotalAdditionalFeeByService(service.serviceId);
      overallServiceAdditionalFeeAmount += serviceAdditionalFee;
      return [
        service.serviceTitle,
        "998521",
        service.count.toString(),
        service.price.toString(),
        serviceAdditionalFee,
        (serviceAdditionalFee + service.totalCost).toString()
      ];
    });
    doc.autoTable({
      startY: invoiceYPosition + 5,
      head: headers1,
      body: rows1,
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.2 },
      theme: 'grid',
      margin: { top: 10, bottom: 10 },
      pageBreak: 'auto',
    });
    invoiceYPosition = doc.autoTable.previous.finalY + 10;

    // Bank Account and Tax Details section

    // doc.addPage('landscape');
    doc.setFont("helvetica", "bold");
    doc.text("GoldQuest Global Bank Account Details", 10, invoiceYPosition);
    doc.text("Tax Details", 140, invoiceYPosition);
    doc.setFont("helvetica", "normal");
    const bankDetails = [
      ["Bank Name", String(companyInfo.bank_name)],
      ["Bank A/C No", String(companyInfo.bank_account_number)],
      ["Bank Branch", String(companyInfo.bank_branch_name)],
      ["Bank IFSC/ NEFT/ RTGS", String(companyInfo.bank_ifsc)],
      ["MICR", String(companyInfo.bank_micr)]
    ];

    // Tax Details Calculation
    let newOverallServiceAmount = parseInt(overallServiceAmount) + parseInt(overallServiceAdditionalFeeAmount);
    const cgstTax = calculatePercentage(newOverallServiceAmount, parseInt(cgst.percentage));
    const sgstTax = calculatePercentage(newOverallServiceAmount, parseInt(sgst.percentage));
    const taxDetails = [
      { label: "Total Amount Before Tax", amount: String(newOverallServiceAmount) },
      { label: `Add: CGST - ${cgst.percentage}%`, amount: String(cgstTax) },
      { label: `Add: SGST - ${sgst.percentage}%`, amount: String(sgstTax) },
      { label: `Total Tax - ${parseInt(cgst.percentage) + parseInt(sgst.percentage)}%`, amount: String(cgstTax + sgstTax) },
      { label: "Total Tax Amount (Round off)", amount: String(newOverallServiceAmount + cgstTax + sgstTax) },
      { label: "GST On Reverse Charge", amount: "No" }
    ];

    bankDetails.forEach(([label, value], index) => {
      const rowY = invoiceYPosition + 10 + index * 5;
      doc.text(`${label}:`, 10, rowY);
      doc.text(value, 60, rowY);
      if (taxDetails[index]) {
        const taxDetail = taxDetails[index];
        doc.text(`${taxDetail.label}:`, 140, rowY);
        doc.text(taxDetail.amount, 190, rowY);
      }
    });

    invoiceYPosition += bankDetails.length * 5 + 20;

    // Total Amount in Words
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Amount in Words:", 10, invoiceYPosition);
    doc.setFont("helvetica", "normal");
    const words = wordify(parseInt(newOverallServiceAmount + cgstTax + sgstTax));
    doc.text(words+' Rupees Only', 10, invoiceYPosition + 5);

    // Application Details Table
    const serviceCodes = serviceNames.map(service => service.shortCode);
    let overAllAdditionalFee = 0;
    // doc.addPage('landscape');
    const headers3 = [
      ["SL NO", "Application ID", "Employee ID", "Case Received", "Candidate Full Name", ...serviceCodes, "Add Fee", "CGST", "SGST", "Pricing", "Report Date"]
    ];
    const rows3 = applications[0].applications.map((app, index) => {
      let totalCost = 0;
      const appAdditionalFee = getTotalAdditionalFee(app.id);
      overAllAdditionalFee += appAdditionalFee;
      const applicationRow = [
        index + 1,
        app.application_id,
        app.employee_id,
        app.created_at.split("T")[0],
        app.name,
        ...serviceNames.map(service => {
          if (!service || !service.id) {
            return "NIL";
          }
          const serviceExists = app.statusDetails.some(
            detail => detail.serviceId === service.id.toString()
          );
          if (serviceExists) {
            const colPrice = parseInt(getServicePriceById(service.id)) || 0;
            service.serviceIndexPrice = (service.serviceIndexPrice || 0) + colPrice;
            totalCost += colPrice;
            return colPrice;
          } else {
            return "NIL";
          }
        }),
        parseInt(appAdditionalFee) || 0,
      ];
      const appCGSTTax = calculatePercentage(parseInt(totalCost + appAdditionalFee), parseInt(cgst.percentage)) || 0;
      const appSGSTTax = calculatePercentage(parseInt(totalCost + appAdditionalFee), parseInt(sgst.percentage)) || 0;
      applicationRow.push(appCGSTTax, appSGSTTax, parseInt(totalCost + appCGSTTax + appSGSTTax + appAdditionalFee) || 0);
      applicationRow.push(app.report_date ? app.report_date.split("T")[0] : "");
      return applicationRow;
    });

    doc.autoTable({
      startY: invoiceYPosition + 10,
      head: headers3,
      body: rows3,
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      bodyStyles: { lineColor: [200, 200, 200], lineWidth: 0.2 },
      theme: 'grid',
      margin: { top: 10, bottom: 10 },
      // pageBreak: 'auto',
    });


    const footerText = [
      "Make all your payment Cheques, RTGS/NEFT Payable to: 'GOLDQUEST GLOBAL HR SERVICES PRIVATE LIMITED'.",
      "Payments received after due date shall be liable of interest @ 3% per month, part of month taken as full month.",
      "Any discrepancy shall be intimated within 3 working days of receipt of bill.",
      "Please email us at accounts@goldquestglobal.com / Contact Us: +91 9945891310"
  ];

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  let footerY = pageHeight - 30; // Position the footer near the bottom
  footerText.forEach((line, index) => {
      doc.text(line, 10, footerY + (index * 4));
  });

    // Finalize and Save PDF
    doc.save('invoice.pdf');
  }



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
