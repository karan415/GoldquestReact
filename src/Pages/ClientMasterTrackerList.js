import React, { useCallback, useContext, useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import { Link } from 'react-router-dom';
import { useApi } from '../ApiContext';
import Swal from 'sweetalert2';
import { useSidebar } from '../Sidebar/SidebarContext';
import { BranchContextExel } from './BranchContextExel'; // Import BranchContextExel
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const ClientMasterTrackerList = () => {
    const { setBranchId } = useContext(BranchContextExel);
    const API_URL = useApi();
    const { handleTabChange } = useSidebar();
    const [loading, setLoading] = useState(false);
    const [, setError] = useState(null);
    const [data, setData] = useState([]);
    const [branches, setBranches] = useState({});
    const [expandedClient, setExpandedClient] = useState(null); // State to track expanded client
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;
    const fetchClient = useCallback(() => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
            admin_id: admin_id || '',
            _token: storedToken || ''
        }).toString();
        fetch(`${API_URL}/client-master-tracker/list?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
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
                return response.json();
            })
            .then((data) => {
                const newToken = data._token || data.token;
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
                setData(data.customers || []);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, [setData]);

    const handleBranches = useCallback((id) => {
        setLoading(true);
        setError(null);
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        fetch(`${API_URL}/client-master-tracker/branch-list-by-customer?customer_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
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
                return response.json();
            })
            .then((data) => {
                const newToken = data._token || data.token;
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
                setBranches(prev => ({ ...prev, [id]: data.customers || [] }));

                setExpandedClient(prev => (prev === id ? null : id)); // Toggle branches visibility
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchClient();
    }, [fetchClient]);




    const totalPages = Math.ceil(data.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showPrev = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const showNext = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };

    const handleClick = (branch_id) => {
        setBranchId(branch_id); // Set branch_id in context
        handleTabChange('tracker_status');
    };

    return (
        <>
            <div className="bg-white m-4 md:m-24 shadow-md rounded-md p-3">
                <SearchBar />

                <div className="overflow-x-auto py-6 px-4">
                    <table className="min-w-full">
                        <thead>
                            <tr className='bg-green-500'>
                                <th className="py-3 px-4 border-b border-r border-l text-white text-left uppercase whitespace-nowrap">SL</th>
                                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Client Code</th>
                                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Company Name</th>
                                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Client Spoc</th>
                                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Active Cases</th>
                                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-3 px-4 border-b border-l border-r text-left whitespace-nowrap">
                                            <input type="checkbox" className='me-2' />
                                            {index + 1}
                                        </td>
                                        <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">{item.client_unique_id}</td>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap">{item.name}</td>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{item.single_point_of_contact}</td>
                                        <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center cursor-pointer">{item.application_count}</td>
                                        <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                                            <button
                                                className='bg-green-600 hover:bg-green-200 rounded-md p-2 px-5 me-2 text-white'
                                                onClick={() => handleBranches(item.main_id)}>
                                                {expandedClient === item.main_id ? 'Hide Branches' : 'View Branches'}
                                            </button>

                                            <Link to=''>
                                                <button className='bg-green-600 hover:bg-green-200 rounded-md p-2 text-white'>Check In</button>
                                            </Link>
                                            <button className='bg-red-600 hover:bg-red-200 rounded-md p-2 text-white mx-2'>Delete</button>
                                            <button className='bg-green-600 hover:bg-green-200 rounded-md p-2 px-5 text-white'>Excel</button>
                                            {expandedClient === item.main_id && (
                                                branches[item.main_id]?.map((branch, branchIndex) => (
                                                    <tr key={branchIndex} className='w-full'>
                                                        <td className=' w:4/12 py-3 px-4 border-b border-r border-l whitespace-nowrap text-center text-bold'>{branch.branch_name}</td>
                                                        <td className=' w:4/12 py-3 px-4 border-b border-r border-l whitespace-nowrap text-center text-bold'>{branch.application_count}</td>
                                                        <td className=' w:4/12 py-3 px-4 border-b border-r border-l whitespace-nowrap text-center'>
                                                            <button className='bg-green-600 hover:bg-green-200 rounded-md p-2 text-white' onClick={() => handleClick(branch.branch_id)}>Check In</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className='text-center whitespace-nowrap'>No Data Available</tr>
                            )}
                        </tbody>
                        {loading && <div className="text-center">Loading...</div>}
                    </table>
                </div>
                <div className="flex items-center justify-end  rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
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
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                type="button"
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={` px-3 py-1 rounded-0 ${currentPage === index + 1 ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
                            >
                                {index + 1}
                            </button>
                        ))}
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

export default ClientMasterTrackerList;
