import React, { useContext, useEffect, useCallback, useState } from 'react';
import PaginationContext from './PaginationContext';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import Swal from 'sweetalert2';

const InactiveClients = () => {
  const [data, setData] = useState([]);
  const [paginated, setPaginated] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const { currentItem, showPerPage, setTotalResults } = useContext(PaginationContext);

  const fetchClients = useCallback(async () => {
    const admin_id = JSON.parse(localStorage.getItem('admin'))?.id;
    const storedToken = localStorage.getItem('_token');

    try {
      const response = await fetch(`https://goldquestreact.onrender.com/customer/inactive-list?admin_id=${admin_id}&_token=${storedToken}`);
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

  const inActive = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, block it!',
      cancelButtonText: 'No, cancel!',
    });

    if (confirm.isConfirmed) {
      const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
      const storedToken = localStorage.getItem("_token");

      if (!admin_id || !storedToken) {
        Swal.fire('Error!', 'Admin ID or token is missing.', 'error');
        return;
      }

      try {
        const response = await fetch(`https://goldquestreact.onrender.com/customer/active?customer_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, { method: 'GET' });
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
        Swal.fire('Blocked!', 'Your package has been blocked.', 'success');
        fetchClients();
      } catch (error) {
        console.error('Fetch error:', error);
        Swal.fire('Error!', `Could not block the package: ${error.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    setTotalResults(data.length);
    const startIndex = (currentItem - 1) * showPerPage;
    const endIndex = startIndex + showPerPage;
    setPaginated(data.slice(startIndex, endIndex));
  }, [currentItem, setTotalResults, data, showPerPage]);

  const handleViewMore = () => {
    setShowAll(prev => !prev);
  };

  return (
    <div className="bg-white m-4 md:m-24 shadow-md rounded-md p-3">
      <SearchBar />
      <div className="overflow-x-auto py-6 px-4">
        {paginated.length === 0 ? (
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
              {paginated.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-4 border-b border-l border-r text-left whitespace-nowrap">
                    <input type="checkbox" className='me-2' />
                    {item.index}
                  </td>
                  <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">{item.client_unique_id}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap">{item.name}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{item.single_point_of_contact}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{item.agreement_date}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{item.contact_person_name}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{item.mobile}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{item.client_standard}</td>
                  <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">
                  {item.services ? (
                    <div className='text-start'>
                      {JSON.parse(item.services).slice(0, showAll ? undefined : 1).map((service, index) => (
                        <div key={service.serviceId} className='py-2 text-start'>
                          <div className='text-start pb-2'><strong>Title:</strong> {service.serviceTitle}</div>
                          <div className='text-start pb-2'><strong>Price:</strong> {service.price}</div>
                          <div className='text-start pb-2'><strong>Packages:</strong> {service.packages ? Object.values(service.packages).join(', ') : 'No packages available'}</div>
                          {index < JSON.parse(item.services).length - 1 && <hr />}
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
                    <button className='bg-red-600 hover:bg-red-200 rounded-md p-2 text-white mx-2' onClick={() => inActive(item.id)}>Unblock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination />
    </div>
  );
};

export default InactiveClients;
