import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

const TatDelay = () => {
  const [selectedStatus, setSelectedStatus] = useState('');

  const [itemsPerPage, setItemPerPage] = useState(10)

  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [tatData, setTatData] = useState([])



  const totalPages = Math.ceil(tatData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tatData.slice(indexOfFirstItem, indexOfLastItem);

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










  const fetchTat = useCallback(() => {
    const admin_id = JSON.parse(localStorage.getItem('admin'))?.id;
    const storedToken = localStorage.getItem('_token');

    // Ensure admin_id and storedToken are available
    if (!admin_id || !storedToken) {
      console.error("Admin ID or token is missing.");
      return;
    }

    // Use template literals for better readability
    const url = `https://octopus-app-www87.ondigitalocean.app/tat-delay/list?admin_id=${admin_id}&_token=${storedToken}`;

    fetch(url, {
      method: "GET",
      redirect: "follow", // You can keep this if you need to follow redirects
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Assuming the response is JSON
      })
      .then((result) => {
        const applications = result.tatDelays.applicationHierarchy.flatMap(customer =>
          customer.branches.flatMap(branch =>
            branch.applications.map(application => ({
              ...application,
              customer_id: customer.customer_id,
              customer_name: customer.customer_name,
              customer_emails: customer.customer_emails,
              customer_unique_id: customer.customer_unique_id,
              customer_mobile: customer.customer_mobile,
              tat_days: customer.tat_days,
              branch_id: branch.branch_id,
              branch_name: branch.branch_name,
              branch_email: branch.branch_email,
              branch_mobile: branch.branch_mobile
            }))
          )
        );
        setTatData(applications)

        // Handle the result here (e.g., set state)
      })
      .catch((error) => console.error('Fetch error:', error));
  }, []);

  useEffect(() => {
    fetchTat();
  }, [fetchTat]);

  const handleSelectChange = (e) => {

    const selectedValue = e.target.value;
    setItemPerPage(selectedValue)
  }

  return (
    <>
      <div className="m-4 md:py-16">
        <div className="text-center">
          <h2 className='md:text-4xl text-2xl font-bold pb-8 md:pb-4'>Tat Delay Notifications</h2>
        </div>
        <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
          <div className="col">
            <form action="">
              <div className="flex gap-5 justify-between">
                <select name="options" id="" onChange={handleSelectChange} className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
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
        <div className="overflow-x-auto py-6 px-4 bg-white shadow-md m-4 rounded-md ">
          <table className="min-w-full table-auto">
            <thead>
              <tr className='bg-green-500'>
                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap text-white border-r">SL</th>
                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap text-white border-r">Tat Days</th>
                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap text-white border-r">Initiation Date</th>
                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap text-white border-r">Application Id</th>
                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap text-white border-r">Employee Name</th>
                <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap text-white ">Exceed Days</th>
              </tr>
            </thead>
            <tbody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4 border-b border-l whitespace-nowrap text-center border-r">{index + 1}</td>
                    <td className="py-3 px-4 border-b whitespace-nowrap text-center border-r">{item.tat_days}</td>
                    <td className="py-3 px-4 border-b whitespace-nowrap text-center border-r">{item.application_created_at}</td>
                    <td className="py-3 px-4 border-b whitespace-nowrap text-center border-r">{item.application_id}</td>
                    <td className="py-3 px-4 border-b whitespace-nowrap text-left border-r">{item.application_name}</td>
                    <td className="py-3 px-4 border-b whitespace-nowrap text-center border-r">{item.days_out_of_tat}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-3 px-4 border-b text-center text-gray-500">No TAT Delay Applications Available</td>
                </tr>
              )}
            </tbody>

          </table>
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
      </div>
    </>
  )
}

export default TatDelay