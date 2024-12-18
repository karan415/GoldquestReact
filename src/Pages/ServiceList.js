import React, { useEffect, useState } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { useService } from './ServiceContext';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';
import PulseLoader from 'react-spinners/PulseLoader'; // Import the PulseLoader

const ServiceList = () => {
    const API_URL = useApi();
    const { editService, fetchData, loading, data, error } = useService();
    const [itemsPerPage, setItemPerPage] = useState(10);
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [currentPage, setCurrentPage] = useState(1);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = data.filter(item => {
        return (
            item?.title.toLowerCase().includes(searchTerm.toLowerCase())

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
                    .then(result => {

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
        
      
        <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
          <div className="col">
            <form action="">
              <div className="flex gap-5 justify-between">
                <select
                  name="options"
                  onChange={handleSelectChange}
                  className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'
                >
                  <option value="10">10 Rows</option>
                  <option value="20">20 Rows</option>
                  <option value="50">50 Rows</option>
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
            <form action="">
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
      
        <div className="overflow-x-auto py-6 px-4">
          {loading ? (
            <div className='flex justify-center items-center py-6 h-full'>
              <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />
            </div>
          ) : currentItems.length > 0 ? (
            <table className="min-w-full mb-4">
              <thead>
                <tr className='bg-green-500'>
                  <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">SL</th>
                  <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Service Name</th>
                  <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Service Description</th>
                  <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">SAC Code</th>
                  <th className="py-2 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Short Code</th>
                  <th className="py-2 px-4 text-white border-r border-b text-center uppercase whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-4 border-l border-r border-b whitespace-nowrap">{item.index}</td>
                    <td className="py-2 px-4 border-r border-b whitespace-nowrap">{item.title}</td>
                    <td className="py-2 px-4 border-r border-b">{item.description}</td>
                    <td className="py-2 px-4 border-r border-b">{item.sac_code}</td>
                    <td className="py-2 px-4 border-r border-b">{item.short_code}</td>
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
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6">
              <p>No Data Found</p>
            </div>
          )}
      
        </div>
        <div className="flex items-center justify-end rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
            <button
              onClick={showPrev}
              disabled={currentPage === 1}
              className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
              className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              aria-label="Next page"
            >
              <MdArrowForwardIos />
            </button>
          </div>
      </div>
      
    );
};

export default ServiceList;