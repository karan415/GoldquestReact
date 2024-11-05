import React, { useCallback, useContext, useEffect, useState } from 'react';

import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import PulseLoader from 'react-spinners/PulseLoader'; // Import the PulseLoader

const Acknowledgement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [emailsData, setEmailsData] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state


  const [searchTerm, setSearchTerm] = useState('');
  const fetchEmails = useCallback(() => {
    setLoading(true); // Start loading
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");

    fetch(`https://octopus-app-www87.ondigitalocean.app/acknowledgement/list?admin_id=${admin_id}&_token=${storedToken}`)
      .then(response => response.json())
      .then(data => {
        const newToken = data._token || data.token;
        if (newToken) {
            localStorage.setItem("_token", newToken);
        }
        if (data.status && data.customers && Array.isArray(data.customers.data)) {
          setEmailsData(data.customers.data);
        } else {
          console.error("Invalid response format:", data);
        }
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false)); // Stop loading
  }, [setEmailsData]);

  const sendApproval = (id) => {
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "admin_id": admin_id,
      "_token": storedToken,
      "customer_id": id
    });

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("https://octopus-app-www87.ondigitalocean.app/acknowledgement/send-notification", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const newToken = result._token || result.token;
        if (newToken) {
            localStorage.setItem("_token", newToken);
        }
        console.log(result);
        fetchEmails();
      })
      .catch((error) => console.error(error));
  };

  const filteredItems = emailsData.filter(item => {
    return (
      item.client_unique_id?.toLowerCase().includes(searchTerm.toLowerCase()) || ''
    )
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

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleSelectChange = (e) => {
    const checkedStatus = e.target.value;
    setItemPerPage(checkedStatus);
  }


  return (
    <div className='p-4 md:py-16'>
      <div className="text-center">
        <h2 className='md:text-4xl text-2xl font-bold pb-8 md:pb-4'>Acknowledgement Emails</h2>
      </div>
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
      <div className="overflow-x-auto py-6 px-4">
      {loading ? (
          <div className='flex justify-center items-center py-6 h-full'>
              <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />
    
          </div>
      ) : currentItems.length > 0 ? (
          <table className="min-w-full mb-4">
            <thead>
              <tr className='bg-green-500'>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">SL</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Client Code</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Company Name</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Application Count</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Case RCVD Date</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Send Notification</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((email, index) => (
                <tr key={index}>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{index + 1}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.client_unique_id}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.name.trim()}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.applicationCount}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.caseReceivedDate || 'N/A'}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">
                    <button
                      className="bg-green-600 text-white py-2 px-7 rounded-md capitalize hover:bg-green-200"
                      type="button"
                      onClick={() => sendApproval(email.id)}
                    >
                      Send
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
  );
};

export default Acknowledgement;