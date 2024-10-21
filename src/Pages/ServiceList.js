import React, { useEffect, useState, useContext } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { useService } from './ServiceContext';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';
const ServiceList = () => {
    const API_URL = useApi();
    const { editService, fetchData, loading, data, error } = useService();

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [currentPage, setCurrentPage] = useState(1);
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


    const handleEditService = (service) => {
        editService(service);
        fetchData();
    };

    const handleDelete = (serviceId) => {
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
                    return;
                }

                const requestOptions = {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                fetch(`${API_URL}/service/delete?id=${serviceId}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
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
                    .then(result => {
                        const newToken = result._token || result.token;
                        if (newToken) {
                            localStorage.setItem("_token", newToken);
                        }
                        fetchData();
                        Swal.fire(
                            'Deleted!',
                            'Your service has been deleted.',
                            'success'
                        );
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                    });
            }
        });
    };

    return (
        <div className='overflow-auto'>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <table className="min-w-full">
                <thead>
                    <tr className='bg-green-500'>
                        <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">SL</th>
                        <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Service Name</th>
                        <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Service Description</th>
                        <th className="py-2 px-4 text-white border-r border-b text-center uppercase whitespace-nowrap">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ?
                        (currentItems.map((item, index) => (
                            <tr key={item.index}>
                                <td className="py-2 px-4 border-l border-r border-b whitespace-nowrap">{item.index}</td>
                                <td className="py-2 px-4 border-r border-b whitespace-nowrap">{item.title}</td>
                                <td className="py-2 px-4 border-r border-b whitespace-nowrap">{item.description}</td>
                                <td className="py-2 px-4 border-r border-b whitespace-nowrap text-center">
                                    <button
                                        disabled={loading}
                                        className='bg-green-500 rounded-md hover:bg-green-200 p-2 text-white'
                                        onClick={() => handleEditService(item)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        disabled={loading}
                                        className='bg-red-600 rounded-md p-2 text-white ms-2'
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-6 px-4 border-l border-r text-center border-b whitespace-nowrap">
                                    No data available
                                </td>
                            </tr>
                        )}
                </tbody>
            </table>
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
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={` px-3 py-1 rounded-0 ${currentPage === index + 1 ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}                        >
                            {index + 1}
                        </button>
                    ))}
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
    );
};


export default ServiceList;
