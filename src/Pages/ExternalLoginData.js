import React, { useContext, useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import { Link } from 'react-router-dom';
import { useData } from './DataContext';

const ExternalLoginData = () => {
  const { listData, fetchData, toggleAccordion, branches, openAccordionId } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Set your desired page size

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = listData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white m-4 md:m-24 shadow-md rounded-md p-3">
      <SearchBar />
      {listData.length === 0 ? (
        <p className='text-center'>No data found</p>
      ) : (
        <div className="overflow-x-auto py-6 px-4">
          <table className="min-w-full">
            <thead>
              <tr className='bg-green-500 border'>
                <th className="py-3 px-4 border-b text-white text-left uppercase">SL</th>
                <th className="py-3 px-4 border-b text-white text-left uppercase">Client Code</th>
                <th className="py-3 px-4 border-b text-white text-left uppercase">Company Name</th>
                <th className="py-3 px-4 border-b text-white text-left uppercase">Mobile</th>
                <th className="py-3 px-4 border-b text-white text-center uppercase ">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <React.Fragment key={item.main_id}>
                  <tr className='border'>
                    <td className="py-3 px-4 border-b text-left whitespace-nowrap capitalize">
                      <input type="checkbox" className="me-2" />
                      {indexOfFirstItem + index + 1}
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
        </div>
      )}
      {listData.length > 0 && (
        <Pagination
          totalItems={listData.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ExternalLoginData;
