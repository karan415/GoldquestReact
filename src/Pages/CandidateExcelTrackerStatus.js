import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useApi } from '../ApiContext';
import PulseLoader from 'react-spinners/PulseLoader'; // Import the PulseLoader
import { useSidebar } from '../Sidebar/SidebarContext';
import { BranchContextExel } from './BranchContextExel';
import Swal from 'sweetalert2';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const CandidateExcelTrackerStatus = () => {
    const [loadingRow, setLoadingRow] = useState(null);
    const { handleTabChange } = useSidebar();
    const [expandedRow, setExpandedRow] = useState({ index: '', headingsAndStatuses: [] });
    const navigate = useNavigate();
    const location = useLocation();
    const [itemsPerPage, setItemPerPage] = useState(10)
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [adminTAT, setAdminTAT] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({}); // To track loading state for each button
    const API_URL = useApi();
    const { branch_id } = useContext(BranchContextExel);
    const queryParams = new URLSearchParams(location.search);
    const clientId = queryParams.get('clientId');
    const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
    const token = localStorage.getItem('_token');
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (section) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };
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

        fetch(`${API_URL}/candidate-master-tracker/applications-by-branch?branch_id=${branch_id}&admin_id=${adminId}&_token=${token}`, requestOptions)
            .then(response => {
                return response.json().then(result => {
                    const newToken = result._token || result.token;
                    if (newToken) {
                        localStorage.setItem("_token", newToken);
                    }
                    if (!response.ok) {
                        // Show SweetAlert if response is not OK
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: result.message || 'Failed to load data',
                        });
                        throw new Error(result.message || 'Failed to load data');
                    }
                    return result;
                });
            }).then((result) => {
                setLoading(false);
                setData(result.data.applications || []);

            })
            .catch((error) => {
                console.error('Fetch error:', error);
            }).finally(() => {
                setLoading(false);
            });

    }, [branch_id, adminId, token, setData]);


    const goBack = () => {
        handleTabChange('candidate_master');
    }

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };


    const filteredItems = data.filter(item => {
        return (
            (item.application_id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (item.employee_id?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        );
    });

    const tableRef = useRef(null); // Ref for the table container

    // Function to reset expanded rows
    const handleOutsideClick = (event) => {
        if (tableRef.current && !tableRef.current.contains(event.target)) {
            setExpandedRow({}); // Reset to empty object instead of null
        }
    };


    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);


    const filteredOptions = filteredItems.filter(item =>
        (item.status?.toLowerCase() || "").includes(selectedStatus.toLowerCase())
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

    useEffect(() => {
        fetchData();
    }, [clientId, branch_id]);


    const handleViewMore = (id) => {
        setExpandedRow((prevRow) => (prevRow === id ? null : id)); // Toggle expanded row
    };


    const handleSelectChange = (e) => {

        const selectedValue = e.target.value;
        setItemPerPage(selectedValue)
    }

    const handleBGVClick = (cef_id, branch_id, applicationId) => {
        // Navigate to the Candidate BGV page with the cef_id
        navigate(`/candidate-bgv?cef_id=${cef_id}&branch_id=${branch_id}&applicationId=${applicationId}`);
    };
    const handleDAVClick = (def_id, branch_id, applicationId) => {
        // Navigate to the Candidate BGV page with the cef_id
        navigate(`/candidate-dav?def_id=${def_id}&branch_id=${branch_id}&applicationId=${applicationId}`);
    };



    const handleSendLink = (applicationID, branch_id, customer_id, rowId) => {
        const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
        const token = localStorage.getItem("_token");

        if (!adminId || !token) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Admin ID or token is missing. Please log in again.',
            });
            return;
        }

        setLoadingRow(rowId); // Set the loading row ID

        const url = `${API_URL}/candidate-master-tracker/send?application_id=${applicationID}&branch_id=${branch_id}&customer_id=${customer_id}&admin_id=${adminId}&_token=${token}`;

        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };

        fetch(url, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                if (result.status) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: result.message,
                        footer: `DAV Mail Sent: ${result.details.davMailSent} | BGV Mail Sent: ${result.details.cefMailSent}`,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: result.message,
                        footer: result.details ? `DAV Errors: ${result.details.davErrors} | CEF Errors: ${result.details.cefErrors}` : '',
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Something went wrong. Please try again later.',
                });
            })
            .finally(() => setLoadingRow(null)); // Reset loading state
    };







    console.log('currentItems', currentItems);

    return (
        <div className="bg-[#c1dff2]">
            <div className="space-y-4 py-[30px] px-[51px] bg-white">
                <div className=" mx-4 bg-white">
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
                                </div>
                            </form>
                        </div>

                    </div>

                </div>
                <div ref={tableRef} className="overflow-x-auto py-6 px-4 shadow-md rounded-md bg-white">
                    {loading ? (
                        <div className='flex justify-center items-center py-6 h-full'>
                            <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />
                        </div>
                    ) : currentItems.length > 0 ? (
                        <table className="min-w-full border-collapse border overflow-scroll rounded-lg whitespace-nowrap">
                            <thead className='rounded-lg'>
                                <tr className="bg-green-500 text-white">
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">SL NO</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Full name of the applicant </th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Employee ID</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Mobile Number</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Email</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">Initiation Date</th>
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">View More</th>
                                    {currentItems.some(item => item.cef_id) ? (
                                        <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                            BGV
                                        </th>
                                    ) : (
                                        <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                            BGV
                                        </th>
                                    )}
                                    {currentItems.some(item => item.cef_filled_date) ? (
                                        <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                            BGV FILLED DATE
                                        </th>
                                    ) : (
                                        <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                            BGV FILLED DATE
                                        </th>
                                    )}
                                    {currentItems.some(item => item.dav_id) ? (
                                        <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                            DAV
                                        </th>
                                    ) : (
                                        <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                            DAV
                                        </th>
                                    )}
                                    {currentItems.some(item => item.dav_filled_date) ? (
                                        <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                            DAV FILLED DATE
                                        </th>
                                    ) : (
                                        <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                            DAV FILLED DATE
                                        </th>
                                    )}
                                    <th className="py-3 px-4 border-b border-r-2 whitespace-nowrap uppercase">
                                        SEND LINK
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((data, index) => (
                                    <React.Fragment key={data.id}>
                                        <tr className="text-center">
                                            <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{index + 1}</td>
                                            <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{data.name || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{data.employee_id || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap ">{data.mobile_number || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap ">{data.email || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                {data.created_at && !isNaN(new Date(data.created_at))
                                                    ? `${String(new Date(data.created_at).getDate()).padStart(2, '0')}- 
                                                        ${String(new Date(data.created_at).getMonth() + 1).padStart(2, '0')}- 
                                                        ${new Date(data.created_at).getFullYear()}`
                                                      : "NIL"}
                                            </td>

                                            <td className="border px-4 py-2">
                                                <button
                                                    className={`uppercase border px-4 py-2 rounded ${data.service_data &&
                                                        Object.values(data.service_data).some(
                                                            (subData) => Array.isArray(subData) ? subData.length > 0 : subData && Object.keys(subData).length > 0
                                                        )
                                                        ? 'bg-orange-500 text-white hover:border-orange-500 hover:bg-white hover:text-orange-500'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                    onClick={() =>
                                                        data.service_data &&
                                                        Object.values(data.service_data).some(
                                                            (subData) => Array.isArray(subData) ? subData.length > 0 : subData && Object.keys(subData).length > 0
                                                        ) &&
                                                        handleViewMore(data.id)
                                                    }
                                                    disabled={
                                                        !data.service_data ||
                                                        !Object.values(data.service_data).some(
                                                            (subData) => Array.isArray(subData) ? subData.length > 0 : subData && Object.keys(subData).length > 0
                                                        )
                                                    }
                                                >
                                                    {expandedRow > 0 ? 'LESS' : 'VIEW'}
                                                </button>



                                            </td>

                                            {data.cef_id ? (
                                                <td className="border px-4 py-2">
                                                    <button
                                                        className="bg-blue-500 uppercase border border-white hover:border-blue-500 text-white px-4 py-2 rounded hover:bg-white hover:text-blue-500"
                                                        onClick={() => handleBGVClick(data.cef_id, data.branch_id, data.main_id)}
                                                    >
                                                        BGV
                                                    </button>
                                                </td>
                                            ) : (
                                                <td className="border px-4 py-2">NIL</td>
                                            )}

                                            {currentItems.some(item => item.cef_filled_date) ? (
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                    {data.cef_filled_date && !isNaN(new Date(data.cef_filled_date))
                                                        ? `${String(new Date(data.cef_filled_date).getDate()).padStart(2, '0')}- 
                                                      ${String(new Date(data.cef_filled_date).getMonth() + 1).padStart(2, '0')}- 
                                                      ${new Date(data.cef_filled_date).getFullYear()}`
                                                        : "NIL"}
                                                </td>

                                            ) : (
                                                <td className="border px-4 py-2">NIL</td>
                                            )}

                                            {data.dav_id ? (
                                                <td className="border px-4 py-2">
                                                    <button
                                                        className="bg-purple-500 uppercase border border-white hover:border-purple-500 text-white px-4 py-2 rounded hover:bg-white hover:text-purple-500"
                                                        onClick={() => handleDAVClick(data.def_id, data.branch_id, data.main_id)}
                                                    >
                                                        DAV
                                                    </button>
                                                </td>
                                            ) : (
                                                <td className="border px-4 py-2">NIL</td>
                                            )}
                                            {currentItems.some(item => item.dav_filled_date) ? (
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                    {data.dav_filled_date
                                                        ? `${String(new Date(data.dav_filled_date).getDate()).padStart(2, '0')}- 
                                                     ${String(new Date(data.dav_filled_date).getMonth() + 1).padStart(2, '0')}- 
                                                     ${new Date(data.dav_filled_date).getFullYear()}`
                                                        : "NIL"}
                                                </td>

                                            ) : (
                                                <td className="border px-4 py-2">NIL</td>
                                            )}
                                            {data.cef_submitted === 0 || (data.dav_exist === 1 && data.dav_submitted === 0) ? (
                                                <td className="border px-4 py-2">
                                                    <button
                                                        className={`bg-green-600 uppercase border border-white hover:border-green-500 text-white px-4 py-2 rounded hover:bg-white ${loadingRow === data.id ? "opacity-50 cursor-not-allowed hover:text-green-500 " : "hover:text-green-500"
                                                            }`}
                                                        onClick={() => handleSendLink(data.main_id, data.branch_id, data.customer_id, data.id)}
                                                        disabled={loadingRow} // Disable only the clicked button
                                                    >
                                                        {loadingRow === data.id ? "Sending..." : "SEND LINK"}
                                                    </button>
                                                </td>
                                            ) : null}

                                        </tr>
                                        {servicesLoading[index] ? (
                                            <tr>
                                                <td colSpan={12} className="py-4 text-center text-gray-500">
                                                    <div className='flex justify-center'>
                                                        <PulseLoader color="#36D7B7" loading={servicesLoading[index]} size={15} aria-label="Loading Spinner" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (expandedRow === data.id && (
                                            <div className="p-4 bg-gray-100 gap-20 min-h-20">
                                                {/* Check if any mainHeading has valid data */}
                                                {Object.entries(data.service_data).every(([mainHeading, subData]) => {
                                                    const hasInnerData = Object.values(subData || {}).some((items) => {
                                                        // Check if items are arrays with data or strings with non-empty values
                                                        if (typeof items === 'string') {
                                                            items = items.split(',').map((item) => item.trim());
                                                        }
                                                        return Array.isArray(items) && items.length > 0 && items[0].trim() !== '';
                                                    });
                                                    return !hasInnerData; // Return true if no data for this mainHeading
                                                }) ? (
                                                    <div className="text-center text-gray-500">No data available</div>
                                                ) : (
                                                    Object.entries(data.service_data).map(([mainHeading, subData]) => {
                                                        const hasInnerData = Object.values(subData || {}).some((items) => {
                                                            if (typeof items === 'string') {
                                                                items = items.split(',').map((item) => item.trim());
                                                            }
                                                            return Array.isArray(items) && items.length > 0 && items[0].trim() !== '';
                                                        });

                                                        if (!hasInnerData) return null; // Skip rendering if no data

                                                        return (
                                                            <div key={mainHeading} className="mb-6 border rounded-md shadow-md bg-white">
                                                                <div
                                                                    className="cursor-pointer p-4 text-lg font-bold bg-gray-200 hover:bg-gray-300"
                                                                    onClick={() => toggleSection(mainHeading)}
                                                                >
                                                                    {mainHeading.toUpperCase()}
                                                                </div>
                                                                {openSection === mainHeading && (
                                                                    <div className="p-4">
                                                                        {Object.entries(subData).map(([subHeading, items]) =>
                                                                            items && (typeof items === 'string' ? items.split(',') : items).length > 0 ? (
                                                                                <div key={subHeading} className="mb-4">
                                                                                    <h3 className="text-md font-semibold mb-2">{subHeading}</h3>
                                                                                    <table className="w-full border-collapse border border-gray-300">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th className="border border-gray-300 p-2">Label</th>
                                                                                                <th className="border border-gray-300 p-2">Action</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {(typeof items === 'string' ? items.split(',') : items).map(
                                                                                                (url, urlIndex) => (
                                                                                                    <tr key={`${subHeading}-${urlIndex}`}>
                                                                                                        {urlIndex === 0 && (
                                                                                                            <td
                                                                                                                className="border border-gray-300 p-2"
                                                                                                                rowSpan={
                                                                                                                    typeof items === 'string'
                                                                                                                        ? items.split(',').length
                                                                                                                        : items.length
                                                                                                                }
                                                                                                            >
                                                                                                                {subHeading}
                                                                                                            </td>
                                                                                                        )}
                                                                                                        <td className="border border-gray-300 p-2">
                                                                                                            <a
                                                                                                                href={url.trim()}
                                                                                                                target="_blank"
                                                                                                                rel="noopener noreferrer"
                                                                                                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                                                                                            >
                                                                                                                Docs {urlIndex + 1}
                                                                                                            </a>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                )
                                                                                            )}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            ) : null
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        ))
                                        }
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-6">
                            <p>No Data Found</p>
                        </div>
                    )}
                </div>
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
        </div >
    );

};

export default CandidateExcelTrackerStatus;
