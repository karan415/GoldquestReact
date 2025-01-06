import React, { useCallback, useContext, useEffect, useState } from 'react';

import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import Swal from 'sweetalert2';
import PulseLoader from 'react-spinners/PulseLoader';
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
  
    fetch(`https://api.goldquestglobal.in/acknowledgement/list?admin_id=${admin_id}&_token=${storedToken}`)
      .then(response => response.json())
      .then(data => {
        const newToken = data._token || data.token;
        if (newToken) {
          localStorage.setItem("_token", newToken);
        }
        else if (data.status && data.customers && Array.isArray(data.customers.data)) {
          setEmailsData(data.customers.data);
        } else {
          // Handle unexpected response format
          if (data.message && data.message.toLowerCase().includes("invalid") && data.message.toLowerCase().includes("token")) {
            Swal.fire({
              title: "Session Expired",
              text: "Your session has expired. Please log in again.",
              icon: "warning",
              confirmButtonText: "Ok",
            }).then(() => {
              // Redirect to admin login page
              window.location.href = "/admin-login"; // Replace with your login route
            });
          }
          Swal.fire({
            title: "Error",
            text: data.message || "An unexpected error occurred while fetching emails.",
            icon: "error",
            confirmButtonText: "Ok",
          });
          console.error("Invalid response format:", data);
        }
      })
      .catch(error => {
       
        Swal.fire({
          title: "Error",
          text: error.message || "An error occurred while fetching emails. Please try again.",
          icon: "error",
          confirmButtonText: "Ok",
        });
        console.error(error);
      })
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

    fetch("https://api.goldquestglobal.in/acknowledgement/send-notification", requestOptions)
      .then(response => {
        const result = response.json();
        const newToken = result._token || result.token;
        if (newToken) {
          localStorage.setItem("_token", newToken);
        }
        if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
          Swal.fire({
            title: "Session Expired",
            text: "Your session has expired. Please log in again.",
            icon: "warning",
            confirmButtonText: "Ok",
          }).then(() => {
            // Redirect to admin login page
            window.location.href = "/admin-login"; // Replace with your login route
          });
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
      }).then((result) => {
        const newToken = result._token || result.token;
        if (newToken) {
          localStorage.setItem("_token", newToken);
        }
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
        <h2 className='md:text-4xl text-xl font-bold pb-8 md:pb-4'>Acknowledgement Emails</h2>
      </div>
      <div className="md:grid grid-cols-2 justify-between items-center md:my-4 border-b-2 pb-4">
        <div className="col">
          <form action="">
            <div className="flex gap-5 justify-between">
              <select name="options" onChange={handleSelectChange} id="" className='outline-none p-3  text-left rounded-md w-full md:w-6/12'>
                <option value="10">10 Rows</option>
                <option value="20">20 Rows</option>
                <option value="50">50 Rows</option>
                <option value="200">200 Rows</option>
                <option value="300">300 Rows</option>
                <option value="400">400 Rows</option>
                <option value="500">500 Rows</option>
              </select>
            </div>
          </form>
        </div>
        <div className="col md:flex justify-end ">
          <form action="">
            <div className="flex md:items-stretch items-center  gap-3">
              <input
                type="search"
                className='outline-none border-2 p-2 text-sm rounded-md w-full my-4 md:my-0'
                placeholder='Search by Client Code'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>

      </div>
      <div className="overflow-x-auto py-6 md:px-4 bg-white rounded-md shadow-md">
        {loading ? (
          <div className='flex justify-center items-center py-6 h-full'>
            <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />

          </div>
        ) : currentItems.length > 0 ? (
          <table className="min-w-full md:mb-4">
            <thead>
              <tr className='bg-green-500'>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-sm md:text-lg">SL</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-sm md:text-lg">Client Code</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-sm md:text-lg">Company Name</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-sm md:text-lg">Application Count</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-sm md:text-lg">Send Notification</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((email, index) => (
                <tr key={index}>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 border-l-2 whitespace-nowrap">{index + 1}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.client_unique_id}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.name.trim()}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.applicationCount}</td>
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


      </div>
      <div className="flex items-center justify-end  rounded-md px-4 py-3 sm:px-6 md:m-4 mt-2">
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
  );
};

export default Acknowledgement;