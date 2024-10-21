import React, { useCallback, useContext, useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

const Acknowledgement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [emailsData, setEmailsData] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [paginated, setPaginated] = useState([]);

  const fetchEmails = useCallback(() => {
    setLoading(true); // Start loading
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");

    fetch(`https://octopus-app-www87.ondigitalocean.app/acknowledgement/list?admin_id=${admin_id}&_token=${storedToken}`)
      .then(response => response.json())
      .then(data => {
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
        console.log(result);
        fetchEmails();
      })
      .catch((error) => console.error(error));
  };

  const totalPages = Math.ceil(emailsData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = emailsData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const showPrev = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const showNext = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return (
    <div className='p-4 md:py-16'>
      <div className="text-center">
        <h2 className='md:text-4xl text-2xl font-bold pb-8 md:pb-4'>Acknowledgement Emails</h2>
      </div>
      <SearchBar />
      <div className="overflow-x-auto py-6 px-4 bg-white shadow-md rounded-md md:m-4">
        {loading ? ( // Show loading indicator
          <div className="text-center py-4">
            <p>Loading...</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className='bg-green-500'>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">SL</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Client Code</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Company Name</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Application Count</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Case RCVD Date</th>
                <th className="py-3 text-left text-white px-4 border-b-2 border-r-2 whitespace-nowrap uppercase text-lg">Send Approvals</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((email, index) => (
                <tr key={index}>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{index + 1}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.client_unique_id}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.name.trim()}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{email.applicationCount}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">{/* Case Received Date */}</td>
                  <td className="py-3 px-4 border-b-2 text-center border-r-2 whitespace-nowrap">
                    <button className="bg-green-600 text-white py-2 px-7 rounded-md capitalize hover:bg-green-200" type='button' onClick={() => sendApproval(email.id)} >Send Approval</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              type="button"
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded-0 ${currentPage === index + 1 ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
            >
              {index + 1}
            </button>
          ))}
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
  );
};

export default Acknowledgement;
