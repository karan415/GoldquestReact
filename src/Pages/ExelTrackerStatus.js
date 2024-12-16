import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useApi } from '../ApiContext';
import PulseLoader from 'react-spinners/PulseLoader'; // Import the PulseLoader
import { useSidebar } from '../Sidebar/SidebarContext';
import { BranchContextExel } from './BranchContextExel';

import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const AdminChekin = () => {
    const tableRef = useRef(null); // Create a reference for the table

    const { handleTabChange } = useSidebar();
    const [options, setOptions] = useState([]);
    const [servicesDataInfo, setServicesDataInfo] = useState('');
    const [expandedRow, setExpandedRow] = useState({ index: '', headingsAndStatuses: [] });
    const navigate = useNavigate();
    const location = useLocation();
    const [itemsPerPage, setItemPerPage] = useState(10)
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [adminTAT, setAdminTAT] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const [reportData, setReportData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_URL = useApi();
    const { branch_id } = useContext(BranchContextExel);

    const queryParams = new URLSearchParams(location.search);
    const clientId = queryParams.get('clientId');
    const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
    const token = localStorage.getItem('_token');

    // Fetch data from the main API
    const fetchData = useCallback(() => {
        if (!branch_id || !adminId || !token) {
            return;
        }
        else {
            setLoading(true);
        }
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        fetch(`${API_URL}/client-master-tracker/applications-by-branch?branch_id=${branch_id}&admin_id=${adminId}&_token=${token}`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                setLoading(false);
                setData(result.data.customers || []);
                setOptions(result.data.filterOptions);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
            }).finally(() => {
                setLoading(false);
            });

    }, [branch_id, adminId, token, setData]);

    const fetchAdminList = useCallback(() => {
        setLoading(true);
        const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
        const token = localStorage.getItem('_token');

        const requestOptions = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: "follow"
        };

        fetch(`${API_URL}/client-master-tracker/list?admin_id=${adminId}&_token=${token}`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                const newToken = result.token || result._token || '';
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
                const tat_days = result.customers.map(spoc => spoc.tat_days);
                setAdminTAT(tat_days);  // Store the tat_days in state
            })
            .catch((error) => console.error(error)).finally(() => {
                setLoading(false);
            });
    }, []);
    const goBack = () => {
        handleTabChange('client_master');
    }

    useEffect(() => {
        fetchAdminList();
    }, [fetchAdminList]);

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };


    const filteredItems = data.filter(item => {
        return (
            item.application_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });



    const filteredOptions = filteredItems.filter(item =>
        item.status.toLowerCase().includes(selectedStatus.toLowerCase())
    );


    const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOptions.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showPrev = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const showNext = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };


    const renderPagination = () => {
        const pageNumbers = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                if (!pageNumbers.includes(i)) {
                    pageNumbers.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }


            if (!pageNumbers.includes(totalPages)) {
                pageNumbers.push(totalPages);
            }
        }



        return pageNumbers.map((number, index) => (
            number === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
            ) : (
                <button
                    type="button"
                    key={`page-${number}`} // Unique key for page buttons
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-1 rounded-0 ${currentPage === number ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
                >
                    {number}
                </button>
            )
        ));
    };

    const fetchServicesData = async (applicationId, servicesList) => {
        const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
        const token = localStorage.getItem("_token");

        // Return an empty array if servicesList is empty or undefined
        if (!servicesList || servicesList.length === 0) {
            return [];
        }

        try {
            // Construct the URL with service IDs
            const url = `${API_URL}/client-master-tracker/services-annexure-data?service_ids=${encodeURIComponent(servicesList)}&application_id=${encodeURIComponent(applicationId)}&admin_id=${encodeURIComponent(adminId)}&_token=${encodeURIComponent(token)}`;

            // Perform the fetch request
            const response = await fetch(url, { method: "GET", redirect: "follow" });

            if (response.ok) {
                const result = await response.json();

                // Update the token if a new one is provided
                const newToken = result.token || result._token || "";
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }

                // Filter out null or invalid items
                const filteredResults = result.results.filter((item) => item != null);
                return filteredResults;
            } else {
                console.error("Failed to fetch service data:", response.statusText);
                return [];
            }
        } catch (error) {
            console.error("Error fetching service data:", error);
            return [];
        }
    };

    function addFooter(doc) {
        // Define the height of the footer and its position
        const footerHeight = 15; // Footer height
        const pageHeight = doc.internal.pageSize.height; // Get the total page height
        const footerYPosition = pageHeight - footerHeight + 10; // Position footer closer to the bottom

        // Define page width and margins
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10; // Margins on the left and right

        // Space between sections (adjust dynamically based on page width)
        const availableWidth = pageWidth - 2 * margin; // Usable width excluding margins
        const centerX = pageWidth / 2; // Center of the page

        // Insert text into the center column (centered)
        const footerText = "No 293/154/172, 4th Floor, Outer Ring Road, Kadubeesanahalli, Marathahalli, Bangalore-560103 | www.goldquestglobal.in";
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0); // Set text color to black (RGB: 0, 0, 0)
        doc.setFontSize(7);
        doc.text(footerText, centerX, footerYPosition - 3, { align: 'center' }); // Adjusted vertical position

        // Insert page number into the right column (right-aligned)
        const pageCount = doc.internal.getNumberOfPages(); // Get total number of pages
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber; // Get current page number
        const pageNumberText = `Page ${currentPage} / ${pageCount}`;
        const pageNumberWidth = doc.getTextWidth(pageNumberText); // Calculate text width

        // Right-align page number with respect to the page width
        const pageNumberX = pageWidth - margin - pageNumberWidth;
        doc.text(pageNumberText, pageNumberX, footerYPosition - 3); // Adjusted vertical position

        // Draw a line above the footer
        doc.setLineWidth(0.3);
        doc.setDrawColor(0, 0, 0); // Set line color to black (RGB: 0, 0, 0)
        doc.line(margin, footerYPosition - 7, pageWidth - margin, footerYPosition - 7); // Line above the footer
    }


    async function checkImageExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok; // Returns true if HTTP status is 200-299
        } catch (error) {
            console.error(`Error checking image existence at ${url}:`, error);
            return false;
        }
    }

    // Helper function to load and validate the image
    async function validateImage(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Image fetch failed for URL: ${url}`);
                return null;
            }

            const blob = await response.blob();
            const img = new Image();
            img.src = URL.createObjectURL(blob);

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            return img; // Return the validated image
        } catch (error) {
            console.error(`Error validating image from ${url}:`, error);
            return null;
        }
    }
    const getImageFormat = (url) => {
        const ext = url.split('.').pop().toLowerCase();
        if (ext === 'png') return 'PNG';
        if (ext === 'jpg' || ext === 'jpeg') return 'JPEG';
        if (ext === 'webp') return 'WEBP';
        return 'PNG'; // Default to PNG if not recognized
    };

    // Image load function with promise
    function loadImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Error loading image: ' + imageUrl));
            img.src = imageUrl;
        });
    }

    // Function to scale the image
    function scaleImage(img, maxWidth, maxHeight) {
        const imgWidth = img.width;
        const imgHeight = img.height;

        let width = imgWidth;
        let height = imgHeight;

        // Scale image to fit within maxWidth and maxHeight
        if (imgWidth > maxWidth) {
            width = maxWidth;
            height = (imgHeight * maxWidth) / imgWidth;
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = (imgWidth * maxHeight) / imgHeight;
        }

        return { width, height };
    }
    const generatePDF = async (index) => {
        const applicationInfo = data[index];

        const servicesData = await fetchServicesData(applicationInfo.main_id, applicationInfo.services);
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 10;
        const backgroundColor = '#f5f5f5';

        doc.addImage("https://i0.wp.com/goldquestglobal.in/wp-content/uploads/2024/03/goldquestglobal.png?w=771&ssl=1", 'PNG', 10, yPosition, 50, 20);

        const rightImageX = pageWidth - 10 - 50; // Page width minus margin (10) and image width (50)
        doc.addImage("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjDtQL92lFVchI1eVL0Gpb7xrNnkqW1J7c1A&s", 'PNG', rightImageX, yPosition, 50, 30);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        doc.text("CONFIDENTIAL BACKGROUND VERIFICATION REPORT", 105, 40, { align: 'center' });

        // First Table
        const firstTableData = [
            [
                { content: 'Name of the Candidate', styles: { cellWidth: 'auto', fontStyle: 'bold' } },
                { content: applicationInfo?.name || 'N/A' },
                { content: 'Client Name', styles: { cellWidth: 'auto', fontStyle: 'bold' } },
                { content: applicationInfo[0]?.client_name || 'N/A' },
            ],
            [
                { content: 'Application ID', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.application_id || 'N/A' },
                { content: 'Report Status', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.report_status || 'N/A' },
            ],
            [
                { content: 'Date of Birth', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.dob ? new Date(applicationInfo.dob).toLocaleDateString() : 'N/A' },
                { content: 'Application Received', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.updated_at ? new Date(applicationInfo.updated_at).toLocaleDateString() : 'N/A' },
            ],
            [
                { content: 'Candidate Employee ID', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.employee_id || 'N/A' },
                { content: 'Insuff Cleared/Reopened', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.application_id || 'N/A' },
            ],
            [
                { content: 'Report Type', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.report_type || 'N/A' },
                { content: 'Final Report Date', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.report_date ? new Date(applicationInfo.report_date).toLocaleDateString() : 'N/A' },
            ],
            [
                { content: 'Verification Purpose', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.overall_status || 'N/A' },
                { content: 'Overall Report Status', styles: { fontStyle: 'bold' } },
                { content: applicationInfo?.status || 'N/A' },
            ],
        ];


        doc.autoTable({
            head: [], // Remove the header by setting it to an empty array
            body: firstTableData,
            styles: {
                cellPadding: 3,
                fontSize: 10,
                valign: 'middle',
                lineColor: [62, 118, 165],
                lineWidth: 0.4,     // Reduced border width (you can adjust this value further)
                textColor: '#000',  // Set text color to black (#000)
            },
            headStyles: {
                fillColor: [255, 255, 255], // Ensure no background color for header
                textColor: 0,               // Optional: Ensure header text color is reset (not needed if header is removed)
                lineColor: [62, 118, 165],
                lineWidth: 0.2,             // Reduced border width for header (if header is re-enabled)
            },
            theme: 'grid',
            margin: { top: 50 },
        });

        addFooter(doc);
        const secondTableData = servicesData.map(item => {
            const sourceKey = item.annexureData
                ? Object.keys(item.annexureData).find(key => key.startsWith('info_source') || key.startsWith('information_source'))
                : undefined;
            const dateKey = item.annexureData && Object.keys(item.annexureData).find(key => key.includes('verified_date'));

            return {
                component: item.heading || 'NIL',
                source: sourceKey ? item.annexureData[sourceKey] : 'NIL',
                completedDate: dateKey && item.annexureData[dateKey] && !isNaN(new Date(item.annexureData[dateKey]).getTime())
                    ? new Date(item.annexureData[dateKey]).toLocaleDateString()
                    : 'NIL',
                status: item.annexureData && item.annexureData.status ? item.annexureData.status.replace(/[_-]/g, ' ') : 'NIL',
            };
        });

        // Generate the Second Table
        doc.autoTable({
            head: [
                [
                    { content: 'REPORT COMPONENT', styles: { halign: 'center', fillColor: "#6495ed", lineColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                    { content: 'INFORMATION SOURCE', styles: { halign: 'center', fillColor: "#6495ed", lineColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                    { content: 'COMPLETED DATE', styles: { halign: 'center', fillColor: "#6495ed", lineColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                    { content: 'COMPONENT STATUS', styles: { halign: 'center', fillColor: "#6495ed", lineColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' } },
                ]
            ],
            body: secondTableData.map(row => [
                row.component,
                row.source,
                row.completedDate, // Show completedDate in its own column
                row.status, // Show status in its own column
            ]),
            styles: {
                cellPadding: 3,
                fontSize: 10,
                valign: 'middle',
                lineWidth: 0.3,
                lineColor: "#6495ed",
            },
            theme: 'grid',
            headStyles: {
                lineWidth: 0.4, // No border for the header
                fillColor: [61, 117, 166], // Color for the header background
                textColor: [0, 0, 0], // Text color for the header
                fontStyle: 'bold',
            },
            bodyStyles: {
                lineWidth: 0.5, // Border for the body rows
                lineColor: [61, 117, 166], // Border color for the body
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'center' },
                2: { halign: 'center' }, // Center alignment for the completed date column
                3: { halign: 'center' }, // Center alignment for the status column
            },
        });


        addFooter(doc);

        const tableStartX = 15; // Adjusted X position for full-width table
        const tableStartY = doc.previousAutoTable.finalY + 20; // Y position of the table
        const totalTableWidth = pageWidth - 2 * tableStartX; // Total table width
        const legendColumnWidth = 15; // Smaller width for the "Legend" column
        const remainingTableWidth = totalTableWidth - legendColumnWidth; // Remaining space for other columns
        const columnCount = 5; // Number of remaining columns
        const otherColumnWidth = remainingTableWidth / columnCount; // Width of each remaining column
        const tableHeight = 12; // Reduced height of the table
        const boxWidth = 5; // Width of the color box
        const boxHeight = 9; // Height of the color box
        const textBoxGap = 1; // Gap between text and box

        // Data for the columns
        const columns = [
            { label: "Legend:", color: null, description: "" },
            { label: "", color: "#FF0000", description: "-Major discrepancy" },
            { label: "", color: "#FFFF00", description: "-Minor discrepancy" },
            { label: "", color: "#FFA500", description: "-Unable to verify" },
            { label: "", color: "#FFC0CB", description: "-Pending from source" },
            { label: "", color: "#008000", description: "-All clear" },
        ];

        // Set the border color
        doc.setDrawColor("#3e76a5");

        // Draw table border
        doc.setLineWidth(0.5);
        doc.rect(tableStartX, tableStartY, totalTableWidth, tableHeight);

        // Draw columns
        columns.forEach((col, index) => {
            const columnStartX =
                index === 0
                    ? tableStartX // "Legend" column starts at tableStartX
                    : tableStartX + legendColumnWidth + (index - 1) * otherColumnWidth; // Remaining columns start after the "Legend" column

            const columnWidth = index === 0 ? legendColumnWidth : otherColumnWidth;

            // Draw column separators
            if (index > 0) {
                doc.line(columnStartX, tableStartY, columnStartX, tableStartY + tableHeight);
            }

            // Add label text (for Legend)
            if (col.label) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7); // Reduced font size for better fit
                doc.text(
                    col.label,
                    columnStartX + 3, // Padding for text inside "Legend" column
                    tableStartY + tableHeight / 2 + 2,
                    { baseline: "middle" }
                );
            }

            // Add color box
            if (col.color) {
                const boxX = columnStartX + 3; // Adjusted padding for color box
                const boxY = tableStartY + tableHeight / 2 - boxHeight / 2;
                doc.setFillColor(col.color);
                doc.rect(boxX, boxY, boxWidth, boxHeight, "F");
            }

            // Add description text
            if (col.description) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7); // Reduced font size for better fit
                const textX = columnStartX + 3 + boxWidth + textBoxGap;
                const textY = tableStartY + tableHeight / 2 + 2;
                doc.text(col.description, textX, textY, { baseline: "middle" });
            }
        });


        // Add title at the top
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("End of summary report", pageWidth / 2, doc.previousAutoTable.finalY + 10, { align: "center" });

        addFooter(doc);


        yPosition = 20; // Initialize yPosition for the first page
        let annexureIndex = 1;
        for (const service of servicesData) {
            // Add a new page for each service
            doc.addPage();
            addFooter(doc);

            let yPosition = 20; // Reset yPosition to the top margin

            const reportFormJson = JSON.parse(service.reportFormJson.json);
            const rows = reportFormJson.rows || [];
            const serviceData = [];
            console.log('rows', rows);

            rows.forEach((row) => {
                console.log("Processing row:", row); // Log the current row being processed

                // Use the first input label as the row label or set to an empty string if not available
                const inputLabel = row.inputs.length > 0 ? row.inputs[0].label || "Unnamed Label" : "Unnamed Label";
                console.log("Input label:", inputLabel); // Log the input label

                const valuesObj = {}; // Object to store the input values
                console.log("Initializing valuesObj:", valuesObj);

                row.inputs.forEach((input) => {
                    const inputName = input.name;
                    console.log("Processing input:", input);
                
                    // Adjust report details name generation to match your data's structure
                    let reportDetailsInputName = inputName.includes("report_details_") ? inputName : `report_details_${inputName}`;
                    console.log("Generated reportDetailsInputName:", reportDetailsInputName);
                
                    // Clean up input labels by removing colons
                    if (input.label && typeof input.label === "string") {
                        input.label = input.label.replace(/:/g, "");
                    }
                    console.log("Cleaned label:", input.label);
                
                    // Check if `service.annexureData` exists before trying to access it
                    if (service.annexureData) {
                        // Fetch value and reportdetails value from service.annexureData with null checks
                        const value = service.annexureData[inputName] !== undefined && service.annexureData[inputName] !== null
                            ? service.annexureData[inputName] 
                            : ""; // Fallback to empty string if not present
                
                        const reportDetailsValue = service.annexureData[reportDetailsInputName] !== undefined && service.annexureData[reportDetailsInputName] !== null
                            ? service.annexureData[reportDetailsInputName] 
                            : ""; // Fallback to empty string if not present
                
                        console.log("Fetched value:", value, "Fetched reportDetailsValue:", reportDetailsValue);
                
                        // Dynamically set isReportDetailsExist based on whether reportDetailsValue exists
                        valuesObj[inputName] = value;
                        valuesObj["isReportDetailsExist"] = !!reportDetailsValue; // Set isReportDetailsExist to true if reportDetailsValue exists
                        if (reportDetailsValue) {
                            valuesObj[reportDetailsInputName] = reportDetailsValue; // Store reportdetails value if present
                        }
                
                        console.log("Updated valuesObj:", valuesObj);
                
                        // Store the simplified name for later use
                        valuesObj["name"] = inputName.replace("report_details_", ""); // Clean up name for further use
                        console.log("Simplified name stored:", valuesObj["name"]);
                    } else {
                        // If `service.annexureData` is missing, log an error and continue
                        console.error("service.annexureData is not available for input:", inputName);
                        valuesObj[inputName] = ""; // Fallback to empty value if data is not available
                        valuesObj["isReportDetailsExist"] = false; // No report details exist if data is missing
                        valuesObj[reportDetailsInputName] = ""; // Ensure that reportDetailsValue is also empty
                        console.log("service.annexureData is missing, using fallback values:", valuesObj);
                    }
                });
                

                // Add processed row to serviceData after all inputs are processed
                serviceData.push({
                    label: inputLabel,
                    values: valuesObj,
                });
            });




            const tableData = serviceData
                .map((data) => {
                    console.log("Processing data for table:", data);

                    if (!data || !data.values) {
                        console.log("Skipping invalid data (empty values).");
                        return null; // Skip empty or invalid data
                    }

                    const name = data.values.name;
                    console.log("Processing name:", name);

                    if (!name || name.startsWith("annexure")) {
                        console.log("Skipping annexure data for name:", name);
                        return null; // Skip annexure-related rows
                    }

                    const isReportDetailsExist = data.values.isReportDetailsExist;
                    const value = data.values[name];
                    const reportDetails = data.values[`report_details_${name}`];

                    console.log("isReportDetailsExist:", isReportDetailsExist, "value:", value, "reportDetails:", reportDetails);

                    if (value === undefined || value === "" || (isReportDetailsExist && !reportDetails)) {
                        console.log("Skipping data due to missing value or report details.");
                        return null;
                    }

                    if (isReportDetailsExist && reportDetails) {
                        console.log("Row with reportDetails:", [data.label, value, reportDetails]);
                        return [data.label, value, reportDetails]; // Include reportdetails value if it exists
                    } else {
                        console.log("Row without reportDetails:", [data.label, value]);
                        return [data.label, value]; // Only value if no reportdetails status
                    }
                })
                .filter(Boolean); // Remove any null entries

            console.log("Final tableData:", tableData);

            const pageWidth = doc.internal.pageSize.width;

            // Add heading
            const headingText = reportFormJson.heading.toUpperCase();
            const backgroundColor = "#f5f5f5";
            const backgroundColorHeading = "#6495ed";
            const borderColor = "#6495ed";
            const xsPosition = 10;
            const rectHeight = 10;

            doc.setFillColor(backgroundColorHeading);
            doc.setDrawColor(borderColor);
            doc.rect(xsPosition, yPosition, pageWidth - 20, rectHeight, "FD");

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");

            const textHeight = doc.getTextDimensions(headingText).h;
            const verticalCenter = yPosition + rectHeight / 2 + textHeight / 4;

            doc.setTextColor("#fff"); // Set the text color to white
            doc.text(headingText, pageWidth / 2, verticalCenter, { align: "center" });

            yPosition += rectHeight; // Adjust yPosition

            // Add table
            doc.autoTable({
                head: [
                    [
                        { content: "PARTICULARS", styles: { halign: "left" } },
                        "APPLICATION DETAILS",
                        "REPORT DETAILS",
                    ],
                ],
                body: tableData.map((row) => {
                    if (row.length === 2) {
                        return [
                            { content: row[0], styles: { halign: "left", fontStyle: 'bold' } },
                            { content: row[1], colSpan: 2, styles: { halign: "left" } },
                        ];
                    } else {
                        return [
                            { content: row[0], styles: { halign: "left", fontStyle: 'bold' } },
                            { content: row[1], styles: { halign: "left" } },
                            { content: row[2], styles: { halign: "left" } },
                        ];
                    }
                }),
                startY: yPosition,
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    lineWidth: 0.3,
                    lineColor: [62, 118, 165],
                },
                theme: "grid",
                headStyles: {
                    fillColor: backgroundColor,
                    textColor: [0, 0, 0],
                    halign: "center",
                    fontSize: 10,
                },
                bodyStyles: {
                    textColor: [0, 0, 0],
                    halign: "left",
                },
                tableLineColor: [62, 118, 165],
                tableLineWidth: 0.5,
                margin: { horizontal: 10 },
            });
            addFooter(doc);

            yPosition = doc.lastAutoTable.finalY + 5;

            // Add Remarks
            const remarksData = serviceData.find((data) => data.label === "Remarks");
            if (remarksData) {
                const remarks = service.annexureData[remarksData.values.name] || "No remarks available.";
                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Remarks: ${remarks}`, 10, yPosition);
                yPosition += 7;
            }

            // Handle annexure images
            const annexureImagesKey = Object.keys(service.annexureData).find((key) =>
                key.toLowerCase().startsWith("annexure") && !key.includes("[") && !key.includes("]")
            );

            if (annexureImagesKey) {
                const annexureImagesStr = service.annexureData[annexureImagesKey];
                const annexureImagesSplitArr = annexureImagesStr ? annexureImagesStr.split(",") : [];

                if (annexureImagesSplitArr.length === 0) {
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(10);
                    doc.setTextColor(150, 150, 150);
                    doc.text("No annexure images available.", 10, yPosition);
                    yPosition += 10;
                } else {
                    for (const [index, imageUrl] of annexureImagesSplitArr.entries()) {
                        const imageUrlFull = `https://goldquestreact.onrender.com/${imageUrl.trim()}`;
                        const imageFormat = getImageFormat(imageUrlFull);

                        if (!(await checkImageExists(imageUrlFull))) continue;

                        const img = await validateImage(imageUrlFull);
                        if (!img) continue;

                        try {
                            const { width, height } = scaleImage(img, doc.internal.pageSize.width - 20, 80);
                            if (yPosition + height > doc.internal.pageSize.height - 20) {
                                doc.addPage();
                                yPosition = 10;
                            }

                            // Ensure yPosition is adjusted before adding the annexure index text
                            const annexureText = `Annexure ${annexureIndex} (${String.fromCharCode(97 + index)})`;
                            const textWidth = doc.getTextWidth(annexureText);
                            const centerX = (doc.internal.pageSize.width - textWidth) / 2;

                            // Add some vertical padding before annexure text
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(10);
                            doc.setTextColor(0, 0, 0);
                            doc.text(annexureText, centerX, yPosition + 10);  // Added padding
                            yPosition += 15;

                            const centerXImage = (doc.internal.pageSize.width - width) / 2;
                            doc.addImage(img.src, imageFormat, centerXImage, yPosition, width, height);
                            yPosition += height + 15;

                        } catch (error) {
                            console.error(`Failed to add image to PDF: ${imageUrlFull}`, error);
                        }
                    }
                }
            } else {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text("No annexure images available.", 10, yPosition);
                yPosition += 15;

            }

            addFooter(doc);
            annexureIndex++;
            yPosition += 20;
        }

        // Add disclaimer after all services
        doc.addPage();
        addFooter(doc);

        // Define Disclaimer Button Dimensions
        const disclaimerButtonHeight = 10; // Button height (without padding)
        const disclaimerButtonWidth = doc.internal.pageSize.width - 20; // Full width minus margins

        // Constants for additional spacing
        const buttonBottomPadding = 5; // Padding below the button
        const disclaimerTextTopMargin = 5; // Margin from top of the disclaimer text

        // Adjusted Disclaimer Button Height (includes padding)
        const adjustedDisclaimerButtonHeight = disclaimerButtonHeight + buttonBottomPadding;

        // Define Disclaimer Text
        const disclaimerTextPart1 = `This report is confidential and is meant for the exclusive use of the Client. This report has been prepared solely for the purpose set out pursuant to our letter of engagement (LoE)/Agreement signed with you and is not to be used for any other purpose. The Client recognizes that we are not the source of the data gathered and our reports are based on the information provided. The Client is responsible for employment decisions based on the information provided in this report.You can mail us at `;
        const anchorText = "compliance@screeningstar.com";
        const disclaimerTextPart2 = " for any clarifications.";

        // Dynamically calculate disclaimer text height
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // Set text color to #000 (black)
        const disclaimerLinesPart1 = doc.splitTextToSize(disclaimerTextPart1, disclaimerButtonWidth);
        const disclaimerLinesPart2 = doc.splitTextToSize(disclaimerTextPart2, disclaimerButtonWidth);

        // Adjusted Y position for disclaimer text
        const lineHeight = 7; // Increased line height for better readability
        const disclaimerTextHeight =
            disclaimerLinesPart1.length * lineHeight +
            disclaimerLinesPart2.length * lineHeight +
            lineHeight; // Include space for anchor

        // Calculate total space required for the disclaimer (button + text)
        const totalContentHeight = adjustedDisclaimerButtonHeight + disclaimerTextHeight + disclaimerTextTopMargin;

        // Calculate the available space from top to bottom
        const availableSpace = doc.internal.pageSize.height - 40; // Total page height minus some margin

        // Calculate the starting position for the content to be centered vertically based on previous content
        let disclaimerY = 20; // Start from the top of the page (you can adjust this if you want more margin)

        if (disclaimerY + totalContentHeight > availableSpace) {
            // Add new page if the content does not fit
            doc.addPage();
            addFooter(doc);
            disclaimerY = 20; // Start from the top of the new page if space is insufficient
        }

        // Define the X position of the disclaimer button after calculating the page width
        const disclaimerButtonXPosition = (doc.internal.pageSize.width - disclaimerButtonWidth) / 2; // Centering horizontally

        // Log values to debug
        console.log("disclaimerButtonXPosition:", disclaimerButtonXPosition);
        console.log("disclaimerY:", disclaimerY);
        console.log("disclaimerButtonWidth:", disclaimerButtonWidth);
        console.log("disclaimerButtonHeight:", disclaimerButtonHeight);

        // Ensure values are valid before calling rect
        if (disclaimerButtonWidth > 0 && disclaimerButtonHeight > 0 && !isNaN(disclaimerButtonXPosition) && !isNaN(disclaimerY)) {
            doc.setDrawColor(62, 118, 165); // Set border color
            doc.setFillColor(backgroundColor); // Set fill color
            doc.rect(disclaimerButtonXPosition, disclaimerY, disclaimerButtonWidth, disclaimerButtonHeight, 'F'); // Fill the rectangle
            doc.rect(disclaimerButtonXPosition, disclaimerY, disclaimerButtonWidth, disclaimerButtonHeight, 'D'); // Draw the border
        } else {
            console.error('Invalid rectangle dimensions:', disclaimerButtonXPosition, disclaimerY, disclaimerButtonWidth, disclaimerButtonHeight);
        }

        doc.setTextColor(0, 0, 0); // Set text color to black
        doc.setFont("helvetica", "bold");

        // Center the 'DISCLAIMER' text inside the button both horizontally and vertically
        const disclaimerButtonTextWidth = doc.getTextWidth('DISCLAIMER'); // Width of the button text
        const buttonTextHeight = doc.getFontSize(); // Height of the text (font size)

        // Horizontal centering of text inside the button
        const disclaimerTextXPosition =
            disclaimerButtonXPosition + disclaimerButtonWidth / 2 - disclaimerButtonTextWidth / 2 - 1;
        // Vertical centering of text inside the button
        const disclaimerTextYPosition = disclaimerY + disclaimerButtonHeight / 2 + buttonTextHeight / 4 - 1;

        // Add 'DISCLAIMER' text to the button, centered both horizontally and vertically
        doc.text('DISCLAIMER', disclaimerTextXPosition, disclaimerTextYPosition);

        // Draw Disclaimer Text (Split parts)
        let currentY = disclaimerY + adjustedDisclaimerButtonHeight + disclaimerTextTopMargin;

        // Draw Part 1 of the Disclaimer (Black Text)
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        disclaimerLinesPart1.forEach((line) => {
            doc.text(line, 10, currentY);
            currentY += lineHeight;
        });

        // Add Anchor Text (Blue and Clickable)
        doc.setTextColor(0, 0, 255);
        doc.textWithLink(anchorText, 10 + doc.getTextWidth(disclaimerLinesPart1[disclaimerLinesPart1.length - 1]), currentY - lineHeight, {
            url: "mailto:compliance@screeningstar.com",
        });

        // Draw Part 2 of the Disclaimer (Black Text)
        doc.setTextColor(0, 0, 0);
        disclaimerLinesPart2.forEach((line) => {
            doc.text(line, 10, currentY);
            currentY += lineHeight;
        });

        // Place "END OF DETAIL REPORT" button immediately after the disclaimer text
        let endOfDetailY = currentY + disclaimerTextTopMargin - 5;

        // Add new page if "END OF DETAIL REPORT" button doesn't fit
        if (endOfDetailY + disclaimerButtonHeight > doc.internal.pageSize.height - 20) {
            doc.addPage();
            endOfDetailY = 20; // Start from the top of the new page
        }

        // Draw "END OF DETAIL REPORT" Button (centered horizontally)
        const endButtonXPosition = (doc.internal.pageSize.width - disclaimerButtonWidth) / 2; // Centering horizontally

        // Ensure values are valid before calling rect
        if (disclaimerButtonWidth > 0 && disclaimerButtonHeight > 0 && !isNaN(endButtonXPosition) && !isNaN(endOfDetailY)) {
            doc.setDrawColor(62, 118, 165);
            doc.setFillColor(backgroundColor);
            doc.rect(endButtonXPosition, endOfDetailY, disclaimerButtonWidth, disclaimerButtonHeight, 'F');
            doc.rect(endButtonXPosition, endOfDetailY, disclaimerButtonWidth, disclaimerButtonHeight, 'D');
        } else {
            console.error('Invalid rectangle dimensions for END OF DETAIL REPORT button:', endButtonXPosition, endOfDetailY, disclaimerButtonWidth, disclaimerButtonHeight);
        }

        doc.setTextColor(0, 0, 0); // Set text color to black for the button text
        doc.setFont("helvetica", "bold");

        const endButtonTextWidth = doc.getTextWidth('END OF DETAIL REPORT'); // Width of the button text
        const endButtonTextHeight = doc.getFontSize(); // Height of the text (font size)

        const endButtonTextXPosition =
            endButtonXPosition + disclaimerButtonWidth / 2 - endButtonTextWidth / 2 - 1;
        const endButtonTextYPosition = endOfDetailY + disclaimerButtonHeight / 2 + endButtonTextHeight / 4 - 1;

        doc.text('END OF DETAIL REPORT', endButtonTextXPosition, endButtonTextYPosition);

        addFooter(doc);

        doc.save('report.pdf');
    };





    useEffect(() => {
        fetchData();
    }, [clientId, branch_id]);
    useEffect(() => {
        fetchAdminList();
    }, [fetchAdminList]);


    const handleViewMore = async (index) => {
        // If the clicked row is already expanded, collapse it and scroll to the table
        if (expandedRow && expandedRow.index === index) {
            tableRef.current?.scrollIntoView({
                behavior: 'smooth', // Smooth scrolling
                block: 'start', // Scroll to the top of the table
            });
            setExpandedRow(null); // Collapse the row by setting it to null
            return;
        }
        tableRef.current?.scrollIntoView({
            behavior: 'smooth', // Smooth scrolling
            block: 'start', // Scroll to the top of the table
        });
        // Fetch data for the selected application
        const applicationInfo = data[index];

        try {
            const servicesData = await fetchServicesData(applicationInfo.main_id, applicationInfo.services);
            const headingsAndStatuses = [];

            // Process each service data
            servicesData.forEach(service => {
                const heading = JSON.parse(service.reportFormJson.json).heading;
                if (heading && service.annexureData) {
                    let status = service.annexureData.status;

                    // If status is null or an empty string, set it to 'N/A'
                    if (!status) {
                        status = "N/A";
                    }
                    // If the length of the status is less than 4, sanitize it
                    else if (status.length < 4) {
                        status = status.replace(/[^a-zA-Z0-9\s]/g, " ").toUpperCase() || 'N/A'; // Remove special chars and make uppercase
                    }
                    // If the length of the status is 4 or more but less than 6, format it
                    else {
                        status = status.replace(/[^a-zA-Z0-9\s]/g, " ") // Remove special chars
                            .toLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase()) || 'N/A'; // Capitalize first letter of each word
                    }

                    // Push the heading and formatted status into the array
                    headingsAndStatuses.push({ heading, status });
                }
            });

            // Set the expanded row with fetched data
            setExpandedRow({
                index: index,
                headingsAndStatuses: headingsAndStatuses,
            });

        } catch (error) {
            // Handle errors in fetching or processing the services data
            console.error('Error fetching or processing service data:', error);
        }
    };



    const handleSelectChange = (e) => {

        const selectedValue = e.target.value;
        setItemPerPage(selectedValue)
    }



    const handleUpload = (applicationId, branchid) => {
        navigate(`/candidate?applicationId=${applicationId}&branchid=${branchid}`);
    };

    function sanitizeText(text) {
        if (!text) return text;
        return text.replace(/_[^\w\s]/gi, ''); // Removes all non-alphanumeric characters except spaces.
    }

    const Loader = () => (
        <div className="flex w-full justify-center items-center h-20">
            <div className="loader border-t-4 border-[#2c81ba] rounded-full w-10 h-10 animate-spin"></div>
        </div>
    );
    return (
        <div className="bg-[#c1dff2]">
            <div className="space-y-4 py-[30px] px-[51px] bg-white">

                <div className='flex gap-4 justify-end p-4'>
                    <select id="" name='status' onChange={handleStatusChange} className='outline-none border-2 p-2 rounded-md w-5/12 my-4 md:my-0' >
                        {options.map((item, index) => {
                            return item.status !== 'closed' ? (
                                <option key={index} value={item.status}>
                                    {item.status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - {item.count}
                                </option>
                            ) : null;
                        })}


                    </select>
                </div>
                <div className="overflow-x-auto  mx-4 bg-white shadow-md rounded-md">
                    <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
                        <div className="col">
                            <form action="">
                                <div className="flex gap-5 justify-between">
                                    <select name="options" id="" onChange={handleSelectChange} className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
                                        <option value="10">10 Rows</option>
                                        <option value="20">20 Rows</option>
                                        <option value="50">50 Rows</option>
                                        <option value="100">100 Rows</option>
                                        <option value="200">200 Rows</option>
                                        <option value="300">300 Rows</option>
                                        <option value="400">400 Rows</option>
                                        <option value="500">500 Rows</option>
                                    </select>
                                    <button className="bg-green-600 text-white py-3 px-8 rounded-md capitalize" type='button'>exel</button>
                                    <button onClick={goBack} className="bg-green-500 mx-2 whitespace-nowrap hover:bg-green-400 text-white rounded-md p-3">Go Back</button>

                                </div>
                            </form>
                        </div>
                        <div className="col md:flex justify-end ">
                            <form action="">
                                <div className="flex md:items-stretch items-center  gap-3">
                                    <input
                                        type="search"
                                        className='outline-none border-2 p-2 rounded-md w-full my-4 md:my-0'
                                        placeholder='Search by Client Code, Company Name, or Client Spoc'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button className='bg-green-500 p-3 rounded-md text-whitevhover:bg-green-200 text-white'>Serach</button>
                                </div>
                            </form>
                        </div>

                    </div>

                </div>
                <div className="overflow-x-auto py-6 px-4">
                    {loading ? (
                        <div className='flex justify-center items-center py-6 h-full'>
                            <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />

                        </div>
                    ) : currentItems.length > 0 ? (
                        <table className="min-w-full border-collapse border overflow-scroll rounded-lg whitespace-nowrap">
                            <thead className='rounded-lg'>
                                <tr className="bg-green-500 text-white">
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">SL NO</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">TAT Days</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Location</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Name</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Reference Id</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Photo</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Applicant Employe Id</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Initiation Date</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Deadline Date</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Report Data</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Download Status</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">View More</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Overall Status</th>

                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (

                                    <tr>
                                        <td colSpan={17} className="py-4 text-center text-gray-500">
                                            <Loader className="text-center" />
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {currentItems.map((data, index) => (
                                            <React.Fragment key={data.id}>
                                                <tr className="text-center">
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{index + 1}</td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{adminTAT || 'NIL'}</td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{data.location || 'NIL'}</td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{data.name || 'NIL'}</td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{data.application_id || 'NIL'}</td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                        <img src={`${API_URL}/${data.photo}`} alt={data.name} className="w-10 h-10 rounded-full" />
                                                    </td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{data.employee_id || 'NIL'}</td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{new Date(data.created_at).toLocaleDateString()}</td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{new Date(data.updated_at).toLocaleDateString()}</td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                        <button
                                                            className="bg-white border border-[#073d88] text-[#073d88] px-4 py-2 rounded hover:bg-[#073d88] hover:text-white"
                                                            onClick={() => handleUpload(data.id, data.branch_id)}
                                                        >
                                                            Generate Report
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                        <button
                                                            onClick={() => generatePDF(index)}
                                                            className="bg-green-500 uppercase border border-white hover:border-green-500 text-white px-4 py-2 rounded hover:bg-white hover:text-green-500"
                                                        >
                                                            {data.overall_status || 'WIP'}
                                                        </button>
                                                    </td>
                                                    <td className="border px-4  py-2" >
                                                        <button
                                                            className="bg-orange-500 uppercase border border-white hover:border-orange-500 text-white px-4 py-2 rounded hover:bg-white hover:text-orange-500"
                                                            onClick={() => handleViewMore(index)}
                                                        >
                                                            {expandedRow && expandedRow.index === index ? ' Less' : 'View '}
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{data.overall_status || 'WIP'}</td>

                                                </tr>

                                                {expandedRow && expandedRow.index === index && (
                                                    <>
                                                        <tr>
                                                            <td colSpan="100%" className="text-center p-4 bg-gray-100">
                                                                {/* Table structure to display headings in the first column and statuses in the second column */}
                                                                <div ref={tableRef} className="relative w-full max-w-full overflow-hidden">
                                                                    <table className="w-full table-auto">
                                                                        <tbody className='h-[160px] overflow-y-auto block'>
                                                                            {/* Loop through headings and statuses, displaying heading in the first column and status in the second */}
                                                                            {expandedRow.headingsAndStatuses &&
                                                                                expandedRow.headingsAndStatuses.map((item, idx) => (
                                                                                    <tr key={`row-${idx}`}>
                                                                                        <td className="text-left p-2 border border-black capitalize bg-gray-200">
                                                                                            {sanitizeText(item.heading)}
                                                                                        </td>
                                                                                        <td className="text-left p-2 border border-black capitalize">
                                                                                            {sanitizeText(item.status)}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))
                                                                            }
                                                                            <tr>
                                                                                <th className="text-left p-2 border border-black uppercase bg-gray-200">Report Type</th>
                                                                                <td className="text-left p-2 border border-black capitalize">{data.report_type || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th className="text-left p-2 border border-black uppercase bg-gray-200">Report Date</th>
                                                                                <td className="text-left p-2 border border-black capitalize">
                                                                                    {data.report_date ? new Date(data.report_date).toLocaleDateString('en-US', {
                                                                                        year: 'numeric',
                                                                                        month: 'long',
                                                                                        day: 'numeric'
                                                                                    }) : 'N/A'}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th className="text-left p-2 border border-black uppercase bg-gray-200">Report Generated By</th>
                                                                                <td className="text-left p-2 border border-black capitalize">{data.report_generated_by_name || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th className="text-left p-2 border border-black uppercase bg-gray-200">QC Done By</th>
                                                                                <td className="text-left p-2 border border-black capitalize">{data.qc_done_by_name || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">First Level Insuff</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{sanitizeText(data.first_insufficiency_marks) || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">First Level Insuff Date</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{sanitizeText(data.first_insuff_date) || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">First Level Insuff Reopen Date</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{sanitizeText(data.first_insuff_reopened_date) || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">Second Level Insuff</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{sanitizeText(data.second_insufficiency_marks) || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">Second Level Insuff Date</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{data.second_insuff_date ? sanitizeText(new Date(data.second_insuff_date).toLocaleDateString()) : 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">Third Level Insuff Marks</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{sanitizeText(data.third_insufficiency_marks) || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">Third Level Insuff Date</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{data.third_insuff_date ? sanitizeText(new Date(data.third_insuff_date).toLocaleDateString()) : 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">Third Level Insuff Reopen Date</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{sanitizeText(data.third_insuff_reopened_date) || 'N/A'}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="text-left p-2 border border-black uppercase bg-gray-200">Reason For Delay</td>
                                                                                <td className="text-left p-2 border border-black capitalize">{sanitizeText(data.delay_reason) || 'N/A'}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                            </td>
                                                        </tr>
                                                    </>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-6">
                            <p>No Data Found</p>
                        </div>
                    )}

                    <div className="flex items-center justify-end  rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
                        <button
                            onClick={showPrev}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            aria-label="Previous page"
                        >
                            <MdArrowBackIosNew />
                        </button>
                        <div className="flex items-center">
                            {renderPagination()}
                        </div>
                        <button
                            onClick={showNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            aria-label="Next page"
                        >
                            <MdArrowForwardIos />
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );

};

export default AdminChekin;
