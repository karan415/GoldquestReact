import React, { useContext, useEffect, useState } from 'react';
import PaginationContext from './PaginationContext';
import Pagination from './Pagination';
import { usePackage } from './PackageContext';
import Swal from 'sweetalert2';
import SearchBar from './SearchBar';
import { useApi } from '../ApiContext';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const PackageManagementList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const { editPackage, data, loading, fetchData, error, setError } = usePackage();

    const API_URL = useApi();
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    
    const itemsPerPage = 10;
    
    
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

    const handleEdit = (pkg) => {
        editPackage(pkg);
    };




    const handleDelete = (packageId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        }).then((result) => {
            if (result.isConfirmed) {
                const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
                const storedToken = localStorage.getItem("_token");

                if (!admin_id || !storedToken) {
                    console.error("Admin ID or token is missing.");
                    Swal.fire('Error!', 'Admin ID or token is missing.', 'error');
                    return;
                }

                const requestOptions = {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                fetch(`${API_URL}/package/delete?id=${packageId}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
                    .then((response) => {
                        if (!response.ok) {
                            return response.text().then((text) => {
                                const errorData = JSON.parse(text);
                                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                                throw new Error(errorData.message);
                            });
                        }
                        return response.json();
                    })
                    .then((result) => {
                        const newToken = result._token || result.token;
                        if (newToken) {
                            localStorage.setItem("_token", newToken);
                        }
                        setError(null); // Reset error state
                        // Refresh data after deletion
                        Swal.fire('Deleted!', 'Your package has been deleted.', 'success');
                        fetchData();
                    })
                    .catch((error) => {
                        console.error('Fetch error:', error);
                        Swal.fire('Error!', `Could not delete the package: ${error.message}`, 'error');
                        setError('Failed to delete package.');
                    });
            }
        });
    };


    return (
        <>
            <div className="overflow-x-auto py-4 px-4">
                {error && <div className="text-red-500 text-center">{error}</div>}
                <SearchBar />
                <table className="min-w-full">
                    <thead>
                        <tr className='bg-green-500'>
                            <th className="py-2 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Sl</th>
                            <th className="py-2 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Package Name</th>
                            <th className="py-2 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Description</th>
                            <th className="py-2 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="py-2 px-4 border-b capitalize border-r border-l whitespace-nowrap">
                                        { index + 1}
                                    </td>
                                    <td className="py-2 px-4 border-b capitalize border-r border-l whitespace-nowrap">
                                        {item.title}
                                    </td>
                                    <td className="py-2 px-4 border-b capitalize border-r whitespace-nowrap">
                                        {item.description}
                                    </td>
                                    <td className="py-2 px-4 border-b capitalize border-r whitespace-nowrap">
                                        <button
                                            className='bg-green-500 hover:bg-green-200 rounded-md p-2 me-2 text-white'
                                            onClick={() => handleEdit(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className='bg-red-600 rounded-md p-2 text-white'
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-6 px-4 text-center border-b border-r border-l">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
            {loading && <div className="text-center">Loading...</div>}
            <div className="flex items-center justify-end  rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2" >
                <button
                    type="button"
                    onClick={showPrev}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    aria-label="Previous page" >
                <MdArrowBackIosNew />
            </button>
            <div className="flex items-center" >
                {
                    Array.from({ length: totalPages }, (_, index) => (
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
                aria-label="Next page">
            <MdArrowForwardIos />
        </button>
            </div>

        </>
    );
};

export default PackageManagementList;
