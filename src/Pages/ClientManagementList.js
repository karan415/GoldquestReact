import React, { useEffect, useState, } from 'react';
import Swal from 'sweetalert2';
import Popup from 'reactjs-popup';
import { useSidebar } from '../Sidebar/SidebarContext';
import 'reactjs-popup/dist/index.css';
import { useEditClient } from './ClientEditContext';
import BranchEditForm from './BranchEditForm';
import { useEditBranch } from './BranchEditContext';
import { useData } from './DataContext';
import PulseLoader from "react-spinners/PulseLoader";
import { useApi } from '../ApiContext'; // use the custom hook
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const ClientManagementList = () => {
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  const [color] = useState("#000");

  const { handleTabChange } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = useApi();
  const { setClientData } = useEditClient();
  const { setBranchEditData } = useEditBranch();
  const { loading, error, listData, fetchData, toggleAccordion, branches, openAccordionId, isOpen, setIsOpen } = useData();

  const [showAllServicesState, setShowAllServicesState] = useState({});
  const toggleAccordions = (id) => {
    setIsOpen((prevId) => (prevId === id ? null : id));
  };
  const handleSelectChange = (e) => {
    const checkedStatus = e.target.value;
    setItemPerPage(checkedStatus);
  }

  const filteredItems = listData.filter(item => {
    return (
      item.client_unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.single_point_of_contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact_person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase())

    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);

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
    fetchData();
  }, [fetchData]);

  const toggleShowAllServices = (id) => {
    setShowAllServicesState((prevState) => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const handleDelete = (id, type) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
        if (!admin_id || !storedToken) {
          console.error("Admin ID or token is missing.");
          return;
        }

        const requestOptions = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        let url;
        let successMessage;

        if (type === 'client') {
          url = `${API_URL}/customer/delete?id=${id}&admin_id=${admin_id}&_token=${storedToken}`;
          successMessage = 'Your client has been deleted.';
        } else if (type === 'branch') {
          url = `${API_URL}/branch/delete?id=${id}&admin_id=${admin_id}&_token=${storedToken}`;
          successMessage = 'Your branch has been deleted.';
        } else {
          console.error("Unknown delete type.");
          return;
        }

        fetch(url, requestOptions)
          .then(response => {
            console.log(response);
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
            return response.json(response);
          })
          .then(result => {
            const newToken = result._token || result.token;
            if (newToken) {
              localStorage.setItem("_token", newToken);
            }
            fetchData();
            Swal.fire(
              'Deleted!',
              successMessage,
              'success'
            );
          })
          .catch(error => {
            console.error('Fetch error:', error);
          });
      }
    });
  };

  const blockBranch = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Block it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        if (!admin_id || !storedToken) {
          console.error("Admin ID or token is missing.");
          Swal.fire('Error!', 'Admin ID or token is missing.', 'error');
          return;
        }

        fetch(`https://octopus-app-www87.ondigitalocean.app/branch/inactive-list?branch_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            if (!response.ok) {
              return response.text().then((text) => {
                const errorData = JSON.parse(text);
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                throw new Error(errorData.message);
              });
            }
            return response.json();
          })
          .then((result) => {
            const newToken = result._token || result.token;
            if (newToken) {
              localStorage.setItem("_token", newToken);
            }
            Swal.fire('Blocked!', 'Your Branch has been Blocked.', 'success');
            toggleAccordion();
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            Swal.fire('Error!', `Could not Block the Branch: ${error.message}`, 'error');
          });
      }
    });
  };

  const unblockBranch = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to unblock this branch!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Unblock it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        if (!admin_id || !storedToken) {
          console.error("Admin ID or token is missing.");
          Swal.fire('Error!', 'Admin ID or token is missing.', 'error');
          return;
        }

        fetch(`https://octopus-app-www87.ondigitalocean.app/branch/active?branch_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            if (!response.ok) {
              return response.text().then((text) => {
                const errorData = JSON.parse(text);
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                throw new Error(errorData.message);
              });
            }
            return response.json();
          })
          .then((result) => {
            const newToken = result._token || result.token;
            if (newToken) {
              localStorage.setItem("_token", newToken);
            }
            Swal.fire('Unblocked!', 'Your Branch has been Unblocked.', 'success');
            toggleAccordion();
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            Swal.fire('Error!', `Could not Unblock the Branch: ${error.message}`, 'error');
          });
      }
    });
  };

  const blockClient = (main_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Block it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        if (!admin_id || !storedToken) {
          console.error("Admin ID or token is missing.");
          Swal.fire('Error!', 'Admin ID or token is missing.', 'error');
          return;
        }

        fetch(`${API_URL}/customer/inactive?customer_id=${main_id}&admin_id=${admin_id}&_token=${storedToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            if (!response.ok) {
              return response.text().then((text) => {
                const errorData = JSON.parse(text);
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                throw new Error(errorData.message);
              });
            }
            return response.json();
          })
          .then((result) => {
            const newToken = result._token || result.token;
            if (newToken) {
              localStorage.setItem("_token", newToken);
            }
            Swal.fire('Blocked!', 'Your Client has been Blocked.', 'success');
            fetchData();
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            Swal.fire('Error!', `Could not Block the Client: ${error.message}`, 'error');
          });
      }
    });
  };

  const handleEditForm = (customerArr) => {
    // Change the tab to 'edit'
    setClientData(customerArr[0])
    handleTabChange('edit');

    // Log the array to console
    console.log(customerArr[0]);
  };



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
      <div className="overflow-x-auto py-6 px-4">

        <table className="min-w-full mb-4">


          <thead>
            <tr className='bg-green-500'>
              <th className="py-3 px-4 border-b border-r border-l text-white text-left uppercase whitespace-nowrap">SL</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Client Code</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Company Name</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Name of Client Spoc</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Date of Service Agreement</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Contact Person</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Mobile</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Services</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Address</th>
              <th className="py-3 px-4 border-b border-r text-white text-left uppercase whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody id='clientListTableTBody'>
            {
             
                currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    const services = JSON.parse(item.services);
                    const showAllServices = showAllServicesState[item.main_id] || false;

                    const result = Array.isArray(services) && services.length > 0 ? services : [];
                    const displayedServices = showAllServices ? result : result.slice(0, 1);

                    return (
                      <tr key={item.main_id}>
                        <td className="py-3 px-4 border-b border-l border-r text-left whitespace-nowrap capitalize">
                          <input type="checkbox" className="me-2" />
                          {index + 1 + (currentPage - 1) * itemsPerPage}
                        </td>
                        <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap capitalize">{item.client_unique_id}</td>
                        <td className="py-3 px-4 border-b border-r whitespace-nowrap capitalize">{item.name}</td>
                        <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap capitalize">{item.single_point_of_contact}</td>
                        <td className="py-3 px-4 border-b border-r text-center cursor-pointer">
                          {new Date(item.agreement_date).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 border-b border-r text-center cursor-pointer">{item.contact_person_name}</td>
                        <td className="py-3 px-4 border-b border-r text-center cursor-pointer">{item.mobile}</td>
                        <td className="py-3 px-4 border-b border-r text-left whitespace-nowrap">
                          {result.length > 0 ? (
                            <div>
                              {displayedServices.map((service, idx) => (
                                <div key={idx} className='flex gap-3'>
                                  <>
                                  <p className='whitespace-nowrap capitalize text-left'>Service: {service.serviceTitle}</p>
                                  <p className='whitespace-nowrap capitalize text-left'>Price: {service.price}</p>

                                    <p className='whitespace-nowrap capitalize text-left'>
                                        Packages: {Object.values(service.packages).filter(Boolean).join(', ')}
                                      </p>
                                  </>
                                </div>
                              ))}

                              {result.length > 1 && !showAllServices && (
                                <button onClick={() => toggleShowAllServices(item.main_id)} className="text-green-500 underline text-left">
                                  Show more
                                </button>
                              )}
                              {showAllServices && (
                                <button onClick={() => toggleShowAllServices(item.main_id)} className="text-green-500 underline">
                                  Show less
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className='whitespace-nowrap capitalize'>No services available.</p>
                          )}
                        </td>
                        <td className="py-3 px-4 border-b border-r whitespace-nowrap capitalize">{item.address}</td>
                        <td className="py-3 px-4 border-b border-r text-left whitespace-nowrap fullwidth">
                          <button className="bg-red-600 hover:bg-red-200 rounded-md p-2 text-white mx-2" onClick={() => blockClient(item.main_id)}>Block</button>
                          <button
                            className="bg-green-600 hover:bg-green-200 rounded-md p-2 px-5 text-white"
                            onClick={() => handleEditForm([{
                              customer_id: item.id || '',
                              emails: item.emails || '',
                              clientData: item.clientData || '',
                              client_standard: item.client_standard || '',
                              additional_login: item.additional_login || '',
                              tat: item.tat_days || '',
                              state: item.state || '',
                              gstin: item.gst_number || '',
                              address: item.address || '',
                              username: item.username || '',
                              state_code: item.state_code || '',
                              agr_upload: item.agr_upload || '',
                              client_spoc: item.single_point_of_contact || '',
                              client_code: item.client_unique_id || '',
                              company_name: item.name || '',
                              mobile_number: item.mobile || '',
                              contact_person: item.contact_person_name || '',
                              date_agreement: item.agreement_date || '',
                              agreement_period: item.agreement_duration || '',
                              name_of_escalation: item.escalation_point_contact || '',
                              custom_template: item.custom_template || '',
                              custom_logo: item.custom_logo || '',
                              custom_address: item.custom_address || '',
                              services: item.services || [],
                            }])}>Edit</button>
                          <button className="bg-red-600 hover:bg-red-200 rounded-md p-2 text-white mx-2" onClick={() => handleDelete(item.main_id, 'client')}>Delete</button>
                          {item.branch_count > 1 && (
                            <button
                              className="bg-green-600 hover:bg-green-200 rounded-md p-2 px-5 text-white"
                              onClick={() => toggleAccordion(item.main_id)}
                            >
                              View Branches
                            </button>
                          )}

                          {openAccordionId === item.main_id && (
                            branches.map((branch) => {
                              const isActive = branch.status === 0;
                              const isBlocked = branch.status === 1;

                              return (
                                <div key={branch.id} className="accordion bg-slate-100 p-2 rounded-md text-left mt-3">
                                  <div
                                    className="accordion_head bg-green-500 w-full p-2 rounded-md mb-3 text-white cursor-pointer"
                                    id={branch.id}
                                    onClick={() => toggleAccordions(branch.id)}
                                  >
                                    <h3 className="branch_name">{branch.name}</h3>
                                  </div>
                                  {isOpen === branch.id && (
                                    <div className="accordion_body">
                                      <ul className='flex gap-2 items-center'>
                                        <li>{branch.email}</li>
                                        <Popup
                                          trigger={<button className="bg-green-600 hover:bg-green-200 rounded-md p-2 px-5 text-white">Edit</button>}
                                          position="right center"
                                          onOpen={() => setBranchEditData({
                                            id: branch.id,
                                            name: branch.name,
                                            email: branch.email
                                          })}
                                        >
                                          <BranchEditForm />
                                        </Popup>
                                        <button className="bg-red-600 hover:bg-red-200 rounded-md p-2 text-white mx-2" onClick={() => handleDelete(branch.id, 'branch')}>Delete</button>
                                        {isActive && (
                                          <button className="bg-red-600 hover:bg-red-200 rounded-md p-2 text-white mx-2" onClick={() => blockBranch(branch.id)}>Block</button>
                                        )}
                                        {isBlocked && (
                                          <button className="bg-green-600 hover:bg-green-200 rounded-md p-2 text-white mx-2" onClick={() => unblockBranch(branch.id)}>Unblock</button>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center">No Data Found</td>
                  </tr>
                )
            
            }


          </tbody>
        </table>
        {loading && !filteredItems.length && <p className='text-center whitespace-nowrap'> <PulseLoader
          color={color}
          loading={loading}
          cssOverride={override}
          size={15}
          aria-label="Loading Spinner"
          data-testid="loader"
        /></p>} {/* Optional loading message */}
      </div>

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
  );
};

export default ClientManagementList;