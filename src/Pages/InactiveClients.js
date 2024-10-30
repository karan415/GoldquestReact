import React, { useContext, useEffect, useCallback, useState } from 'react';
import Swal from 'sweetalert2';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

const InactiveClients = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentItems(data.slice(indexOfFirstItem, indexOfLastItem));
  }, [data, currentPage, itemsPerPage]);

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

    return pageNumbers.map((number, index) =>
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
    );
  };

  const fetchClients = useCallback(async () => {
    const admin_id = JSON.parse(localStorage.getItem('admin'))?.id;
    const storedToken = localStorage.getItem('_token');

    try {
      const response = await fetch(`https://octopus-app-www87.ondigitalocean.app/customer/inactive-list?admin_id=${admin_id}&_token=${storedToken}`);
      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
        return;
      }
      const result = await response.json();
      setData(result.customers || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Error!', 'Failed to fetch inactive clients.', 'error');
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const inActive = async (name, id) => {
    const confirm = await Swal.fire({
      title: 'Confirm Action',
      text: `Are you sure you want to activate client ${name} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, activate client',
      cancelButtonText: 'No, keep inactive',
    });


    if (confirm.isConfirmed) {
      const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
      const storedToken = localStorage.getItem("_token");

      if (!admin_id || !storedToken) {
        Swal.fire('Error!', 'Admin ID or token is missing.', 'error');
        return;
      }

      try {
        const response = await fetch(`https://octopus-app-www87.ondigitalocean.app/customer/active?customer_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, { method: 'GET' });
        if (!response.ok) {
          const errorData = await response.json();
          Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
          return;
        }
        const result = await response.json();
        const newToken = result._token || result.token;
        if (newToken) {
          localStorage.setItem("_token", newToken);
        }
        Swal.fire('Success!', `The client ${name} has been successfully unblocked.`, 'success');
        fetchClients();
      } catch (error) {
        console.error('Fetch error:', error);
        Swal.fire('Error', `Failed to unblock the client ${name}: ${error.message}`, 'error');
      }


    }
  };

  const handleViewMore = () => {
    setShowAll(prev => !prev);
  };

  const handleSelectChange = (e) => {
    const selectedValue = parseInt(e.target.value, 10);
    setItemsPerPage(selectedValue);
  };

  return (
    <div className="bg-white m-4 md:m-24 shadow-md rounded-md p-3">
      <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
        <div className="col">
          <form action="">
            <div className="flex gap-5 justify-between">
              <select name="options" onChange={handleSelectChange} className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
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
        {currentItems.length === 0 ? (
          <p>No Inactive Clients Found</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className='bg-green-500'>
                <th className="py-3 px-4 border-b border-r border-l text-white text-left uppercase whitespace-nowrap">SL</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Client Code</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Company Name</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Name of Client Spoc</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Date of Service Agreement</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Contact Person</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Mobile</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Client Standard Procedure</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Services</th>
                <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((client, index) => (
                <tr key={index} className="border">
                  <td className="py-3 px-4 border-b border-l border-r text-left whitespace-nowrap">
                    <input type="checkbox" className='me-2' />
                    {index + 1 + (currentPage - 1) * itemsPerPage}

                  </td>
                  <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">{client.client_unique_id}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap">{client.name}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{client.single_point_of_contact}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{client.agreement_date}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{client.contact_person_name}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{client.mobile}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{client.client_standard}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">
                    {client.services ? (
                      <div className='text-start'>
                        {JSON.parse(client.services).slice(0, showAll ? undefined : 1).map((service, index) => (
                          <div key={service.serviceId} className='py-2 text-start'>
                            <div className='text-start pb-2'><strong>Title:</strong> {service.serviceTitle}</div>
                            <div className='text-start pb-2'><strong>Price:</strong> {service.price}</div>
                            <div className='text-start pb-2'><strong>Packages:</strong> {service.packages ? Object.values(service.packages).join(', ') : 'No packages available'}</div>
                            {index < JSON.parse(client.services).length - 1 && <hr />}
                          </div>
                        ))}
                        <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded' onClick={handleViewMore}>
                          {showAll ? 'View Less' : 'View More'}
                        </button>
                      </div>
                    ) : (
                      'No services available'
                    )}
                  </td>
                  <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                    <button className='bg-red-600 hover:bg-red-200 rounded-md p-2 text-white mx-2' onClick={() => inActive(client.name, client.main_id)}>Unblock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 justify-center">
        <button type="button" onClick={showPrev} className="bg-gray-300 px-2 py-1 rounded">
          <MdArrowBackIosNew />
        </button>
        {renderPagination()}
        <button type="button" onClick={showNext} className="bg-gray-300 px-2 py-1 rounded">
          <MdArrowForwardIos />
        </button>
      </div>
    </div>
  );
};

export default InactiveClients;
