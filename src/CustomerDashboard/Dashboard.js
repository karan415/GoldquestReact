import React, { useEffect, useCallback, useState } from 'react';
import CaseStudy from './CaseStudy';
import Chart from './Chart';
import Chart2 from './Chart2';
import { useApi } from '../ApiContext';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';

const Dashboard = () => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [paginatedData, setPaginatedData] = useState({});
    const API_URL = useApi();
    const [tableData, setTableData] = useState({ clientApplications: {} });

    const fetchDashBoard = useCallback(() => {
        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const _token = localStorage.getItem("branch_token");

        if (!branch_id || !_token) {
            console.error("Branch ID or token is missing.");
            return;
        }

        const url = `${API_URL}/branch?branch_id=${branch_id}&_token=${_token}`;

        fetch(url, {
            method: "GET",
            redirect: "follow",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((result) => {
                console.log(result);
                if (result.clientApplications) {
                    setTableData(result);
                } else {
                    console.error("clientApplications is missing in the response");
                }
            })
            .catch((error) => console.error('Fetch error:', error));
    }, [API_URL]);

    useEffect(() => {
        fetchDashBoard();
    }, [fetchDashBoard]);

    const formatKey = (key) => {
        const formatted = key.replace(/_/g, ' ');
        return formatted.length < 4
            ? formatted.toUpperCase()
            : formatted.replace(/\b\w/g, char => char.toUpperCase());
    };

    const handlePageChange = (pageNumber, status) => {
        console.log(`status - ${status}, pageNumber - ${pageNumber}`);

        setPaginatedData(prevState => {
            // Create a copy of the previous state
            const updatedState = { ...prevState };

            // Check if the status already exists in the state
            if (updatedState[status]) {
                // If it exists, update the pageNumber
                updatedState[status].pageNumber = pageNumber; // Ensure pageNumber is a string
            } else {
                // If it does not exist, create a new entry
                updatedState[status] = { pageNumber: pageNumber }; // Store pageNumber as a string
            }

            return updatedState;
        });

        setCurrentPage(pageNumber);
    };

    console.log(`paginatedData - `, paginatedData);
    const showPrev = (status) => {
        if (currentPage > 1) handlePageChange(currentPage - 1, status);
    };

    const showNext = (status) => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1, status);
    };


    const handleSelectChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page on change
    };

    const calculateTotalPages = (clientApplications, itemsPerPage) => {
        // Calculate the total number of applications
        const totalApplications = Object.values(clientApplications).reduce(
            (sum, appGroup) => sum + appGroup.applications.length,
            0
        );

        // Return the total pages based on the applications count and items per page
        return Math.ceil(totalApplications / itemsPerPage);
    };

    const totalPages = calculateTotalPages(tableData.clientApplications, itemsPerPage);

    const renderPagination = (status, totalPagesNumber) => {
        const pageNumbers = [];
        const totalPages = Math.ceil(totalPagesNumber / itemsPerPage);

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
                    key={`page-${number}`}
                    onClick={() => handlePageChange(number, status)}
                    className={`px-3 py-1 rounded-0 ${currentPage === number ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
                >
                    {number}
                </button>
            )
        ));
    };
    const getPageNumber = (status) => {
        if (paginatedData[status]) {
            return paginatedData[status].pageNumber;
        }
        return 1;
    };
    const getApplicationCountByStatus = (clientApplications, status) => {
        // Check if the status exists in the clientApplications object
        if (clientApplications[status]) {
            // Return the application count for the given status
            return clientApplications[status].applicationCount;
        }

        // If status doesn't exist, return 0
        return 0;
    };
    return (
        <div className="md:p-14 p-4">
            <CaseStudy />
            <div className="my-10">
                <div className="md:flex items-stretch gap-6">
                    <div className="md:w-6/12 bg-white shadow-md rounded-md">
                        <Chart />
                    </div>
                    <div className="md:w-6/12 bg-white shadow-md rounded-md p-3">
                        <Chart2 />
                    </div>
                </div>
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                {tableData.clientApplications && Object.keys(tableData.clientApplications).map((key, index) => {
                    console.log(`getPageNumber(key) - ${getPageNumber(key)},, key - ${key}`);
                    const applicationGroup = tableData.clientApplications[key];
                    const paginatedApplications = applicationGroup.applications.slice(
                        (getPageNumber(key) - 1) * itemsPerPage,
                        getPageNumber(key) * itemsPerPage
                    );
                    const totalNumberOfApplications = getApplicationCountByStatus(tableData.clientApplications, key);

                    return (
                        <div className="overflow-x-auto p-4" key={index}>
                            <h2 className="font-bold text-2xl pb-6 w-full text-center uppercase">
                                {formatKey(key)}
                            </h2>
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
                                            <button className='bg-green-500 p-3 rounded-md hover:bg-green-200 text-white'>Search</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <table className="min-w-full bg-white border">
                                <thead>
                                    <tr className='bg-green-500'>
                                        <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase" scope="col">No</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase" scope="col">Application ID</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase" scope="col">Application Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedApplications.length > 0 ? (
                                        paginatedApplications.map((application, appIndex) => (
                                            <tr key={appIndex}>
                                                <td className="py-3 px-4 border-b text-green-600 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + appIndex + 1}</td>
                                                <td className="py-3 px-4 border-b whitespace-nowrap">{application.client_application_id}</td>
                                                <td className="py-3 px-4 border-b whitespace-nowrap">{application.application_name}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="py-3 px-4 border-b text-center text-gray-500">No applications available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="flex items-center justify-end rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
                                <button
                                    type='button'
                                    onClick={() => showPrev(key)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    aria-label="Previous page"
                                >
                                    <MdArrowBackIosNew />
                                </button>
                                <div className="flex items-center">
                                    {renderPagination(key, totalNumberOfApplications)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => showNext(key)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    aria-label="Next page"
                                >
                                    <MdArrowForwardIos />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
