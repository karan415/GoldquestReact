import React, { useCallback, useContext, useEffect, useState } from 'react';
import PaginationContext from './PaginationContext';
import Pagination from './Pagination';
import SearchBar from './SearchBar';

const Acknowledgement = () => {
  const { currentItem, showPerPage, setTotalResults } = useContext(PaginationContext);

  const [emailsData, setEmailsData] = useState([]);
  const [paginated, setPaginated] = useState([]);

  const fetchEmails = useCallback(() => {
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");

    fetch(`https://octopus-app-www87.ondigitalocean.app/acknowledgement/list?admin_id=${admin_id}&_token=${storedToken}`)
      .then(response => response.json())
      .then(data => {
        if (data.status && data.customers && Array.isArray(data.customers.data)) {
          setEmailsData(data.customers.data);
          setTotalResults(data.customers.totalResults);
        } else {
          console.error("Invalid response format:", data);
        }
      })
      .catch(error => console.error(error));
  }, [setTotalResults]);

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
      }
      )

      .catch((error) => console.error(error));

  }

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  useEffect(() => {
    if (Array.isArray(emailsData)) {
      const startIndex = (currentItem - 1) * showPerPage;
      const endIndex = startIndex + showPerPage;
      setPaginated(emailsData.slice(startIndex, endIndex));
    } else {
      console.error("emailsData is not an array", emailsData);
    }
  }, [currentItem, emailsData, showPerPage]);

  return (
    <div className='p-4 md:py-16'>
      <div className="text-center">
        <h2 className='md:text-4xl text-2xl font-bold pb-8 md:pb-4'>Acknowledgement Emails</h2>
      </div>
      <SearchBar />
      <div className="overflow-x-auto py-6 px-4 bg-white shadow-md rounded-md md:m-4">
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
            
            {paginated.map((email, index) => (
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
      </div>
      <Pagination />
    </div>
  );
}

export default Acknowledgement;
