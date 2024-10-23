import React, { useContext, useEffect, useState } from 'react';
import DropBoxContext from './DropBoxContext';
import { useApi } from '../ApiContext';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

const ReportCaseTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemPerPage] = useState(10);
    const API_URL = useApi();
    const { fetchClientDrop, listData } = useContext(DropBoxContext);
    const [serviceTitle, setServiceTitle] = useState([]);
    const [loading, setLoading] = useState(false); // Add loading state
    const [expandedRows, setExpandedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
console.log('serviceTitle',serviceTitle)
    useEffect(() => {
        setLoading(true); // Set loading to true before fetching data
        fetchClientDrop().finally(() => setLoading(false)); // Set loading to false after fetching
    }, [fetchClientDrop]);

    const handleToggle = (index, services, branch_id, id) => {
        const servicesArray = services.split(',').map(Number);
        const storedToken = localStorage.getItem("branch_token");

        const newExpandedRows = expandedRows.includes(index)
            ? expandedRows.filter((row) => row !== index)
            : [...expandedRows, index];

        setExpandedRows(newExpandedRows);
        setLoading(true); // Start loading when toggling

        const fetchPromises = servicesArray.map(serviceId => {
            const url = `${API_URL}/branch/annexure-by-service?service_id=${serviceId}&application_id=${id}&branch_id=${branch_id}&_token=${storedToken}`;
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            return fetch(url, requestOptions)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                });
        });

        Promise.all(fetchPromises)
            .then(results => {
                const serviceHeading = {};
                
                results.forEach(serviceTitle => {
                    console.log('serviceTitle',serviceTitle)
                    if (typeof serviceTitle === 'object' && serviceTitle !== null) {
                        const hasHeading = serviceTitle.hasOwnProperty('heading');
                        const hasAnnexureData = serviceTitle.annexureData && typeof serviceTitle.annexureData === 'object';
                
                        const entry = {
                            heading: hasHeading ? serviceTitle.heading || '' : '',
                            status: hasAnnexureData ? serviceTitle.annexureData.status || '' : ''
                        };
                
                        if (!serviceHeading[id]) {
                            serviceHeading[id] = [];
                        }
                        serviceHeading[id].push(entry);
                    }
                });
                
                setServiceTitle(serviceHeading);
            })
            .catch(error => {
                console.error('Error fetching service info:', error);
            })
            .finally(() => setLoading(false)); // End loading after fetching
    };

    const filteredItems = listData.filter(item => {
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
        const selectedValue = e.target.value;
        setItemPerPage(selectedValue);
    };

    return (
        <>
            <div className="overflow-x-auto my-14 mx-4 bg-white shadow-md rounded-md">
                <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
                    <div className="col">
                        <form action="">
                            <div className="flex gap-5 justify-between">
                                <select name="" id="" onChange={handleSelectChange} className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
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
                                <button className='bg-green-500 p-3 rounded-md text-white hover:bg-green-200'>Search</button>
                            </div>
                        </form>
                    </div>
                </div>
                {loading ? ( // Show loader while loading
                    <div className="flex justify-center items-center h-64">
                        <div className="loader">Loading...</div>
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr className='bg-green-500'>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">SL NO</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Application ID</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">NAME OF THE APPLICANT</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">APPLICANT EMPLOYEE ID</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Initiation Date</th>
                                <th className="py-3 px-4 border-b text-left border-r uppercase whitespace-nowrap text-white">Report Date</th>
                                <th className="py-3 px-4 border-b text-center uppercase whitespace-nowrap text-white">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap">
                                            <input type="checkbox" name="" id="" className='me-2' />{index + 1 + (currentPage - 1) * itemsPerPage}
                                        </td>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap">{item.application_id}</td>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap">{item.name}</td>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap">{item.employee_id}</td>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap">{item.created_at}</td>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap">{item.report_date}</td>
                                        <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                                            <button
                                                className="bg-green-500 hover:bg-green-400 rounded-md p-2 px-3 text-white"
                                                onClick={() => handleToggle(index, item.services, item.branch_id, item.id)}
                                            >
                                                {expandedRows.includes(index) ? "Hide Details" : "View More"}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRows.includes(index) && (
                                        <tr className='w-full'>
                                            <td colSpan="9" className="p-0 w-full">
                                                <div className='collapseMenu overflow-auto w-full max-w-[1500px]'>
                                                    <table className="min-w-full max-w-full bg-gray-100 overflow-auto">
                                                        <thead>
                                                            <tr className=''>
                                                                {serviceTitle[item.id] && serviceTitle[item.id].map((service, serviceIndex) => (
                                                                    <th key={serviceIndex} className="py-3 px-4 border-b text-center text-sm uppercase whitespace-nowrap ">{service.heading || 'N/A'}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                {serviceTitle[item.id] && serviceTitle[item.id].map((service, serviceIndex) => (
                                                                    <td key={serviceIndex} className="py-3 px-4 border-b whitespace-nowrap text-center">{service.status || 'N/A'}</td>
                                                                ))}
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
                )}
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
        </>
    );
};

export default ReportCaseTable;