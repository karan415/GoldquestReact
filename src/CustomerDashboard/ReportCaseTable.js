import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../ApiContext';
import PulseLoader from 'react-spinners/PulseLoader';
import Swal from 'sweetalert2';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const ReportCaseTable = () => {
    const [options, setOptions] = useState([]);
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
    const API_URL = useApi();

    const queryParams = new URLSearchParams(location.search);
    const clientId = queryParams.get('clientId');

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


    // Fetch data from the main API
    const fetchData = useCallback(() => {

        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const _token = localStorage.getItem("branch_token");
        if (!branch_id) {
            return;
        }
        else {
            setLoading(true);
        }
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        fetch(`${API_URL}/branch/report-case-status/list?branch_id=${branch_id}&_token=${_token}`, requestOptions)
            .then((response) => {
                const result = response.json();
                const newToken = result._token || result.token;
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
                if (!response.ok) {
                    return response.text().then(text => {
                        const errorData = JSON.parse(text);
                        Swal.fire(
                            'Error!',
                            `An error occurred: ${errorData.message}`,
                            'error'
                        );
                        throw new Error(text);
                    });
                }
                return result;
            })
            .then((result) => {
                setLoading(false);
                setData(result.customers || []);

            })
            .catch((error) => {
                console.error('Fetch error:', error);
            }).finally(() => {
                setLoading(false);
            });

    }, [setData]);

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
        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const _token = localStorage.getItem("branch_token");
        // Return an empty array if servicesList is empty or undefined
        if (!servicesList || servicesList.length === 0) {
            return [];
        }

        try {
            const url = `${API_URL}/branch/report-case-status/services-annexure-data?service_ids=${encodeURIComponent(servicesList)}&application_id=${encodeURIComponent(applicationId)}&branch_id=${encodeURIComponent(branch_id)}&_token=${encodeURIComponent(_token)}`;

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






    useEffect(() => {
        fetchData();
    }, [clientId]);

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

              
                <div className="overflow-x-auto  mx-4 bg-white shadow-md rounded-md">
                    <div className="md:grid grid-cols-2 justify-between items-center md:my-4 border-b-2 pb-4">
                        <div className="col">
                            <form action="">
                                <div className="flex gap-5 justify-between">
                                    <select name="options" id="" onChange={handleSelectChange} className='outline-none border  p-2 text-left rounded-md w-6/12'>
                                        <option value="10">10 Rows</option>
                                        <option value="20">20 Rows</option>
                                        <option value="50">50 Rows</option>
                                        <option value="100">100 Rows</option>
                                        <option value="200">200 Rows</option>
                                        <option value="300">300 Rows</option>
                                        <option value="400">400 Rows</option>
                                        <option value="500">500 Rows</option>
                                    </select>

                                </div>
                            </form>
                        </div>
                        <div className="col md:flex gap-3 placeholder:justify-end ">
                        <select id="" name='status' onChange={handleStatusChange} className='outline-none border-2 p-2 rounded-md w-5/12 my-4 md:my-0' >
                        {options.map((item, index) => {
                            return item.status !== 'closed' ? (
                                <option key={index} value={item.status}>
                                    {item.status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - {item.count}
                                </option>
                            ) : null;
                        })}


                    </select>
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

export default ReportCaseTable;
