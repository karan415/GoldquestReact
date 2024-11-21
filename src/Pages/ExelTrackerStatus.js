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
    console.log('data', data)

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
                setData(result.customers || []);

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


    const fetchSelectOptions = useCallback(() => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        fetch(`${API_URL}/client-master-tracker/branch-filter-options?branch_id=${branch_id}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((result) => {
                setOptions(result.filterOptions);
                const newToken = result._token || result.token;
                if (newToken) localStorage.setItem("_token", newToken);
            })
            .catch((error) => console.error('Error fetching options:', error));
    }, []);


    useEffect(() => {
        fetchSelectOptions();
    }, [fetchSelectOptions])



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


    const generatePDF = async (index) => {
        const applicationInfo = data[index];
        console.log('applicationInfo', applicationInfo)

        const servicesData = await fetchServicesData(applicationInfo.main_id, applicationInfo.services);
        console.log('servicesData', servicesData)
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 10;
        const backgroundColor = '#ccc'
        // const pageHeight = doc.internal.pageSize.getHeight();

        doc.addImage("https://i0.wp.com/goldquestglobal.in/wp-content/uploads/2024/03/goldquestglobal.png?w=771&ssl=1", 'PNG', 10, 10, 50, 20);

        // Title
        doc.setFontSize(20); // Reduced font size
        doc.text("CONFIDENTIAL BACKGROUND VERIFICATION REPORT", 105, 40, { align: 'center' });

        // First Table
        const firstTableData = [
            [
                { content: 'Name of the Candidate', styles: { cellWidth: 'auto' } },
                { content: applicationInfo?.name || 'N/A' },
                { content: 'Client Name' },
                { content: applicationInfo[0]?.client_name || 'N/A' },
            ],
            [
                { content: 'Application ID' },
                { content: applicationInfo?.application_id || 'N/A' },
                { content: 'Report Status' },
                { content: applicationInfo?.report_status || 'N/A' },
            ],
            [
                { content: 'Date of Birth' },
                { content: applicationInfo?.dob ? new Date(applicationInfo.dob).toLocaleDateString() : 'N/A' },
                { content: 'Application Received' },
                { content: applicationInfo?.updated_at ? new Date(applicationInfo.updated_at).toLocaleDateString() : 'N/A' },
            ],
            [
                { content: 'Candidate Employee ID' },
                { content: applicationInfo?.employee_id || 'N/A' },
                { content: 'Insuff Cleared/Reopened' },
                { content: applicationInfo?.application_id || 'N/A' },
            ],
            [
                { content: 'Report Type' },
                { content: applicationInfo?.report_type || 'N/A' },
                { content: 'Final Report Date' },
                { content: applicationInfo?.report_date ? new Date(applicationInfo.report_date).toLocaleDateString() : 'N/A' },
            ],
            [
                { content: 'Verification Purpose' },
                { content: applicationInfo?.overall_status || 'N/A' },
                { content: 'Overall Report Status' },
                { content: applicationInfo?.status || 'N/A' },
            ],
        ];

        doc.autoTable({
            head: [['', '', '', '']],
            body: firstTableData,
            styles: { cellPadding: 3, fontSize: 12, valign: 'middle' }, // Reduced font size
            theme: 'grid',
            margin: { top: 50 },
        });

        const secondTableHeaders = [
            { title: 'Report Components', dataKey: 'component' },
            { title: 'Information Source', dataKey: 'source' },
            { title: 'Completed Date', dataKey: 'completedDate' },
            { title: 'Verification Status', dataKey: 'status' },
        ];

        const secondTableData = servicesData.map(item => {
            console.log(`item - `, item);
            // Dynamically find keys for 'source' and 'completedDate'
            const sourceKey = Object.keys(item.annexureData).find(key => key.startsWith('info_source') || key.startsWith('information_source'));
            const dateKey = Object.keys(item.annexureData).find(key => key.includes('verified_date'));
            console.log(sourceKey, dateKey);
            const logData = {
                component: item.heading || 'NIL',
                source: sourceKey ? item.annexureData[sourceKey] : 'NIL',
                completedDate: dateKey && item.annexureData[dateKey] && !isNaN(new Date(item.annexureData[dateKey]).getTime())
                    ? new Date(item.annexureData[dateKey]).toLocaleDateString()
                    : 'NIL',
                status: item.annexureData.status ? item.annexureData.status.replace(/[_-]/g, ' ') : 'NIL',
            };

            return logData;
        });

        doc.autoTable({
            head: [secondTableHeaders.map(header => header.title)],
            body: secondTableData.map(row => [
                row.component,
                row.source,
                row.completedDate,
                row.status,
            ]),
            styles: { cellPadding: 3, fontSize: 12, valign: 'middle' },
            theme: 'grid',
            margin: { top: 20 },
        });



        doc.autoTable({
            head: [
                [
                    { content: "COLOR CODE / ADJUDICATION MATRIX", colSpan: 5, styles: { halign: 'center', fontStyle: 'bold', fillColor: [246, 246, 246] } }
                ],
                [
                    { content: 'MAJOR DISCREPANCY', styles: { halign: 'center', cellWidth: 'wrap', minCellWidth: 10 } },
                    { content: 'MINOR DISCREPANCY', styles: { halign: 'center', cellWidth: 'wrap', minCellWidth: 10 } },
                    { content: 'UNABLE TO VERIFY', styles: { halign: 'center', cellWidth: 'wrap', minCellWidth: 10 } },
                    { content: 'PENDING FROM SOURCE', styles: { halign: 'center', cellWidth: 'nowrap', minCellWidth: 10 } },
                    { content: 'ALL CLEAR', styles: { halign: 'center', cellWidth: 'wrap', minCellWidth: 10 } }
                ]
            ],
            body: [
                [
                    {
                        content: '',
                        styles: {
                            fillColor: [255, 0, 0],  // Red
                            cellPadding: 10,  // Increase padding inside the cell
                            margin: [5, 5, 5, 5]  // Add margin around the cell
                        }
                    },
                    {
                        content: '',
                        styles: {
                            fillColor: [255, 255, 0],  // Yellow
                            cellPadding: 10,
                            margin: [5, 5, 5, 5]
                        }
                    },
                    {
                        content: '',
                        styles: {
                            fillColor: [255, 165, 0],  // Orange
                            cellPadding: 10,
                            margin: [5, 5, 5, 5]
                        }
                    },
                    {
                        content: '',
                        styles: {
                            fillColor: [255, 192, 203],  // Pink
                            cellPadding: 10,
                            margin: [5, 5, 5, 5]
                        }
                    },
                    {
                        content: '',
                        styles: {
                            fillColor: [0, 128, 0],  // Green
                            cellPadding: 10,
                            margin: [5, 5, 5, 5]
                        }
                    }
                ]


            ],
            startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 10,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.5,
                lineColor: [62, 118, 165],
            },
            theme: 'grid',
            headStyles: {
                fillColor: [246, 246, 246],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            tableLineColor: [62, 118, 165],
            tableLineWidth: 0.5,
            margin: { left: 10, right: 10 },
            tableWidth: 'auto',
            columnStyles: {
                0: { cellWidth: 38, cellMargin: 5 }, // Adjust cell width and Margin as needed
                1: { cellWidth: 38, cellMargin: 5 },
                2: { cellWidth: 38, cellMargin: 5 },
                3: { cellWidth: 38, cellMargin: 5 },
                4: { cellWidth: 38, cellMargin: 5 }
            },
        });
        yPosition = doc.autoTable.previous?.finalY ? doc.autoTable.previous.finalY + 20 : 20; // Initial yPosition with spacing

        // Function to handle image format
        yPosition = doc.autoTable.previous?.finalY ? doc.autoTable.previous.finalY + 20 : 20; // Initial yPosition with spacing

        // Function to handle image format
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

        // Add services data handling and table creation
        let annexureIndex = 1; // Index for annexures
        // for (const service of servicesData) {
        //     const reportFormJson = JSON.parse(service.reportFormJson.json);
        //     const rows = reportFormJson.rows;
        //     const headers = reportFormJson.headers;

        //     // Add service heading
        //     const serviceHeading = reportFormJson.heading || "No Service Heading";  // Ensure a heading is available
        //     doc.setFont("helvetica", "bold");
        //     doc.setFontSize(14);
        //     doc.setTextColor(0, 0, 0);
        //     doc.text(serviceHeading, 10, yPosition);
        //     yPosition += 10;  // Space after the service heading

        //     const tableData = rows.map((row, rowIndex) => {
        //         const applicationDetails = [];
        //         const reportDetails = [];

        //         row.inputs.forEach((input, index) => {
        //             const label = input.label;
        //             const value = service.annexureData[input.name] || "N/A";

        //             if (index % 2 === 0) {
        //                 // First label-value pair for the Application Details column
        //                 applicationDetails.push(`${label} ${value}`);
        //                 reportDetails.push("");  // Empty for report details column
        //             } else {
        //                 // Second label-value pair for the Report Details column
        //                 applicationDetails.push("");
        //                 reportDetails.push(`${label} ${value}`);  // Under report details column
        //             }
        //         });

        //         return [applicationDetails, reportDetails];
        //     });

        //     // Add section heading (one per report form)
        //     doc.setFont("helvetica", "bold");
        //     doc.setFontSize(12);
        //     doc.setTextColor(255, 255, 255);
        //     doc.rect(10, yPosition, doc.internal.pageSize.width - 20, 10, "F");
        //     yPosition += 15;

        //     // Add table with autoTable
        //     doc.autoTable({
        //         startY: yPosition,
        //         head: [headers],
        //         body: tableData,
        //         styles: {
        //             fontSize: 10,
        //             cellPadding: 6,
        //             lineColor: [0, 0, 0],
        //             lineWidth: 0.2,
        //             halign: "center",
        //             valign: "middle",
        //         },
        //         headStyles: {
        //             textColor: [255, 255, 255],
        //             fontSize: 11,
        //             fontStyle: "bold",
        //         },
        //         bodyStyles: {
        //             textColor: [0, 0, 0],
        //             lineColor: [0, 0, 0],
        //         },
        //         theme: "grid",
        //         columnStyles: {
        //             0: { cellWidth: doc.internal.pageSize.width / 2 - 10, halign: "left" },
        //             1: { cellWidth: doc.internal.pageSize.width / 2 - 10, halign: "left" },
        //         },
        //     });

        //     yPosition = doc.lastAutoTable.finalY + 10; // Update yPosition after table

        //     // Handle annexure images
        //     const annexureImagesKey = Object.keys(service.annexureData).find(key =>
        //         key.toLowerCase().startsWith('annexure') && !key.includes('[') && !key.includes(']')
        //     );

        //     if (annexureImagesKey) {
        //         const annexureImagesStr = service.annexureData[annexureImagesKey];
        //         const annexureImagesSplitArr = annexureImagesStr ? annexureImagesStr.split(',') : [];

        //         if (annexureImagesSplitArr.length === 0) {
        //             // No images found
        //             doc.setFont("helvetica", "italic");
        //             doc.setFontSize(10);
        //             doc.setTextColor(150, 150, 150);
        //             doc.text("No annexure images available.", 10, yPosition);
        //             yPosition += 15;
        //         } else {
        //             for (const [index, imageUrl] of annexureImagesSplitArr.entries()) {
        //                 const imageUrlFull = `https://goldquestreact.onrender.com/${imageUrl.trim()}`;
        //                 const imageFormat = getImageFormat(imageUrlFull);  // Assuming getImageFormat is implemented

        //                 try {
        //                     const img = await loadImage(imageUrlFull);  // Assuming loadImage function is available
        //                     const { width, height } = scaleImage(img, doc.internal.pageSize.width - 20, 80);  // Assuming scaleImage function is available

        //                     if (yPosition + height > doc.internal.pageSize.height - 20) {
        //                         doc.addPage();
        //                         yPosition = 20;
        //                     }

        //                     const annexureText = `Annexure ${annexureIndex} (${String.fromCharCode(97 + index)})`;
        //                     const textWidth = doc.getTextWidth(annexureText);
        //                     const centerX = (doc.internal.pageSize.width - textWidth) / 2;
        //                     doc.setFont("helvetica", "normal");
        //                     doc.setFontSize(10);
        //                     doc.text(annexureText, centerX, yPosition);
        //                     yPosition += 15;

        //                     const centerXImage = (doc.internal.pageSize.width - width) / 2;
        //                     doc.addImage(imageUrlFull, imageFormat, centerXImage, yPosition, width, height);
        //                     yPosition += height + 15;
        //                 } catch (error) {
        //                     console.error(`Failed to load image: ${imageUrlFull}`, error);
        //                 }
        //             }
        //         }
        //     } else {
        //         // No annexure key found
        //         doc.setFont("helvetica", "italic");
        //         doc.setFontSize(10);
        //         doc.setTextColor(150, 150, 150);
        //         doc.text("No annexure images available.", 10, yPosition);
        //         yPosition += 15;
        //     }

        //     annexureIndex++;
        // }


        for (const service of servicesData) {
            const reportFormJson = JSON.parse(service.reportFormJson.json);
            const rows = reportFormJson.rows;
            const headers = reportFormJson.headers;
            const serviceHeading = reportFormJson.heading || "No Service Heading";  // Ensure a heading is available
        
            // Set up font and text color for the heading
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
        
            // Calculate the position for centering the heading
            const headingWidth = doc.getTextWidth(serviceHeading);
            const centerXHeading = (doc.internal.pageSize.width - headingWidth) / 2;
        
            // Position the heading
            doc.text(serviceHeading, centerXHeading, yPosition);
            yPosition += 10;  // Add space after the service heading
        
            // Add the table data for this service
            const tableData = rows.map((row, rowIndex) => {
                const applicationDetails = [];
                const reportDetails = [];
        
                row.inputs.forEach((input, index) => {
                    const label = input.label;
                    const value = service.annexureData[input.name] || "N/A";
        
                    if (index % 2 === 0) {
                        // First label-value pair for the Application Details column
                        applicationDetails.push(`${label} ${value}`);
                        reportDetails.push("");  // Empty for report details column
                    } else {
                        // Second label-value pair for the Report Details column
                        applicationDetails.push("");
                        reportDetails.push(`${label} ${value}`);  // Under report details column
                    }
                });
        
                return [applicationDetails, reportDetails];
            });
        
            // Calculate table width and X-position for centering
            const tableWidth = doc.internal.pageSize.width - 20;  // Width of the table (with padding)
            const tableX = (doc.internal.pageSize.width - tableWidth) / 2; // Calculate X to center the table
        
            // Generate the table with autoTable
            doc.autoTable({
                startY: yPosition, // Start table directly after heading
                startX: tableX,  // Center the table horizontally using the calculated position
                head: [headers],
                body: tableData,
                styles: {
                    fontSize: 10,
                    cellPadding: 6,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2,
                    halign: "center",
                    valign: "middle",
                },
                headStyles: {
                    textColor: [255, 255, 255],
                    fontSize: 11,
                    fontStyle: "bold",
                },
                bodyStyles: {
                    textColor: [0, 0, 0],
                    lineColor: [0, 0, 0],
                },
                theme: "grid", // This ensures the grid style with borders
                columnStyles: {
                    0: { cellWidth: (doc.internal.pageSize.width - 20) / 2, halign: "left" },
                    1: { cellWidth: (doc.internal.pageSize.width - 20) / 2, halign: "left" },
                },
            });
        
            yPosition = doc.lastAutoTable.finalY + 10; // Update yPosition after table
        
            // Handle annexure images (if any)
            const annexureImagesKey = Object.keys(service.annexureData).find(key =>
                key.toLowerCase().startsWith('annexure') && !key.includes('[') && !key.includes(']')
            );
        
            if (annexureImagesKey) {
                const annexureImagesStr = service.annexureData[annexureImagesKey];
                const annexureImagesSplitArr = annexureImagesStr ? annexureImagesStr.split(',') : [];
        
                if (annexureImagesSplitArr.length === 0) {
                    // No images found
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(10);
                    doc.setTextColor(150, 150, 150);
                    doc.text("No annexure images available.", 10, yPosition);
                    yPosition += 15;
                } else {
                    for (const [index, imageUrl] of annexureImagesSplitArr.entries()) {
                        const imageUrlFull = `https://goldquestreact.onrender.com/${imageUrl.trim()}`;
                        const imageFormat = getImageFormat(imageUrlFull);  // Assuming getImageFormat is implemented
        
                        try {
                            const img = await loadImage(imageUrlFull);  // Assuming loadImage function is available
                            const { width, height } = scaleImage(img, doc.internal.pageSize.width - 20, 80);  // Assuming scaleImage function is available
        
                            if (yPosition + height > doc.internal.pageSize.height - 20) {
                                doc.addPage();
                                yPosition = 20;
                            }
        
                            const annexureText = `Annexure ${annexureIndex} (${String.fromCharCode(97 + index)})`;
                            const textWidth = doc.getTextWidth(annexureText);
                            const centerX = (doc.internal.pageSize.width - textWidth) / 2;
                            doc.setFont("helvetica", "normal");
                            doc.setFontSize(10);
                            doc.text(annexureText, centerX, yPosition);
                            yPosition += 15;
        
                            const centerXImage = (doc.internal.pageSize.width - width) / 2;
                            doc.addImage(imageUrlFull, imageFormat, centerXImage, yPosition, width, height);
                            yPosition += height + 15;
                        } catch (error) {
                            console.error(`Failed to load image: ${imageUrlFull}`, error);
                        }
                    }
                }
            } else {
                // No annexure key found
                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text("No annexure images available.", 10, yPosition);
                yPosition += 15;
            }
        
            annexureIndex++;
        }
        


            yPosition = doc.autoTable.previous?.finalY ? doc.autoTable.previous.finalY + 20 : 20;

            // Define Disclaimer Button Dimensions
            const disclaimerButtonHeight = 12;
            const disclaimerButtonWidth = doc.internal.pageSize.width - 20;
            const disclaimerX = 10;

            // Define Disclaimer Text
            const disclaimerText = `This report is confidential and is meant for the exclusive use of the Client. This report has been prepared solely for the purpose set out pursuant to our letter of engagement (LoE)/Agreement signed with you and is not to be used for any other purpose. The Client recognizes that we are not the source of the data gathered and our reports are based on the information provided. The Client is responsible for employment decisions based on the information provided in this report.
You can mail us at compliance@screeningstar.com for any clarifications.`;

            // Dynamically calculate disclaimer text height
            doc.setFontSize(10);
            const disclaimerLines = doc.splitTextToSize(disclaimerText, disclaimerButtonWidth);
            const disclaimerTextHeight = disclaimerLines.length * 5; // Assuming 5px per line for small font

            // Calculate initial Y position for disclaimer button
            let disclaimerY = Math.max(
                doc.internal.pageSize.height - disclaimerTextHeight - disclaimerButtonHeight - 40,
                yPosition + 20
            );

            // Add new page if disclaimer doesn't fit
            if (disclaimerY + disclaimerButtonHeight + disclaimerTextHeight > doc.internal.pageSize.height - 20) {
                doc.addPage();
                disclaimerY = 20; // Start from the top of the new page if space is insufficient
            }

            // Draw Disclaimer Button
            doc.setDrawColor(62, 118, 165); // Set border color
            doc.setFillColor(backgroundColor); // Set fill color
            doc.rect(disclaimerX, disclaimerY, disclaimerButtonWidth, disclaimerButtonHeight, 'F'); // Fill the rectangle
            doc.rect(disclaimerX, disclaimerY, disclaimerButtonWidth, disclaimerButtonHeight, 'D'); // Draw the border
            doc.setTextColor(0, 0, 0); // Set text color
            doc.text(
                'DISCLAIMER',
                disclaimerX + (disclaimerButtonWidth / 2) - (doc.getTextWidth('DISCLAIMER') / 2),
                disclaimerY + 8
            );

            // Draw Disclaimer Text
            doc.setTextColor(100, 100, 100); // Original light gray text color
            doc.text(disclaimerLines, 10, disclaimerY + disclaimerButtonHeight + 5);

            // Calculate position for "END OF DETAIL REPORT" button
            let endOfDetailY = disclaimerY + disclaimerButtonHeight + disclaimerTextHeight + 10; // Tighten the gap

            // Add new page if "END OF DETAIL REPORT" doesn't fit
            if (endOfDetailY + disclaimerButtonHeight > doc.internal.pageSize.height - 10) {
                doc.addPage();
                endOfDetailY = 20; // Reset position on the new page
            }

            // Draw "END OF DETAIL REPORT" Button
            doc.setDrawColor(62, 118, 165); // Original button style
            doc.setFillColor(backgroundColor); // Original fill color
            doc.rect(disclaimerX, endOfDetailY, disclaimerButtonWidth, disclaimerButtonHeight, 'F'); // Fill the rectangle
            doc.rect(disclaimerX, endOfDetailY, disclaimerButtonWidth, disclaimerButtonHeight, 'D'); // Draw the border
            doc.setTextColor(0, 0, 0); // Original text color
            doc.text(
                'END OF DETAIL REPORT',
                disclaimerX + (disclaimerButtonWidth / 2) - (doc.getTextWidth('END OF DETAIL REPORT') / 2),
                endOfDetailY + 8
            );


            // Save the PDF
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
