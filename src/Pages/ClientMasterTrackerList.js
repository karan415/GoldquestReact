import React, { useCallback, useContext, useEffect, useState } from 'react';
<<<<<<< HEAD
import { useApi } from '../ApiContext';
import Swal from 'sweetalert2';
import { useSidebar } from '../Sidebar/SidebarContext';
import { BranchContextExel } from './BranchContextExel';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const ClientMasterTrackerList = () => {
    const [searchTerm, setSearchTerm] = useState('');
=======
import SearchBar from './SearchBar';
import { Link } from 'react-router-dom';
import { useApi } from '../ApiContext';
import Swal from 'sweetalert2';
import { useSidebar } from '../Sidebar/SidebarContext';
import { BranchContextExel } from './BranchContextExel'; // Import BranchContextExel
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const ClientMasterTrackerList = () => {
    const [selectedStatus, setSelectedStatus] = useState('');

>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092
    const { setBranchId } = useContext(BranchContextExel);
    const API_URL = useApi();
    const { handleTabChange } = useSidebar();
    const [loading, setLoading] = useState(false);
    const [, setError] = useState(null);
    const [data, setData] = useState([]);
    const [branches, setBranches] = useState({});
<<<<<<< HEAD
    const [expandedClient, setExpandedClient] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [options, setOptions] = useState([]);
    const [itemsPerPage, setItemPerPage] = useState(10)
    const fetchClient = useCallback((selected) => {
=======
    const [expandedClient, setExpandedClient] = useState(null); // State to track expanded client
    const [currentPage, setCurrentPage] = useState(1);
    const [options,setOptions] = useState([]);

    //for searching

    const [searchTerm, setSearchTerm] = useState('');


    const itemsPerPage = 10;
    const fetchClient = useCallback(() => {
>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
        setLoading(true);
        setError(null);
        let queryParams;
        if (selected) {
            queryParams = new URLSearchParams({
                admin_id: admin_id || '',
                _token: storedToken || '',
                filter_status: selected || '',
            }).toString();
        } else {
            queryParams = new URLSearchParams({
                admin_id: admin_id || '',
                _token: storedToken || ''
            }).toString();
        }

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


<<<<<<< HEAD
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
            .then((result) => {
                console.log(result);
                setOptions(result.filterOptions);
            })
            .catch((error) => console.error('Error fetching options:', error));
    }, []);


    useEffect(() => {
        fetchSelectOptions();
    }, [fetchSelectOptions])



    const filteredItems = data.filter(item => {
        return (
            item.client_unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase())

        );
    });



    // const filteredOptions = filteredItems.filter(item =>
    //     item.status.toLowerCase().includes(selectedStatus.toLowerCase())
    // );

=======

    // Search logic
    const filteredItems = data.filter(item => {
        return (
            item.client_unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.single_point_of_contact.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

  

    // Log the filtered items to the console
    console.log('Filtered Items:', filteredItems);
>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

<<<<<<< HEAD
=======

>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showPrev = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const showNext = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };
<<<<<<< HEAD


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
=======
>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092

    const handleClick = (branch_id) => {
        setBranchId(branch_id); // Set branch_id in context
        handleTabChange('tracker_status');
    };

<<<<<<< HEAD
    const handleStatusChange = (event) => {
        const selected = event.target.value;
        fetchClient(selected);

    };
    const handleSelectChange = (e) => {

        const selectedValue = e.target.value;
        setItemPerPage(selectedValue)

    }
=======


>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092


    return (
        <>
            <div className="bg-white m-4 md:m-24 shadow-md rounded-md p-3">

<<<<<<< HEAD
                <div className='flex gap-4 justify-end p-4'>
                    <select id="" name='status' onChange={handleStatusChange} className='outline-none border-2 p-2 rounded-md w-5/12 my-4 md:my-0' >
                        <option value="">Select Any Status</option>
                        {options.map((item, index) => {
                            return item.status !== 'closed' ? (
                                <option key={index} value={item.status}>
                                    {item.status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - {item.count}
                                </option>
                            ) : null;
                        })}

                    </select>
                </div>
=======
             
>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092
                <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
                    <div className="col">
                        <form action="">
                            <div className="flex gap-5 justify-between">
<<<<<<< HEAD
                                <select name="" id="" onChange={handleSelectChange} className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
                                    <option value="10">10 Rows</option>
                                    <option value="20">20 Rows</option>
                                    <option value="50">50 Rows</option>
                                    <option value="100">100 Rows</option>
=======
                                <select name="" id="" className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
                                    <option value="100">Show 100 Rows</option>
>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092
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
                                            {index + 1 + (currentPage - 1) * itemsPerPage}
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
<<<<<<< HEAD

=======
                                        
>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092
                                            <button className='bg-red-600 hover:bg-red-200 rounded-md p-2 text-white mx-2'>Delete</button>
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
<<<<<<< HEAD
                        {renderPagination()}
=======
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
>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092
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
