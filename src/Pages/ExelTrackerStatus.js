import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useApi } from '../ApiContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { BranchContextExel } from './BranchContextExel';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const ExelTrackerStatus = () => {
    const [selectedStatus, setSelectedStatus] = useState('');


    const [searchTerm, setSearchTerm] = useState('');
    const [allInputDetails, setAllInputDetails] = useState([]);
    const [parentCustomer, setParentCustomer] = useState([]);
    const [pdfData, setPdfData] = useState([]);
    const [serviceTitleValue, setServiceTitleValue] = useState([]);
    const [cmtAllData, setCmtAllData] = useState([]);
    const printRef = React.useRef();
    const [dbHeadingsStatus, setDBHeadingsStatus] = useState({});
    const [applicationData, setApplicationData] = useState([]);
    const [expandedRows, setExpandedRows] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serviceHeadings, setServiceHeadings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const { branch_id, setApplicationId, setServiceId } = useContext(BranchContextExel);
    const API_URL = useApi();
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");
    const [options,setOptions] = useState([]);
    const requestOptions = {
        method: "GET",
        redirect: "follow",
    };

    const fetchApplications = useCallback(() => {
        setLoading(true);
        fetch(`${API_URL}/client-master-tracker/applications-by-branch?branch_id=${branch_id}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        const errorData = JSON.parse(text);
                        Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                        throw new Error(errorData.message);
                    });
                }
                return response.json();
            })
            .then(data => {
                const newToken = data._token || data.token;
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
                setApplicationData(data.customers || []);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, [API_URL, branch_id, admin_id, storedToken]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);
    const handleToggle = useCallback((index, services, id) => {
        if (!admin_id || !storedToken || !id) {
            console.error("Missing required parameters");
            return;
        }

        const newExpandedRow = expandedRows === index ? null : index;
        setExpandedRows(newExpandedRow);

        if (newExpandedRow === index && services) {
            const servicesArray = services.split(',').map(Number);

            Promise.all(
                servicesArray.map(serviceId => {
                    const url = `${API_URL}/client-master-tracker/report-form-json-by-service-id?service_id=${serviceId}&admin_id=${admin_id}&_token=${storedToken}`;

                    return fetch(url, requestOptions)
                        .then(response => {
                            if (!response.ok) throw new Error('Network response was not ok');
                            return response.json();
                        })
                        .then(result => {
                            const newService = result.reportFormJson.json;
                            const parsedData = JSON.parse(newService);
                            const parsedDb = parsedData.db_table;
                            const parsedDbHeading = parsedData.heading;

                            // Initialize or update serviceHeadings
                            if (!serviceHeadings[parsedDb]) {
                                serviceHeadings[parsedDb] = [];
                            }
                            serviceHeadings[parsedDb].push(parsedDbHeading); // Push heading

                            const newToken = result._token || result.token;
                            if (newToken) localStorage.setItem("_token", newToken);
                            return parsedDb;
                        })
                        .catch(error => console.error('Fetch error:', error));
                })
            ).then(parsedDbs => {
                const uniqueDbNames = [...new Set(parsedDbs.filter(Boolean))];

                const annexureFetches = uniqueDbNames.map(db_name => {
                    const url = `${API_URL}/client-master-tracker/annexure-data?application_id=${id}&db_table=${db_name}&admin_id=${admin_id}&_token=${storedToken}`;

                    return fetch(url, requestOptions)
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                            return response.json();
                        })
                        .then(result => ({
                            db_table: db_name,
                            status: result?.annexureData?.status || 'N/A'
                        }))
                        .catch(error => console.error("Fetch error: ", error));
                });

                return Promise.all(annexureFetches).then(annexureStatusArr => {
                    setDBHeadingsStatus(prev => ({ ...prev, [id]: annexureStatusArr }));
                });
            })
                .catch(error => console.error("Error during service fetch or annexure fetch: ", error));
        }
    }, [expandedRows, admin_id, storedToken, API_URL, requestOptions]);

    const generateReport = (id, services) => {
        navigate('/candidate');
        setApplicationId(id);
        setServiceId(services);
    };


    const handleDownloadPdf = async (id, branch_id) => {


        if (!id || !branch_id) {
            return Swal.fire('Error!', 'Something is missing', 'error');
        }

        const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://goldquestreact.onrender.com/client-master-tracker/application-by-id?application_id=${id}&branch_id=${branch_id}&admin_id=${adminId}&_token=${storedToken}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                const errorData = JSON.parse(errorText);
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                throw new Error(errorText);
            }

            const data = await response.json();
            const applications = data.application;
            const serviceIdsArr = applications?.services?.split(',') || [];
            const serviceTitleValue = [];

            // Fetch service data
            if (serviceIdsArr.length > 0) {
                const serviceFetchPromises = serviceIdsArr.map(async (serviceId) => {
                    const requestOptions = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        redirect: "follow",
                    };

                    const serviceInfoUrl = `https://goldquestreact.onrender.com/service/service-info?id=${serviceId}&admin_id=${adminId}&_token=${storedToken}`;
                    const applicationServiceUrl = `https://goldquestreact.onrender.com/client-master-tracker/application-service?service_id=${serviceId}&application_id=${id}&admin_id=${adminId}&_token=${storedToken}`;

                    const [serviceResponse, applicationResponse] = await Promise.all([
                        fetch(serviceInfoUrl, requestOptions),
                        fetch(applicationServiceUrl, requestOptions),
                    ]);

                    if (!serviceResponse.ok || !applicationResponse.ok) {
                        console.error("Failed to fetch service/application data");
                        return null; // Early exit if any request fails
                    }

                    const serviceData = await serviceResponse.json();
                    const applicationData = await applicationResponse.json();

                    const title = serviceData.service.title || "N/A";
                    serviceTitleValue.push({
                        title,
                        status: applicationData.annexureData?.status || "N/A",
                        info_source: applicationData.annexureData?.info_source || "N/A",
                        verified_at: applicationData.annexureData?.verified_at || "N/A",
                        color_status: applicationData.annexureData?.color_status || "N/A",
                    });
                });

                await Promise.all(serviceFetchPromises);
                setServiceTitleValue(serviceTitleValue);
            }

            // Fetch report form details
            const allInputDetails = [];
            const servicesArray = serviceIdsArr.map(Number);

            await Promise.all(
                servicesArray.map(async (serviceId) => {
                    const response = await fetch(
                        `https://goldquestreact.onrender.com/client-master-tracker/report-form-json-by-service-id?service_id=${serviceId}&admin_id=${adminId}&_token=${storedToken}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (!response.ok) {
                        const errorText = await response.text();
                        const errorData = JSON.parse(errorText);
                        Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                        throw new Error(errorText);
                    }

                    const data = await response.json();
                    const newToken = data._token || data.token;
                    if (newToken) {
                        localStorage.setItem("_token", newToken);
                    }

                    let parsedJson;
                    try {
                        parsedJson = JSON.parse(data.reportFormJson.json || '{}');
                    } catch (error) {
                        console.error("Failed to parse reportFormJson:", error);
                        return; // Skip this iteration
                    }

                    if (parsedJson.db_table && parsedJson.heading) {
                        const annexureHeading = parsedJson.heading;
                        const annexureURL = `https://goldquestreact.onrender.com/client-master-tracker/annexure-data?application_id=${id}&db_table=${parsedJson.db_table}&admin_id=${adminId}&_token=${storedToken}`;

                        const annexureResponse = await fetch(annexureURL, { method: "GET", redirect: "follow" });
                        if (!annexureResponse.ok) {
                            console.error(`Failed to fetch annexure data for ${serviceId}`);
                            return; // Skip this iteration if annexure fetch fails
                        }

                        const annexureResult = await annexureResponse.json();
                        const inputDetails = [];

                        const annexureData = annexureResult.annexureData;
                        parsedJson.rows.forEach(row => {
                            row.inputs.forEach(input => {
                                const value = annexureData && Array.isArray(annexureData)
                                    ? (annexureData.find(item => item.name === input.name)?.value || 'N/A')
                                    : (annexureData?.[input.name] || 'N/A');

                                inputDetails.push({
                                    label: input.label,
                                    name: input.name,
                                    type: input.type,
                                    value: value,
                                    options: input.options || undefined,
                                });
                            });
                        });

                        allInputDetails.push({ annexureHeading, inputDetails });
                    }
                })
            );

            setAllInputDetails(allInputDetails);

            // Prepare for PDF generation
            setPdfData(applications);
            const cmtData = data.CMTData;
            setCmtAllData(cmtData);

            // Create the PDF
            const element = printRef.current;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('portrait', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            let imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
            let heightLeft = imgHeight;
            let position = 0;

            // Define margin for spacing
            const margin = 20; // Adjust as needed

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= (pdfHeight + margin);

            // Add remaining pages
            while (heightLeft > 0) {
                position = heightLeft - imgHeight - margin;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= (pdfHeight + margin);
            }

            // Save the PDF
            pdf.save('table.pdf');

        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to load client data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSelectOptions = useCallback(() => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
    
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };
    
        fetch(`${API_URL}/client-master-tracker/filter-options?admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); 
            })
            .then((result) =>{
                console.log(result);
                setOptions(result.filterOptions);
            } )
            .catch((error) => console.error('Error fetching options:', error));
    }, []);
    

    useEffect(() => {
        fetchSelectOptions();
    }, [fetchSelectOptions])

 

    const fetchCustomers = useCallback(() => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        const requestOptions = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json' // Optional, may not be needed for GET
            },
            redirect: "follow"
        };

        fetch(`https://goldquestreact.onrender.com/client-master-tracker/customer-info?customer_id=${applicationData[0]?.customer_id}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // Assuming the response is JSON
            }).then((data) => {
                setParentCustomer(data.customers)
            })

            .catch((error) => console.error('Error fetching customers:', error));
    }, [applicationData])

    useEffect(() => {

        fetchCustomers();
    }, [fetchCustomers]);

  const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const filteredOptions = options.filter(item =>
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const filteredItems = applicationData.filter(item => {
        return (
            item.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });



    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showPrev = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const showNext = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };

// Pagination display logic
const renderPagination = () => {
    const pageNumbers = [];

    // Handle pagination with ellipsis
    if (totalPages <= 5) {
        // If there are 5 or fewer pages, show all page numbers
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        // Always show the first page
        pageNumbers.push(1);

        // Show ellipsis if current page is greater than 3
        if (currentPage > 3) {
            pageNumbers.push('...');
        }

        // Show two pages around the current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (!pageNumbers.includes(i)) {
                pageNumbers.push(i);
            }
        }

        // Show ellipsis if current page is less than total pages - 2
        if (currentPage < totalPages - 2) {
            pageNumbers.push('...');
        }

        // Always show the last page
        if (!pageNumbers.includes(totalPages)) {
            pageNumbers.push(totalPages);
        }
    }

    // Log to verify page numbers
    console.log(pageNumbers); 

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

    return (
        <>
            <div>
                {loading && <div className="loader">Loading...</div>} {/* Your loading spinner here */}
                {error && <div>Error: {error}</div>}
                  <select  id="" name='status' onChange={handleStatusChange}   className='outline-none border-2 p-2 rounded-md w-full my-4 md:my-0' >
                {options.map((item,index)=>{
                    return(
                        <>
                        <option   value={item.status}>{item.status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - {item.count}</option>
                        </>
                    )
                })}
                  
                </select>
                 
                <div className="overflow-x-auto my-14 mx-4 bg-white shadow-md rounded-md">
                    <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
                        <div className="col">
                            <form action="">
                                <div className="flex gap-5 justify-between">
                                    <select name="" id="" className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
                                        <option value="100">Show 100 Rows</option>
                                        <option value="200">200 Rows</option>
                                        <option value="300">300 Rows</option>
                                        <option value="400">400 Rows</option>
                                        <option value="500">500 Rows</option>
                                    </select>
                                    <button className="bg-green-600 text-white py-3 px-8 rounded-md capitalize" type='button'>exel</button>
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
                    <table className="min-w-full">
                        <thead>
                            <tr className='bg-green-500'>
                                <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">SL NO</th>
                                <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Application ID</th>
                                <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">NAME OF THE APPLICANT</th>
                                <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">APPLICANT EMPLOYEE ID</th>
                                <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Initiation Date</th>
                                <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Download Status</th>
                                <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Overall Status</th>
                                <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Report Data</th>
                                <th className="py-3 px-4 border-b text-center uppercase whitespace-nowrap text-white">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <tr>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                            <input type="checkbox" className='me-2' />     {index + 1 + (currentPage - 1) * itemsPerPage}
                                        </td>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.application_id}</td>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.name}</td>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.employee_id}</td>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.created_at}</td>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize"><button className="bg-green-500 hover:bg-green-400 rounded-md p-3 text-white" onClick={() => handleDownloadPdf(item.id, item.branch_id)}>Download Report</button></td>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.overall_status}</td>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                            <button className="bg-green-400 rounded-md text-white p-3" onClick={() => generateReport(item.id, item.services)}>Generate Report</button>
                                        </td>
                                        <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                            <button
                                                className="bg-green-500 hover:bg-green-400 rounded-md p-3 text-white"
                                                onClick={() => handleToggle(index, item.services, item.id)}
                                            >
                                                {expandedRows === index ? "Hide Details" : "View More"}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRows === index && (
                                        <tr>
                                            <td colSpan="9" className="p-0">
                                                <div className='collapseMenu overflow-auto w-full max-w-[1500px]'>
                                                    <table className="min-w-full max-w-full bg-gray-100">
                                                        <thead>
                                                            <tr>
                                                                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">TAT Day</th>
                                                                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Batch No</th>
                                                                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap   fhghghghghghghghghghgf">Subclient</th>
                                                                {dbHeadingsStatus[item.id]?.map((value, index) => (
                                                                    <th key={index} className="service-th  py-3 px-4 border-b text-left uppercase whitespace-nowrap">{value?.db_table || 'N/A'}</th>
                                                                ))}

                                                                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="py-3 px-4 border-b whitespace-nowrap capitalize">{item.tatday}</td>
                                                                <td className="py-3 px-4 border-b whitespace-nowrap capitalize">{item.batch_number}</td>
                                                                <td className="py-3 px-4 border-b whitespace-nowrap capitalize">{item.sub_client}</td>
                                                                {dbHeadingsStatus[item.id]?.map((value, index) => (
                                                                    <td key={index} className=" py-3 px-4 border-b whitespace-nowrap capitalize">{value?.status || 'N/A'}</td>
                                                                ))}

                                                                <td className="py-3 px-4 border-b whitespace-nowrap capitalize">
                                                                    <button className="bg-red-500 hover:bg-red-400 text-white rounded-md p-3">Delete</button>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-end rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
                    <button
                        type='button'
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
                        type="button"
                        onClick={showNext}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        aria-label="Next page"
                    >
                        <MdArrowForwardIos />
                    </button>
                </div>

            </div>

            <div className='opacity-0 '>

                <div ref={printRef} style={{ padding: '70px', backgroundColor: '#fff', marginBottom: '20px', width: '100%', margin: '0 auto' }}>
                    <img src="https://i0.wp.com/goldquestglobal.in/wp-content/uploads/2024/03/goldquestglobal.png?w=771&ssl=1" alt="" style={{ width: '200px' }} />

                    <h1 style={{ textAlign: 'center', paddingBottom: '20px', fontWeight: '700', fontSize: '30px' }}>CONFIDENTIAL BACKGROUND VERIFICATION REPORT</h1>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>

                            <tr>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}> Name of the Candidate               </th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>{pdfData?.name || ' N/A'}</td>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>Client Name</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>{parentCustomer[0]?.name || ' N/A'}</td>
                            </tr>
                            <tr>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>Application ID</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>{pdfData?.application_id || ' N/A'}</td>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>Report Status</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}> {cmtAllData?.report_status || ' N/A'}</td>
                            </tr>
                            <tr>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}> Date of Birth</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}> {cmtAllData?.dob
                                    ? new Date(cmtAllData.dob).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'N/A'}</td>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>Application Received</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>  {pdfData?.updated_at
                                    ? new Date(pdfData.updated_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}> Candidate Employee ID</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>{pdfData?.employee_id || ' N/A'}</td>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>Insuff Cleared/Reopened</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap', border: '1px solid #ccc' }}>{pdfData?.application_id || ' N/A'}</td>
                            </tr>
                            <tr>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}> Report Type</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>{cmtAllData?.report_type || ' N/A'}</td>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>  Final Report Date</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}> {cmtAllData?.report_date
                                    ? new Date(cmtAllData.report_date).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'N/A'}</td>

                            </tr>
                            <tr>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}> Verification Purpose</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>{pdfData?.overall_status || ' N/A'}</td>
                                <th style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>  Overall Report Status</th>
                                <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>{pdfData?.status || ' N/A'}</td>

                            </tr>

                        </thead>

                    </table>
                    <br />
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        border: '1px solid #000',
                                        padding: '12px', fontSize: '17px',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        backgroundColor: '#22c55e',
                                        color: '#fff',
                                        borderBottom: '0px',
                                    }}
                                >
                                    REPORT COMPONENTS
                                </th>
                                <th
                                    style={{
                                        border: '1px solid #000',
                                        padding: '12px', fontSize: '17px',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        backgroundColor: '#22c55e',
                                        color: '#fff',
                                        borderBottom: '0px',
                                    }}
                                >
                                    INFORMATION SOURCE
                                </th>
                                <th
                                    colSpan={2}
                                    style={{
                                        border: '1px solid #000',
                                        borderBottom: '0px',
                                        padding: '12px', fontSize: '17px',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        backgroundColor: '#22c55e',
                                        color: '#fff',
                                    }}
                                >
                                    COMPONENT STATUS
                                </th>
                            </tr>
                            <tr>
                                <th colSpan={2} style={{
                                    padding: '12px', fontSize: '17px',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    backgroundColor: '#22c55e',
                                    color: '#fff',
                                }}></th>
                                <th style={{
                                    border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'center',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    backgroundColor: '#22c55e',
                                    color: '#fff',
                                }}>Completed Date</th>
                                <th style={{
                                    border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'center',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    backgroundColor: '#22c55e',
                                    color: '#fff',
                                }}>Verification Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                serviceTitleValue.map(item => (
                                    <tr key={item.title}> {/* Use a unique key for each row */}
                                        <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                            {item.title}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                            {item.info_source} {/* You can replace this with the actual name if available */}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'center' }}>
                                            {item.verified_at
                                                ? new Date(item.verified_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : 'N/A'}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '12px', fontSize: '17px', textAlign: 'center' }}>
                                            {item.status.replace(/[_-]/g, ' ')}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>

                    </table>


                    <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: '600', marginTop: '30px' }}> End of summary report</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '30px', border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={{ borderLeft: "1px solid #000", padding: '12px', fontSize: '17px', textAlign: 'center', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'stretch', width: "16.66%" }}>COMPONENT STATUS </th>
                                <th style={{ borderLeft: "1px solid #000", padding: '12px', fontSize: '17px', textAlign: 'center', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'stretch', width: "16.66%", gap: '15px' }}> <div style={{ height: '30px', width: '20px', backgroundColor: 'green' }}></div>REPORT COMPONENTS</th>
                                <th style={{ borderLeft: "1px solid #000", padding: '12px', fontSize: '17px', textAlign: 'center', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'stretch', width: "16.66%", gap: '15px' }}> <div style={{ height: '30px', width: '20px', backgroundColor: 'red' }}></div>INFORMATION SOURCE</th>
                                <th style={{ borderLeft: "1px solid #000", padding: '12px', fontSize: '17px', textAlign: 'center', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'stretch', width: "16.66%", gap: '15px' }}> <div style={{ height: '30px', width: '20px', backgroundColor: 'orange' }}></div>COMPONENT STATUS  </th>
                                <th style={{ borderLeft: "1px solid #000", padding: '12px', fontSize: '17px', textAlign: 'center', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'stretch', width: "16.66%", gap: '15px' }}> <div style={{ height: '30px', width: '20px', backgroundColor: 'pink' }}></div>COMPONENT STATUS  </th>
                                <th style={{ borderLeft: "1px solid #000", padding: '12px', fontSize: '17px', textAlign: 'center', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'stretch', width: "16.66%", gap: '15px' }}> <div style={{ height: '30px', width: '20px', backgroundColor: 'yellow' }}></div>COMPONENT STATUS  </th>
                            </tr>
                        </thead>
                    </table>
                    {allInputDetails.map((annexure, index) => (
                        <div key={index}>
                            <h3 style={{ padding: '10px', border: '1px solid #000', backgroundColor: '#22c55e', width: '100%', color: '#fff', marginTop: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                                {annexure.annexureHeading}
                            </h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: '0px', padding: '20px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>Application Details</th>
                                        <th style={{ padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>Report Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {annexure.inputDetails.map((input, idx) => (
                                        <React.Fragment key={idx}>
                                            {input.type !== 'file' ? (
                                                <tr>
                                                    <th style={{ padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                                        {input.label}
                                                    </th>
                                                    <td style={{ padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                                        {input.type === 'datepicker' ? (
                                                            input.value
                                                                ? new Date(input.value).toLocaleDateString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })
                                                                : 'N/A'
                                                        ) : (
                                                            input.value ? input.value.replace(/[_-]/g, ' ') : 'N/A'
                                                        )}
                                                    </td>
                                                </tr>
                                            ) : (
                                                // Handle the case for 'file' type
                                                <tr>
                                                    <th style={{ padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                                        {input.label}
                                                    </th>
                                                    <td style={{ padding: '12px', fontSize: '17px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                                        {input.value ? (
                                                            input.value.split(',').map((url, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={`https://goldquestreact.onrender.com/${url.trim()}`}
                                                                    alt={`Image ${index + 1}`}
                                                                    style={{ width: '50px', height: '50px', marginLeft: '10px' }} // Adjust styles as needed
                                                                />
                                                            ))
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    ))}

                    <p style={{ border: "1px solid #000", borderTop: '0px', padding: '10px' }}><b>Remarks</b>: The following applicant details are verbally verified by Mr. Prashant Vishwas, (Head Constable), and the notary
                        report duly stamped and signed by Mr.Harsh Shukla (Advocate)with comment on criminal record not found, Hence
                        closing the check as GREEN and the same is furnished as annexure.</p>
                    <b> Annexure - 1 (A) </b>

                    <div style={{ textAlign: 'center', }}>
                        <h5 style={{ textTransform: 'uppercase' }}>Lorem, ipsum dolor.</h5>
                        <h5 style={{ textTransform: 'uppercase' }}>Lorem ipsum dolor sit amet consectetur.</h5>
                        <h5 style={{ textTransform: 'uppercase' }}>Lorem ipsum dolor sit.</h5>
                        <hr />
                    </div>

                    <h4 style={{ textTransform: 'uppercase', textAlign: 'left', fontSize: "24px", marginTop: '20px', fontWeight: 'bold', paddingBottom: '10px' }}>conclusion</h4>
                    <p style={{ fontSize: '16px', fontWeight: '400', paddingBottom: '15px' }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit facere enim quidem dolorem alias animi sapiente at quisquam quam eveniet dolor, quo quos officiis, deserunt cupiditate minus necessitatibus, omnis blanditiis!</p>
                    <h4 style={{ textTransform: 'uppercase', textAlign: 'left', fontSize: "24px", fontWeight: 'bold', paddingBottom: '10px' }}>conclusion</h4>
                    <p style={{ fontSize: '16px', fontWeight: '400', paddingBottom: '15px' }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit facere enim quidem dolorem alias animi sapiente at quisquam quam eveniet dolor, quo quos officiis, deserunt cupiditate minus necessitatibus, omnis blanditiis!</p>
                    <h4 style={{ textTransform: 'uppercase', textAlign: 'left', fontSize: "24px", fontWeight: 'bold', paddingBottom: '10px' }}>conclusion</h4>
                    <p style={{ fontSize: '16px', fontWeight: '400', paddingBottom: '15px' }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit facere enim quidem dolorem alias animi sapiente at quisquam quam eveniet dolor, quo quos officiis, deserunt cupiditate minus necessitatibus, omnis blanditiis!</p>

                    <div>
                        <button style={{ backgroundColor: 'green', color: "#fff", padding: '13px', width: '100%', borderRadius: '10px', marginBottom: '15px' }}>Disclaimer</button>
                        <p>This report is confidential and is meant for the exclusive use of the Client. This report has been prepared solely for the
                            purpose set out pursuant to our letter of engagement (LoE)/Agreement signed with you and is not to be used for any
                            other purpose. The Client recognizes that we are not the source of the data gathered and our reports are based on the
                            information purpose. The Client recognizes that we are not the source of the data gathered and our reports are based on
                            the information responsible for employment decisions based on the information provided in this report. </p>
                        <button style={{ border: '1px solid #000', padding: '13px', width: '100%', borderRadius: '10px', marginTop: '15px' }}>End of detail report</button>
                    </div>
                </div>
            </div>


        </>



    );
};

export default ExelTrackerStatus;
