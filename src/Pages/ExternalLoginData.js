import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

const ExternalLoginData = () => {
  const navigate = useNavigate();
  const { listData, fetchData, toggleAccordion, branches, openAccordionId } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleSelectChange = (e) => {
    const checkedStatus = e.target.value;
    setItemPerPage(checkedStatus);
}

const filteredItems = listData.filter(item => {
  return (
      item.client_unique_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.toString().includes(searchTerm)

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



  const getEmail = (email) => {
    localStorage.removeItem("branch");
    localStorage.removeItem("branch_token");
    window.open(`/customer-login?email=${encodeURIComponent(email)}`, '_blank');

}


  return (
    <div className="bg-white m-4 md:m-24 shadow-md rounded-md p-3">
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
      {listData.length === 0 ? (
        <p className='text-center'>Loading...</p>
      ) : (
        <div className="overflow-x-auto py-6 px-4">
         {currentItems.length > 0 ?(
          <>
          
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
                     <button onClick={()=>getEmail(branch.email)}>
                     Go
                   </button>
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
          </>
         ):(
         <><p className='text-center p-5'>Not Found</p></>
         )}

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
           {  renderPagination()}
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