import React, { useContext, useEffect, useState } from 'react'
import Swal from 'sweetalert2';
import DropBoxContext from './DropBoxContext';
import { useApi } from '../ApiContext';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import ClientForm from './ClientForm';
import PulseLoader from 'react-spinners/PulseLoader';

const DropBoxList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemPerPage] = useState(10)
    const API_URL = useApi();
    const [currentPage, setCurrentPage] = useState(1);
    const { handleEditDrop, fetchClientDrop, listData, loading } = useContext(DropBoxContext)
    useEffect(() => {
        fetchClientDrop();
    }, [fetchClientDrop]);

    const filteredItems = listData.filter(item => {
        return (
            item.application_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())

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

    const handleSelectChange = (e) => {

        const selectedValue = e.target.value;
        setItemPerPage(selectedValue)

    }

    const handleEdit = (client) => {
        fetchClientDrop();
        handleEditDrop(client);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        }).then((result) => {
            if (result.isConfirmed) {
                const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
                const _token = localStorage.getItem("branch_token");

                if (!branch_id || !_token) {
                    console.error("Branch ID or token is missing.");
                    return;
                }

                const requestOptions = {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                fetch(`${API_URL}/branch/client-application/delete?id=${id}&branch_id=${branch_id}&_token=${_token}`, requestOptions)
                    .then(response => {
                        const result = response.json();
                        const newToken = result._token || result.token;
                        if (newToken) {
                            localStorage.setItem("branch_token", newToken);
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
                    .then(result => {
                        const newToken = result._token || result.token;
                        if (newToken) {
                            localStorage.setItem("branch_token", newToken);
                        }

                        // Refresh the client drop data after deletion
                        fetchClientDrop();
                        Swal.fire(
                            'Deleted!',
                            'Your service has been deleted.',
                            'success'
                        );
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                        Swal.fire(
                            'Error!',
                            'An unexpected error occurred while deleting.',
                            'error'
                        );
                    });
            }
        });
    };

    return (
        <>
            <div className=" py-4 md:py-16">
                <h2 className='md:text-4xl text-2xl font-bold pb-8 md:pb-4 text-center'>Client DropBox</h2>
                <div className="m-5">
                    <div>
                        <ClientForm />
                    </div>

                </div>
                <div className="overflow-x-auto py-6 px-4 bg-white shadow-md rounded-md md:m-10 m-3">
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
                        {loading ? (
                            <div className='flex justify-center items-center py-6 h-full'>
                                <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />

                            </div>
                        ) : currentItems.length > 0 ? (
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-green-500">
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">SL NO.</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Photo</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Application Id	</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Employee Name</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Application Date/time</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Location</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Batch Number</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Sub Client</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Documents</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Services</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Packages</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Spoc Case Name</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Employee Id</th>
                                        <th className="py-3 text-center text-white px-4 border-b whitespace-nowrap uppercase">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems.map((report, index) => (
                                        <tr key={index} id={report.id}>
                                            <td className="py-3 px-4 border-b border-r text-center border-l whitespace-nowrap">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                            <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                                                {report.photo ? (
                                                    <img
                                                        src={`https://goldquestreact.onrender.com/${report.photo}`}
                                                        alt={report.photo}
                                                        className='h-20 w-20 rounded-full'
                                                    />
                                                ) : '----'}
                                            </td>
                                            <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">{report.application_id}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.name}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </td>

                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.location}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.batch_number}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.sub_client}</td>
                                            <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                                                {report.attach_documents ? (
                                                    <img
                                                        src={`https://goldquestreact.onrender.com/${report.attach_documents}`}
                                                        alt={report.attach_documents}
                                                        className='h-20 w-20 rounded-full'
                                                    />
                                                ) : '----'}
                                            </td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">
                                                {report.services || 'no data available'}
                                                <button className='block text-blue-600'>{report.more}</button>
                                            </td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.package || 'no data available'}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{report.spoc}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.employee_id}</td>
                                            <td className="py-3 px-4 border-b whitespace-nowrap border-r">
                                                <button className="bg-green-600 text-white p-3 rounded-md hover:bg-green-200" onClick={() => handleEdit(report)}>Edit</button>
                                                <button className="bg-red-600 text-white p-3 ms-2 rounded-md hover:bg-red-200" onClick={() => handleDelete(report.id)}>Delete</button>
                                            </td>
                                        </tr>
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

            </div>

        </>
    )
}

export default DropBoxList