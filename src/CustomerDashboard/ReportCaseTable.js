import React, { useContext, useCallback, useEffect, useState } from 'react';
import DropBoxContext from './DropBoxContext';
import { useApi } from '../ApiContext';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

const ReportCaseTable = () => {
    const [serviceHeadings, setServiceHeadings] = useState({});
    const [dbHeadingsStatus, setDBHeadingsStatus] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const API_URL = useApi();
    const { fetchClientDrop, listData } = useContext(DropBoxContext);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        fetchClientDrop().finally(() => setLoading(false));
    }, [fetchClientDrop]);

    const handleToggle = useCallback((index, services, id) => {
        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const _token = localStorage.getItem("branch_token");
        const newExpandedRow = expandedRows === index ? null : index;
        setExpandedRows(newExpandedRow);

        if (newExpandedRow === index && services) {
            setLoading(true); // Set loading to true while fetching service data
            const servicesArray = services.split(',').map(Number);
            const uniqueServiceHeadings = new Set();
            const uniqueStatuses = new Set();

            Promise.all(
                servicesArray.map(serviceId => {
                    const url = `${API_URL}/branch/report-case-status/report-form-json-by-service-id?service_id=${serviceId}&branch_id=${branch_id}&_token=${_token}`;
                    return fetch(url)
                        .then(response => {
                            if (!response.ok) throw new Error('Network response was not ok');
                            return response.json();
                        })
                        .then(result => {
                            setLoading(false); // Stop loading once data is fetched
                            const { reportFormJson } = result;
                            const parsedData = JSON.parse(reportFormJson.json);
                            const { heading, db_table } = parsedData;

                            uniqueServiceHeadings.add(heading);
                            setServiceHeadings(prev => ({
                                ...prev,
                                [id]: Array.from(uniqueServiceHeadings)
                            }));

                            const newToken = result.branch_token || result.token;
                            if (newToken) localStorage.setItem("branch_token", newToken);
                            return db_table;
                        })
                        .catch(error => console.error('Fetch error:', error));
                })
            ).then(parsedDbs => {
                const uniqueDbNames = [...new Set(parsedDbs.filter(Boolean))];

                return Promise.all(uniqueDbNames.map(db_name => {
                    const url = `${API_URL}/branch/report-case-status/annexure-data?application_id=${id}&db_table=${db_name}&branch_id=${branch_id}&_token=${_token}`;
                    return fetch(url)
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                            return response.json();
                        })
                        .then(result => {
                            const status = result?.annexureData?.status || 'N/A';
                            uniqueStatuses.add(status);
                            return { db_table: db_name, status };
                        })
                        .catch(error => console.error("Fetch error: ", error));
                })).then(annexureStatusArr => {
                    setDBHeadingsStatus(prev => ({
                        ...prev,
                        [id]: annexureStatusArr
                    }));
                });
            }).catch(error => console.error("Error during fetch: ", error))
              .finally(() => setLoading(false)); // Stop loading after fetching both data
        }
    }, [expandedRows, API_URL]);
    const filteredItems = listData.filter(item => (
        item.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    ));

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

    const renderPagination = () => {
        const pageNumbers = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > 3) pageNumbers.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                if (!pageNumbers.includes(i)) {
                    pageNumbers.push(i);
                }
            }
            if (currentPage < totalPages - 2) pageNumbers.push('...');
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
                    key={`page-${number}`}
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-1 rounded-0 ${currentPage === number ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
                >
                    {number}
                </button>
            )
        ));
    };

    const handleSelectChange = (e) => {
        setItemsPerPage(Number(e.target.value));
    };

    return (
        <>
            <div className="overflow-x-auto my-14 mx-4 bg-white shadow-md rounded-md">
                <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
                    <div className="col">
                        <form>
                            <div className="flex gap-5 justify-between">
                                <select
                                    onChange={handleSelectChange}
                                    className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'
                                >
                                    <option value="10">10 Rows</option>
                                    <option value="20">20 Rows</option>
                                    <option value="50">50 Rows</option>
                                    <option value="100">100 Rows</option>
                                    <option value="200">200 Rows</option>
                                    <option value="300">300 Rows</option>
                                    <option value="400">400 Rows</option>
                                    <option value="500">500 Rows</option>
                                </select>
                                <button className="bg-green-600 text-white py-3 px-8 rounded-md capitalize" type='button'>Excel</button>
                            </div>
                        </form>
                    </div>
                    <div className="col md:flex justify-end">
                        <form>
                            <div className="flex md:items-stretch items-center gap-3">
                                <input
                                    type="search"
                                    className='outline-none border-2 p-2 rounded-md w-full my-4 md:my-0'
                                    placeholder='Search by Client Code, Company Name, or Client Spoc'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className='bg-green-500 p-3 rounded-md text-white hover:bg-green-200'>Search</button>
                            </div>
                        </form>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="loader">Loading...</div>
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr className='bg-green-500'>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">SL NO</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Application ID</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Client Code</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Client Name</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Employee ID</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Employee Name</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <tr className='border-b even:bg-gray-100'>
                                            <td className='text-center border-r py-4'>{index + indexOfFirstItem + 1}</td>
                                            <td className='text-center border-r'>{item.application_id}</td>
                                            <td className='text-center border-r'>{item.client_code}</td>
                                            <td className='text-center border-r'>{item.name}</td>
                                            <td className='text-center border-r'>{item.employee_id}</td>
                                            <td className='text-center border-r'>{item.employee_name}</td>
                                            <td className='text-center border-r'>
                                                <button className='text-blue-500' onClick={() => handleToggle(index, item.services, item.id)}>View Details</button>
                                            </td>
                                        </tr>
                                        {expandedRows === index && (
                                            <tr className='w-full'>
                                                <td colSpan="9" className="p-0 w-full">
                                              
                                            
                                            
                                            
                                                    <div className='collapseMenu overflow-auto w-full max-w-[1500px]'>
                                                    <table className="min-w-full max-w-full bg-gray-100">
                                                    <thead>
                                                        <tr className='flex w-full'>
                                                            <th className='bg-green-500 text-white text-left border-l p-2 w-1/2'>Service</th>
                                                            <th className='bg-green-500 text-white text-left p-2 w-1/2'>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="h-48 overflow-y-auto block">
                                                        {/* Loop through the serviceHeadings and dbHeadingsStatus arrays and create a new row for each pair */}
                                                        {serviceHeadings[item.id]?.map((serviceValue, index) => {
                                                            const formattedService = serviceValue?.replace(/\//g, '').toUpperCase() || 'NIL';
                                                
                                                            // Check if dbHeadingsStatus has a corresponding index for the service
                                                            const statusValue = dbHeadingsStatus[item.id]?.[index]?.status || 'NIL';
                                                            const formattedStatus = statusValue
                                                                .replace(/_/g, ' ') // Replace underscores with spaces
                                                                .toLowerCase() // Convert the whole string to lowercase
                                                                .split(' ') // Split the string into words
                                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
                                                                .join(' ');
                                                
                                                            return (
                                                                <tr key={index} className="flex w-full">
                                                                    {/* Display the formatted service */}
                                                                    <td className="py-3 px-4 border-b whitespace-nowrap capitalize w-1/2">
                                                                        {formattedService}
                                                                    </td>
                                                                    {/* Display the formatted status */}
                                                                    <td className="py-3 px-4 border-b whitespace-nowrap capitalize w-1/2">
                                                                        {formattedStatus}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                                
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className='text-center py-4'>No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
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
        </>
    );
};

export default ReportCaseTable;