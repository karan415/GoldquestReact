import React, { useEffect, useState, useContext } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { useService } from './ServiceContext';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';
const ServiceList = () => {
    const API_URL = useApi();
    const { editService, fetchData, loading, data, error } = useService();
<<<<<<< HEAD
    const [itemsPerPage, setItemPerPage] = useState(10);
=======

>>>>>>> b0df1336d1b775e3b31451caf2a46aad21d16092
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [currentPage, setCurrentPage] = useState(1);
<<<<<<< HEAD

    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = data.filter(item => {
        return (
            item.title.toLowerCase().includes(searchTerm.toLowerCase())

        );
    });
    const handleSelectChange = (e) => {
        const checkedStatus = e.target.value;
        setItemPerPage(checkedStatus);
    }


    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
=======
    const itemsPerPage = 10;


    const totalPages = Math.ceil(data.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
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


            <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
                <div className="col">
                    <form action="">
                        <div className="flex gap-5 justify-between">
                            <select name="options" onChange={handleSelectChange} id="" className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
                                <option value="10">10 Rows</option>
                                <option value="20">20 Rows</option>
                                <option value="50">50 Rows</option>
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
