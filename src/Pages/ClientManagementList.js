import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useSidebar } from '../Sidebar/SidebarContext';
import 'reactjs-popup/dist/index.css';
import { useEditClient } from './ClientEditContext';
import { useData } from './DataContext';
import PulseLoader from "react-spinners/PulseLoader";
import { useApi } from '../ApiContext'; // use the custom hook
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import Modal from 'react-modal';
import Popup from 'reactjs-popup';

Modal.setAppElement('#root');
const ClientManagementList = () => {
  const [showPopup, setShowPopup] = useState(false);

  const { handleTabChange } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const { loading, listData, fetchData, isOpen, setIsOpen, services } = useData();

  const API_URL = useApi();
  const { setClientData } = useEditClient();
  const [branches, setBranches] = useState([]);
  const [openAccordionId, setOpenAccordionId] = useState(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, name: '', email: '' });

  const openPopup = (branch) => {
    setEditData({ id: branch.id, name: branch.name, email: branch.email });
    setIsPopupOpen(true); // Only open the popup
  };
  const hasMultipleServices = services.length > 1;
  console.log('services', services)


  const handleEditBranch = async (e) => {
    e.preventDefault();

    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");

    // Validate required fields
    if (!editData.id || !editData.name || !editData.email) {
      Swal.fire(
        'Error!',
        'Missing required fields: Branch ID, Name, or Email',
        'error'
      );
      return;
    }

    // Prepare the request payload
    const raw = JSON.stringify({
      id: editData.id,
      name: editData.name,
      email: editData.email,
      admin_id,
      _token: storedToken,
    });

    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: raw,
    };

    try {
      const response = await fetch(`${API_URL}/branch/update`, requestOptions);
      const result = await response.json();
      const newToken = result._token || result.token; // Update token if provided
      if (newToken) {
        localStorage.setItem("_token", newToken);
      }
     
      if (!response.ok) {
        // Handle server errors gracefully
        const errorData = await response.json();
        if (errorData.message && errorData.message.toLowerCase().includes("invalid") && errorData.message.toLowerCase().includes("token")) {
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
        Swal.fire('Error!', `An error occurred: ${errorData.message || response.statusText}`, 'error');
        return;
      }

      Swal.fire('Success!', 'Branch updated successfully.', 'success');
      toggleAccordion(); // Refresh UI or reload data
      setIsPopupOpen(false); // Close the popup
      closePopup();

    } catch (error) {
      Swal.fire('Error!', 'There was a problem with the update operation.', 'error');
      console.error('Fetch error:', error);
    }
  };

  const [branchLoading, setBranchLoading] = useState(false);
  const [error, setError] = useState(null);
  const toggleAccordion = useCallback((id) => {

    const tdElement = document.getElementById('Branches');
    if (tdElement) {
      tdElement.focus();
    }

    setBranches([]);
    setOpenAccordionId((prevId) => (prevId === id ? null : id));
    setBranchLoading(true);
    setIsOpen(null);
    setError(null);

    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");

    fetch(`${API_URL}/branch/list-by-customer?customer_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then((response) => {
        return response.json().then(result => {
          const newToken = result._token || result.token;
          if (newToken) {
            localStorage.setItem("_token", newToken);
          }
          
          if (!response.ok) {
            if (response.message && response.message.toLowerCase().includes("invalid") && response.message.toLowerCase().includes("token")) {
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
              title: 'Error!',
              text: `An error occurred: ${result.message}`,
              icon: 'error',
              confirmButtonText: 'Ok'
            });
            throw new Error('Network response was not ok');
          }
          return result;
        });
      })
      .then((data) => {
        setBranches(data.branches || []);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setError('Failed to load data');
      })
      .finally(() => setBranchLoading(false));
  }, [API_URL]);

  const closePopup = () => {
    setIsPopupOpen(false);
    setEditData({ id: null, name: '', email: '' });
  };




  const handleSelectChange = (e) => {
    const checkedStatus = e.target.value;
    setItemPerPage(checkedStatus);
  }

  const filteredItems = listData.filter(item => {
    return (
      item.client_unique_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.single_point_of_contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact_person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address?.toLowerCase().includes(searchTerm.toLowerCase())
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
            const result = response.json();
            const newToken = result._token || result.token;
            if (newToken) {
              localStorage.setItem("_token", newToken);
            }
           
            if (!response.ok) {
              if (response.message && response.message.toLowerCase().includes("invalid") && response.message.toLowerCase().includes("token")) {
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
          })
          .then(result => {
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

        fetch(`http://147.93.29.154:5000/branch/inactive-list?branch_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
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
              return response.text().then((text) => {
                const errorData = JSON.parse(text);
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                throw new Error(errorData.message);
              });
            }
            return result;
          })
          .then((result) => {
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

        fetch(`http://147.93.29.154:5000/branch/active?branch_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
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
              return response.text().then((text) => {
                const errorData = JSON.parse(text);
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                throw new Error(errorData.message);
              });
            }
            return result;
          })
          .then((result) => {
            Swal.fire('Unblocked!', 'Your Branch has been Unblocked.', 'success');
            toggleAccordion();
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
              return response.text().then((text) => {
                const errorData = JSON.parse(text);
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                throw new Error(errorData.message);
              });
            }
            return result;
          })
          .then((result) => {
            Swal.fire('Blocked!', 'Your Client has been Blocked.', 'success');
            fetchData();
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
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            Swal.fire('Error!', `Could not Block the Client: ${error.message}`, 'error');
          });
      }
    });
  };

  const handleEditForm = (item) => {
    // Change the tab to 'edit'
    setClientData(item)
    handleTabChange('edit');
  };



  return (
    <>



      <div className="md:grid grid-cols-2 justify-between items-center md:my-4 border-b-2 pb-4 p-3">
        <div className="col">
          <div className="flex gap-5 justify-between">
            <select name="options" onChange={handleSelectChange} className='outline-none  p-3 text-left rounded-md w-6/12'>
              <option value="10">10 Rows</option>
              <option value="20">20 Rows</option>
              <option value="50">50 Rows</option>
              <option value="100">100 Rows</option>
              <option value="200">200 Rows</option>
              <option value="300">300 Rows</option>
              <option value="400">400 Rows</option>
              <option value="500">500 Rows</option>
            </select>
          </div>
        </div>
        <div className="col md:flex justify-end">
          <form action="">
            <div className="flex md:items-stretch items-center gap-3">
              <input
                type="search"
                className='outline-none border-2 p-3 rounded-md w-full my-4 md:my-0'
                placeholder='Search by Client Code...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>
      <h2 className='text-center text-2xl font-bold my-5'>Active Clients</h2>

      <div className="overflow-x-auto py-6 p-3 border m-3 bg-white shadow-md rounded-md">

        {loading ? (
          <div className='flex justify-center items-center py-6 '>
            <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />

          </div>
        ) : currentItems.length > 0 ? (
          <table className="min-w-full mb-4" >
            <thead>
              <tr className='bg-green-500'>
                <th className=" p-3 border-b border-r border-l text-white text-left uppercase whitespace-nowrap text-sm">SL</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Client Code</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Company Name</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Name of Client Spoc</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Date of Service Agreement</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Contact Person</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Mobile</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Client Standard Procedure</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Services</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Address</th>
                <th className=" p-3 border-b border-r text-white text-left uppercase whitespace-nowrap text-sm">Action</th>
              </tr>
            </thead>
            <tbody id='clientListTableTBody'>
              {currentItems.map((item, index) => {

                return (
                  <>
                    <tr key={item.main_id}>
                      <td className=" p-3 border-b border-l border-r text-left whitespace-nowrap text-sm capitalize">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className=" p-3 border-b border-r text-center whitespace-nowrap text-sm capitalize">{item.client_unique_id || 'NIL'}</td>
                      <td className=" p-3 border-b border-r whitespace-nowrap text-sm capitalize">{item.name || 'NIL'}</td>
                      <td className=" p-3 border-b border-r text-center whitespace-nowrap text-sm capitalize">{item.single_point_of_contact || 'NIL'}</td>
                      <td className=" p-3 border-b border-r text-sm text-center cursor-pointer">
                        {new Date(item.agreement_date).getDate()}-
                        {new Date(item.agreement_date).getMonth() + 1}-
                        {new Date(item.agreement_date).getFullYear()}
                      </td>


                      <td className=" p-3 border-b border-r text-center text-sm cursor-pointer">{item.contact_person_name || 'NIL'}</td>
                      <td className=" p-3 border-b border-r text-center text-sm cursor-pointer">{item.mobile || 'NIL'}</td>
                      <td className=" p-3 border-b border-r text-center text-sm cursor-pointer">{item.client_standard || 'NIL'}</td>
                      <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">
                    {services.find(serviceGroup => serviceGroup.customerId === item.main_id)?.services?.length > 0 ? (
                      <>
                        {/* Find the services for this particular client */}
                        {services
                          .find(serviceGroup => serviceGroup.customerId === item.main_id)
                          ?.services?.slice(0, 1)
                          .map((service) => (
                            <div key={service.serviceId} className="py-2 pb-1 text-start flex">
                              <div className="px-4 py-2 bg-green-100 border text-center border-green-500 rounded-lg text-sm">
                                {service.serviceTitle}
                              </div>
                            </div>
                          ))}

                        {/* Check if there are multiple services */}
                        {services
                          .find(serviceGroup => serviceGroup.customerId === item.main_id)
                          ?.services?.length > 1 && (
                            <button
                              className="view-more-btn bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                              onClick={() => setShowPopup(item.main_id)} // Open the popup
                            >
                              View More
                            </button>
                          )}
                      </>
                    ) : (
                      "No services available"
                    )}
                  </td>

                      {/* Popup */}
                      {showPopup === item.main_id && (
                        <div
                          className="popup-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center p-5 justify-center z-50"
                          onClick={() => setShowPopup(null)} // Close the popup when clicking outside
                        >
                          <div
                            className="popup-content bg-white rounded-lg shadow-lg w-6/12 p-6"
                            onClick={(e) => e.stopPropagation()} // Prevent popup close when clicking inside
                          >
                            <button
                              className="close-btn text-gray-500 hover:text-gray-700 absolute top-3 right-3"
                              onClick={() => setShowPopup(null)} // Close the popup when clicking close button
                            >
                              ✕
                            </button>
                            <h3 className="text-xl text-center font-bold mb-4">All Services</h3>
                            <div className="space-y-2 grid p-3 grid-cols-3 gap-3">
                              {/* Display all services for the current client */}
                              {services.find(serviceGroup => serviceGroup.customerId === item.main_id)?.services.map((service) => (
                                <div
                                  key={service.serviceId}
                                  className="px-4 py-2 bg-green-100 border text-center   border-green-500 rounded-lg text-sm"
                                >
                                  <div>{service.serviceTitle}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}



                      <td className=" p-3 border-b border-r whitespace-wrap capitalize  text-sm">{item.address || 'NIL'}</td>
                      <td className=" p-3 border-b border-r text-left whitespace-nowrap text-sm fullwidth">
                        <button className="bg-red-600 hover:bg-red-200 rounded-md p-3 text-white mx-2" onClick={() => blockClient(item.main_id)}>Block</button>
                        <button
                          className="bg-green-600 hover:bg-green-200  text-sm rounded-md p-3 px-5 text-white"
                          onClick={() => handleEditForm(item)}
                        >
                          Edit
                        </button>
                        <button className="bg-red-600 hover:bg-red-200  text-sm rounded-md p-3 text-white mx-2" onClick={() => handleDelete(item.main_id, 'client')}>Delete</button>
                        {item.branch_count > 1 && (
                          <button
                            className="bg-green-600 hover:bg-green-200   text-sm rounded-md p-3 px-5 text-white"
                            onClick={() => toggleAccordion(item.main_id)}
                          >
                            View Branches
                          </button>
                        )}
                      </td>
                    </tr>

                    {openAccordionId === item.main_id && (
                      branchLoading ? (
                        <tr><td colSpan="11">

                          <div className="flex justify-center items-center ">
                            <PulseLoader
                              color="#36D7B7"
                              loading={branchLoading}
                              size={13}
                              aria-label="Loading Spinner"
                            />
                          </div>
                        </td></tr>
                      ) : (
                        branches.map((branch) => {
                          // Use parseInt to ensure the value is treated as a number
                          if (parseInt(branch.is_head, 10) === 1) {
                            return; // Skip this iteration if is_head equals 1
                          }
                          const isActive = branch.status === 0;
                          const isBlocked = branch.status === 1;

                          return (
                            <tr>
                              <td colSpan="11"> {/* Ensures the div spans the entire row */}
                                <div className="w-full flex justify-end">
                                  <table key={branch.id} id="Branches" className="accordion w-4/12 m-0 bg-slate-100 p-3 rounded-md text-left mt-3">
                                    <thead>
                                      <tr>
                                        <th className="p-3 py-2 text-left whitespace-nowrap text-sm">Name</th>
                                        <th className="p-3 py-2 text-left">Email</th>
                                        <th className="p-3 py-2 text-left">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td className="border p-3 py-2 whitespace-nowrap text-sm">{branch.name}</td>
                                        <td className="border p-3 py-2 whitespace-nowrap text-sm">{branch.email}</td>
                                        <td className="border p-3 py-2">
                                          <div className="flex gap-3 items-center">
                                            <button
                                              className="bg-green-600 hover:bg-green-200 rounded-md p-3 px-5 text-white"
                                              onClick={() => openPopup(branch)}
                                            >
                                              Edit
                                            </button>
                                            <button
                                              className="bg-red-600 hover:bg-red-200 rounded-md p-3 text-white mx-2"
                                              onClick={() => handleDelete(branch.id, 'branch')}
                                            >
                                              Delete
                                            </button>
                                            {isActive && (
                                              <button
                                                className="bg-red-600 hover:bg-red-200 rounded-md p-3 text-white mx-2"
                                                onClick={() => blockBranch(branch.id)}
                                              >
                                                Block
                                              </button>
                                            )}
                                            {isBlocked && (
                                              <button
                                                className="bg-green-600 hover:bg-green-200 rounded-md p-3 text-white mx-2"
                                                onClick={() => unblockBranch(branch.id)}
                                              >
                                                Unblock
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>

                          );
                        })
                      )
                    )}
                  </>
                );
              })}
            </tbody>
            <Modal
              isOpen={isPopupOpen}
              onRequestClose={closePopup}
              contentLabel="Edit Branch"
              className="modal"
              overlayClassName="overlay"
            >
              <h2 className="text-lg font-bold mb-4">Edit Branch</h2>
              <form>
                <div className="mb-4">
                  <label className="block text-gray-700">Name:</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="border rounded-md w-full p-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email:</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="border rounded-md w-full p-2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="bg-gray-300 rounded-md px-4 py-2"
                    onClick={closePopup}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-green-600 text-white rounded-md px-4 py-2"
                    onClick={handleEditBranch}
                  >
                    Save
                  </button>
                </div>
              </form>
            </Modal>
          </table>
        ) : (
          <div className="text-center py-6">
            <p>No Data Found</p>
          </div>
        )}


      </div>
      <div className="flex items-center justify-end  p-3 py-2">
        <button
          onClick={showPrev}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white p-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
          className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white p-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Next page"
        >
          <MdArrowForwardIos />
        </button>
      </div>
    </>
  );
};

export default ClientManagementList;