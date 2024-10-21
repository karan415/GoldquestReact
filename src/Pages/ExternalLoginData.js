import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import { Link } from 'react-router-dom';
import { useData } from './DataContext';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

const ExternalLoginData = () => {
  const { listData, fetchData, toggleAccordion, branches, openAccordionId } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(listData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = listData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const showPrev = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const showNext = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  return (
    <div className="bg-white m-4 md:m-24 shadow-md rounded-md p-3">
      <SearchBar />
      {listData.length === 0 ? (
        <p className='text-center'>Loading...</p>
      ) : (
        <div className="overflow-x-auto py-6 px-4">
          <table className="min-w-full">
            <thead>
              <tr className='bg-green-500 border'>
                <th className="py-3 px-4 border-b text-white text-left uppercase">SL</th>
                <th className="py-3 px-4 border-b text-white text-left uppercase">Client Code</th>
                <th className="py-3 px-4 border-b text-white text-left uppercase">Company Name</th>
                <th className="py-3 px-4 border-b text-white text-left uppercase">Mobile</th>
                <th className="py-3 px-4 border-b text-white text-center uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <React.Fragment key={item.main_id}>
                  <tr className='border'>
                    <td className="py-3 px-4 border-b text-left whitespace-nowrap capitalize">
                      <input type="checkbox" className="me-2" />
                      {index + 1 + indexOfFirstItem}
                    </td>
                    <td className="py-3 px-4 border-b text-center whitespace-nowrap capitalize">{item.client_unique_id}</td>
                    <td className="py-3 px-4 border-b whitespace-nowrap capitalize">{item.name}</td>
                    <td className="py-3 px-4 border-b text-left cursor-pointer">{item.mobile}</td>
                    <td className="py-3 px-4 border-b text-center cursor-pointer">
                      {item.branch_count > 1 && (
                        <button
                          className="bg-green-600 hover:bg-green-200 rounded-md p-2 px-5 text-white"
                          onClick={() => toggleAccordion(item.main_id)}
                        >
                          View Branches
                        </button>
                      )}
                    </td>
                  </tr>

                  {openAccordionId === item.main_id && branches.map(branch => (
                    <tr key={branch.id} className='border'>
                      <td className="py-2 px-4 border-b text-center whitespace-nowrap">{branch.name}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{branch.email}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap text-center uppercase text-blue-500 font-bold">
                        <Link
                          to={`/customer-login?email=${encodeURIComponent(branch.email)}`}
                          target='_blank'
                          className="hover:underline"
                        >
                          Go
                        </Link>
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap text-center">
                        <button className="bg-red-600 hover:bg-red-200 rounded-md p-2 text-white">Delete</button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
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
      )}
    </div>
  );
};

export default ExternalLoginData;
