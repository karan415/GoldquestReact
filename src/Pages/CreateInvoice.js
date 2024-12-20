import React, { useEffect, useState } from 'react';
import { useData } from './DataContext';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import { useCustomFunction } from '../CustomFunctionsContext';

const CreateInvoice = () => {
  const wordify = useCustomFunction();
  const { listData, fetchData } = useData();
  const [clientCode, setClientCode] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: '',
    month: '',
    year: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const options = listData.map((client) => ({
    name: client.name + `(${client.client_unique_id})`,
    value: client.id,
  }));

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loader

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

    fetch(`https://octopus-app-www87.ondigitalocean.app/generate-invoice?${queryString}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "Network response was not ok");
          });
        }
        return response.json();
      })
      .then((data) => {
        // Check if 'data' is valid
        if (!data) {
          throw new Error("No data returned from API.");
        }

      
        let applications = [];
        if (data && Array.isArray(data.applications)) {
          applications = data.applications; 
        } else {
          applications = []; 
        }

        const serviceNames = data?.serviceNames || [];
        const customer = data?.customer || [];
        const companyInfo = data?.companyInfo || [];
        const {
          costInfo: { overallServiceAmount, cgst, sgst, totalTax, totalAmount } = {},
          serviceInfo = [],
        } = data?.finalArr || {};

        if (applications.length > 0) {
          generatePdf(
            serviceNames,
            customer,
            applications,
            companyInfo,
            overallServiceAmount,
            cgst,
            totalTax,
            totalAmount,
            serviceInfo,
            sgst
          );

          Swal.fire({
            title: "Success!",
            text: "PDF generated successfully.",
            icon: "success",
            confirmButtonText: "Ok",
          });
        } else {
          Swal.fire({
            title: 'No Application Found',
            text: 'There are no applications available to generate an invoice.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          
         }

      })
      .catch((error) => {
        Swal.fire({
          title: "Error!",
          text: error.message || "An error occurred while fetching the data.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      })
      .finally(() => {
        setIsLoading(false); // Hide loader
      });
  };






  function getTotalAdditionalFeeByService(serviceId, applications) {
    let totalFee = 0;

    // Check if applications is an array and contains elements
    if (Array.isArray(applications) && applications.length > 0) {
      for (const appGroup of applications) {
        if (appGroup.applications && Array.isArray(appGroup.applications)) {
          for (const application of appGroup.applications) {
            if (application.statusDetails && Array.isArray(application.statusDetails)) {
              for (const statusDetail of application.statusDetails) {
                if (statusDetail.serviceId === String(serviceId)) {
                  const fee = parseFloat(statusDetail.additionalFee) || 0;
                  totalFee += fee;
                }
              }
            }
          }
        }
      }
    }

    return totalFee;
  }

  function calculatePercentage(amount, percentage) {
    return (amount * percentage) / 100;
  }
  function getServicePriceById(serviceId, serviceInfo) {
    const service = serviceInfo.find(item => item.serviceId === serviceId);
    return service ? service.price : "NIL";
  }
  function getTotalAdditionalFee(id, applications) {
    for (const appGroup of applications) {
      for (const application of appGroup.applications) {
        if (application.id === id) {

          const totalAdditionalFee = application.statusDetails.reduce((total, statusDetail) => {
            const fee = parseFloat(statusDetail.additionalFee) || 0;
            return total + fee;
          }, 0);
          return totalAdditionalFee;
        }
      }
    }

    return 0;
  }

  function addFooter(doc) {

    const footerHeight = 15;
    const pageHeight = doc.internal.pageSize.height;
    const footerYPosition = pageHeight - footerHeight + 10;

    const pageWidth = doc.internal.pageSize.width;
    const centerX = pageWidth / 2;

    const pageCount = doc.internal.getNumberOfPages();
    const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
    const pageNumberText = `Page ${currentPage} / ${pageCount}`;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.text(pageNumberText, centerX, footerYPosition - 3, { align: 'center' });
  }

  const generatePdf = (serviceNames, customer, applications, companyInfo, overallServiceAmount, cgst, totalTax, totalAmount, serviceInfo, sgst) => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10; // Initial y-position for content alignment

    // Set Logo
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
    doc.setFont("helvetica", "normal");

    const rightMargin = 10;
    const logoWidthWithMargin = 10 + imgWidth + 10; // Distance from the left margin to the right side of the logo

    // Align text to the right of the logo
    companyInfoArray.forEach((line, index) => {
      if (line.includes("Website:")) {
        doc.setTextColor(0, 0, 255);
        doc.text(line, pageWidth - rightMargin, yPosition + (index * 5), { align: 'right' }); // Positioned to the right of the logo
        doc.setTextColor(0, 0, 0);  // RGB color for black
      } else {
        doc.text(line, pageWidth - rightMargin, yPosition + (index * 5), { align: 'right' }); // Positioned to the right of the logo
      }
    });
    addFooter(doc)
    yPosition += imgHeight + 20;

    // Add a divider line
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 3;

    doc.setLineWidth(0.3);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 5;
    // Set section width for both BILL TO and Invoice Details
    const sectionWidth = pageWidth * 0.8; // Total width for the content (60% of the page width)
    const sectionLeftMargin = (pageWidth - sectionWidth) / 2; // Center the 60% section horizontally
    const columnWidth = sectionWidth / 2; // Divide into two equal columns

    // BILL TO Section (Left column)
    const billToXPosition = sectionLeftMargin; // Start at the left margin of the section
    const billToYPosition = yPosition; // Start at the top

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", billToXPosition, billToYPosition); // Left-aligned in the first column
    doc.setFont("helvetica", "normal");
    doc.text(`Attention: ${customer.name}`, billToXPosition, billToYPosition + 10);
    doc.text(`Location: ${customer.address}`, billToXPosition, billToYPosition + 15);

    // Calculate the end position of the BILL TO section
    const billToEndYPosition = billToYPosition + 25; // Adjust based on the content height

    // Invoice Details Section (Right column, starts after BILL TO content ends)
    const invoiceDetailsXPosition = billToXPosition + columnWidth; // Start at the middle of the section
    let invoiceYPosition = billToEndYPosition - 20; // Add spacing between BILL TO and Invoice Details

    const invoiceDetails = [
      ["GSTIN", `${customer.gst_number}`],
      ["State", `${customer.state}`],
      ["Invoice Date", new Date(formData.invoice_date).toLocaleDateString()],
      ["Invoice Number", `${formData.invoice_number}`],
      ["State Code", `${customer.state_code}`]
    ];

    // Add Invoice Details justified within the second column
    const labelXPosition = invoiceDetailsXPosition + 50; // Start at the right column margin
    const valueXPosition = invoiceDetailsXPosition + 90; // Add spacing between label and value
    const cellHeight = 6; // Height of each cell

    invoiceDetails.forEach(([label, value]) => {
      // Draw the label
      doc.text(`${label}:`, labelXPosition, invoiceYPosition);

      // Draw the value and add a border around it
      doc.text(value, valueXPosition, invoiceYPosition);
      doc.rect(valueXPosition - 2, invoiceYPosition - cellHeight + 2, 30, cellHeight); // Adjust width as needed

      invoiceYPosition += cellHeight; // Move down for the next line
    });

    invoiceYPosition += 5;


    addFooter(doc)
    const headers1 = [["Product Description", "SAC Code", "Qty", "Rate", "Additional Fee", "Taxable Amount"]];
    let overallServiceAdditionalFeeAmount = 0;
    const rows1 = serviceInfo.map(service => {
      const serviceAdditionalFee = getTotalAdditionalFeeByService(service.serviceId, applications);
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

    const tableWidth = doc.internal.pageSize.width * 0.8; // Set the width to 60% of page width
    const leftMargin = (doc.internal.pageSize.width - tableWidth) / 2; // Center the table horizontally

    doc.autoTable({
      startY: invoiceYPosition + 5,
      head: headers1,
      body: rows1,
      styles: { fontSize: 9, halign: 'center' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.4 },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.4, textColor: [0, 0, 0], },
      theme: 'grid',
      textColor: [0, 0, 0],
      margin: { top: 10, bottom: 10, left: leftMargin, right: leftMargin },
      pageBreak: 'auto',
    });
    addFooter(doc)
    // Adjust the bank details and tax details layout within the 80% width of the page
    const pageWidths = doc.internal.pageSize.width;
    const tableWidths = pageWidths * 0.8; // 80% of the page width (adjusted for better fit)

    // Set the initial Y position for the invoice
    invoiceYPosition = doc.autoTable.previous.finalY + 20;

    // Set font for title
    doc.setFont("helvetica", "bold");
    doc.setDrawColor(0, 0, 0); // Set line color to black (RGB: 0, 0, 0)
    doc.setLineWidth(0.5);

    // Draw a border around the title text
    const titleX = 29.5;
    const titleY = invoiceYPosition - 10; // Adjust slightly above to center the title
    const titleWidth = 119; // Add some padding to width
    const titleHeight = 10; // Height of the border around the title
    doc.rect(titleX, titleY - 1, titleWidth, titleHeight); // Draw a border around the title

    // Add the title text inside the border
    doc.text("GoldQuest Global Bank Account Details", titleX + 2, titleY + 5); // Adjusted for proper vertical centering

    // Switch to normal font for the rest of the text
    doc.setFont("helvetica", "normal");

    const bankDetails = [
      ["Bank Name", String(companyInfo.bank_name)],
      ["Bank A/C No", String(companyInfo.bank_account_number)],
      ["Bank Branch", String(companyInfo.bank_branch_name)],
      ["Bank IFSC/ NEFT/ RTGS", String(companyInfo.bank_ifsc)],
      ["MICR", String(companyInfo.bank_micr)],
    ];

    // Adjust the bank details layout to fit 80% width
    const bankDetailsLeftX = (pageWidths - tableWidths) / 2; // Left X position of the bank details table
    const taxDetailsRightX = bankDetailsLeftX + tableWidths / 2; // Right X position of the tax details table

    // Bank Details Table - Left Column (Label)
    const bankLabelColumnWidth = tableWidths / 4; // Half of the total table width for labels
    const bankValueColumnWidth = tableWidths / 4; // Half of the total table width for values

    // Position for bank details (centered on page)
    const startY = invoiceYPosition - 1; // Starting position after the title
    const rowHeight = 6;

    // Draw the bank details table with justified content
    for (let i = 0; i < bankDetails.length; i++) {
      const label = bankDetails[i][0];
      const value = bankDetails[i][1];

      doc.rect(bankDetailsLeftX, startY + i * rowHeight, bankLabelColumnWidth, rowHeight); // Label cell
      doc.rect(bankDetailsLeftX + bankLabelColumnWidth, startY + i * rowHeight, bankValueColumnWidth, rowHeight); // Value cell

      // Justify the text within the cells
      doc.text(label, bankDetailsLeftX + 6, startY + i * rowHeight + 4); // Label text
      doc.text(value, bankDetailsLeftX + bankLabelColumnWidth + 2, startY + i * rowHeight + 4); // Value text
    }

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

    // Adjust tax details layout to match the 80% width
    const taxLabelColumnWidth = tableWidths / 4; // Half for label column
    const taxValueColumnWidth = tableWidths / 4.5; // Half for value column

    const taxStartY = startY - 10; // Keep the tax details in the same row as the bank details
    addFooter(doc)
    // Draw tax details table with justified content
    for (let i = 0; i < taxDetails.length; i++) {
      const taxDetail = taxDetails[i];
      const label = taxDetail.label;
      const amount = taxDetail.amount;

      const taxLabelX = taxDetailsRightX + 10; // Ensure tax details are placed after the bank details (adjusted)
      const taxAmountX = taxLabelX + taxLabelColumnWidth - 2; // Position for tax amount column

      // Make specific labels bold
      if (label === "Total Amount Before Tax" || label === "Total Tax Amount (Round off)") {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }

      // Draw border for the amount cell
      doc.rect(taxAmountX, taxStartY + i * rowHeight, taxValueColumnWidth, rowHeight);

      // Justify text in the label column and center-align the value
      doc.text(label, taxLabelX + 2, taxStartY + i * rowHeight + 4); // Label text

      const textWidth = doc.getTextWidth(amount);
      const centerX = taxAmountX + (taxValueColumnWidth - textWidth) / 2; // Center-align amount text
      doc.text(amount, centerX, taxStartY + i * rowHeight + 5); // Center-aligned value text

      doc.setFont("helvetica", "normal");
    }
    // Update Y position for the "Invoice Amount in Words" section
    invoiceYPosition = startY + taxDetails.length * rowHeight + 4; // Ensure the final Y position is updated
    addFooter(doc)
    // Total Amount in Words
    // Set font for the label
    doc.setFont("helvetica", "bold");

    // Calculate the width of the label text to position it correctly
    const labelWidth = doc.getTextWidth("Invoice Amount in Words:");

    // Left position of the text box for "Invoice Amount in Words"
    const pageWidthHere = doc.internal.pageSize.width;
    const contentWidth = pageWidthHere * 0.8; // 80% of the page width
    const leftX = (pageWidthHere - contentWidth) / 2; // Center the content

    // Draw a border around the area where the label and amount will appear
    doc.setDrawColor(0, 0, 0); // Set border color to black
    doc.setLineWidth(0.5); // Set border thickness
    doc.rect(leftX, invoiceYPosition - 3, contentWidth, 12); // Draw border (width: 80% of page, height: fixed)

    // Add label with padding (4 units) to avoid overlap with the border
    doc.text("Invoice Amount in Words:", leftX + 4, invoiceYPosition + 5); // 4 units padding from the left

    // Amount in words
    doc.setFont("helvetica", "normal");
    const words = wordify(parseInt(newOverallServiceAmount + cgstTax + sgstTax));

    // Calculate the position for the amount text
    const wordsWidth = doc.getTextWidth(words + ' Rupees Only');
    const wordsXPosition = leftX + labelWidth + 16; // Position it after the label with extra padding

    // Center the amount text within the remaining width of the border
    const centerX = leftX + (contentWidth - labelWidth - wordsWidth + 2) / 2; // Center-align amount text

    // Place the amount in words centered within the border
    doc.text(words + ' Rupees Only', centerX, invoiceYPosition + 5); // Adjusted Y position for the text


    // Application Details Table
    doc.addPage();
    const serviceCodes = serviceNames.map(service => service.shortCode);
    let overAllAdditionalFee = 0;
    // doc.addPage('landscape');
    const annexureText = "Annexure";
    const annexureFontSize = 12; // Font size for Annexure text
    const annexureBorderColor = [0, 0, 0]; // Blue color for the border

    // Calculate the horizontal center of the page
    const annexureTextWidth = doc.getTextWidth(annexureText);
    const annexureXPosition = (pageWidth - annexureTextWidth) / 2;

    // Set Y position for the Annexure text
    const annexureYPosition = 20; // Adjust based on the spacing required

    // Draw the text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(annexureFontSize);
    doc.setTextColor(0, 0, 0); // Black text color
    doc.text(annexureText, annexureXPosition, annexureYPosition, { align: 'center' });

    // Draw the blue border below the Annexure text
    const borderMargin = 30; // Margin from left and right
    const borderYPosition = annexureYPosition + 2; // Slightly below the text
    doc.setLineWidth(0.5);
    doc.setDrawColor(...annexureBorderColor);
    doc.line(borderMargin, borderYPosition, pageWidth - borderMargin, borderYPosition);


    const headers3 = [
      ["SL NO", "Application ID", "Employee ID", "Case Received", "Candidate Full Name", ...serviceCodes, "Add Fee", "CGST", "SGST", "Pricing", "Report Date"]
    ];
    const rows3 = (applications[0]?.applications?.length > 0)
      ? applications[0].applications.map((app, index) => {
        let totalCost = 0;
        const appAdditionalFee = getTotalAdditionalFee(app.id, applications);
        overAllAdditionalFee += appAdditionalFee;

        const applicationRow = [
          index + 1,
          app.application_id,
          app.employee_id,
          // Safely check if app.created_at is defined before calling .split()
          app.created_at ? app.created_at.split("T")[0] : "N/A",  // Use "N/A" or some default value
          app.name,
          ...serviceNames.map(service => {
            if (!service || !service.id) {
              return "NIL";
            }
            const serviceExists = app.statusDetails.some(
              detail => detail.serviceId === service.id.toString()
            );
            if (serviceExists) {
              const colPrice = parseInt(getServicePriceById(service.id, serviceInfo)) || 0;
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

        // Safely check if app.report_date exists before calling .split()
        applicationRow.push(app.report_date ? app.report_date.split("T")[0] : "");  // Use empty string if report_date is not defined

        return applicationRow;
      })
      : [];


    const tableWidthNew = doc.internal.pageSize.width * 0.8; // Set the width to 60% of page width
    const leftMarginNew = (doc.internal.pageSize.width - tableWidthNew) / 2; // Center the table horizontally

    doc.autoTable({
      startY: annexureYPosition + 10, // Adjust position to avoid overlapping with the Annexure text and border
      head: headers3,
      body: rows3,
      styles: { fontSize: 8, halign: 'center', cellWidth: 'auto' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.5, textColor: [0, 0, 0] },
      theme: 'grid',
      margin: { top: 10, bottom: 10, left: leftMarginNew, right: leftMarginNew },
      x: 0, // Starting position at the left edge
    });

    addFooter(doc)

    addNotesPage(doc)

    addFooter(doc)
    // Finalize and Save PDF
    doc.save('invoice.pdf');
  }
  function addNotesPage(doc) {
    doc.addPage();

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const leftMargin = 10;
    const rightMargin = 10;

    const boxYPosition = 20;
    const boxHeight = 30;
    const boxWidth = pageWidth - leftMargin - rightMargin;

    doc.setLineWidth(0.5);
    doc.rect(leftMargin, boxYPosition, boxWidth, boxHeight);


    const headerText = "SPECIAL NOTES, TERMS AND CONDITIONS";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(headerText, pageWidth / 2, boxYPosition + 6, { align: 'center' });


    const notesText = `
Make all your payment Cheques, RTGS/NEFT Payable to: "GOLDQUEST GLOBAL HR SERVICES PRIVATE LIMITED". Payment to be made as per the terms of Agreement. Payments received after the due date shall be liable for interest @ 3% per month, part of month taken as full month. Any discrepancy shall be intimated within 3 working days of receipt of bill. Please email us at accounts@goldquestglobal.com or Contact Us: +91 8754562623.
    `;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(notesText, leftMargin + 2, boxYPosition + 12, { maxWidth: boxWidth - 4 });


    const thankYouText = "[ Thank you for your patronage ]";
    const thankYouYPosition = boxYPosition + boxHeight + 20;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(thankYouText, pageWidth / 2, thankYouYPosition, { align: 'center' });


    const signatureYPosition = pageHeight - 50;
    const signatureImageWidth = 50;
    const signatureImageHeight = 20;


    const signatureBase64 = "https://www.shutterstock.com/image-vector/handwritten-signature-signed-papers-documents-260nw-2248268539.jpg" // Example base64 string (replace with your actual string)


    doc.addImage(signatureBase64, 'PNG', pageWidth / 2 - signatureImageWidth / 2, signatureYPosition - signatureImageHeight, signatureImageWidth, signatureImageHeight);


    const signatureLineYPosition = signatureYPosition + signatureImageHeight;
    doc.line(pageWidth / 2 - 40, signatureLineYPosition, pageWidth / 2 + 40, signatureLineYPosition);

    const signatureText = "Authorised Signatory";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(signatureText, pageWidth / 2, signatureLineYPosition + 10, { align: 'center' });


    const digitalSignatureText = "Digitally signed by\nJayakumar Velu\nDate: 2024.12.02 09:54:28 +05:30";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(digitalSignatureText, pageWidth - rightMargin - 60, signatureLineYPosition - 10, { align: 'left' });


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
              placeholder="Choose client code"
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
            <label htmlFor="moinv" className="block mb-2">Month & Year:</label>
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
            <button
              type="submit"
              className="p-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-blue-400 disabled:bg-gray-400"
              disabled={isLoading} // Button is disabled while loading
            >
              {isLoading ? "Please Wait Your PDF is Generating..." : "Submit"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
