import React, { useEffect, useState } from 'react';
import { useService } from './ServiceContext';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';

const ServiceForm = () => {
  const API_URL = useApi();
  const { selectedService, updateServiceList, setSelectedService,fetchData } = useService();
  const [adminId, setAdminId] = useState(null);
  const [storedToken, setStoredToken] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceInput, setServiceInput] = useState({
    name: "",
    d_name: "",
    short_code: "",
    sac_code: "",
    group:""
  });
  const [error, setError] = useState({});

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("admin"));
    const token = localStorage.getItem("_token");
    if (adminData) setAdminId(adminData.id);
    if (token) setStoredToken(token);
    if (selectedService) {
      setServiceInput({
        name: selectedService.title || '',
        d_name: selectedService.description || '',
        sac_code: selectedService.sac_code || '',
        group: selectedService.group || '',
        short_code: selectedService.short_code || '',
      });
      setIsEdit(true);
    } else {
      setServiceInput({
        name: "",
        d_name: "",
        short_code: "",
        sac_code: "",
        group: "",
      });
      setIsEdit(false);
    }
  }, [selectedService]);

  const validate = () => {
    const newErrors = {};
    if (!serviceInput.name) {
      newErrors.name = 'This Field is Required!';
    }
    if (!serviceInput.d_name) {
      newErrors.d_name = 'This Field is Required!';
    }
    if (!serviceInput.sac_code) {
      newErrors.sac_code = 'This Field is Required!';
    }
    if (!serviceInput.short_code) {
      newErrors.short_code = 'This Field is Required!';
    }
    if (!serviceInput.group) {
      newErrors.group = 'This Field is Required!';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceInput((prevInput) => ({
      ...prevInput, [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validateError = validate();

    if (Object.keys(validateError).length === 0) {
      setError({})
      setLoading(true); // Start loading
      const requestOptions = {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedService?.id || '',
          title: serviceInput.name,
          description: serviceInput.d_name,
          short_code: serviceInput.short_code,
          group: serviceInput.group,
          sac_code: serviceInput.sac_code,
          admin_id: adminId,
          _token: storedToken,
        }),
      };

      const url = isEdit
        ? `${API_URL}/service/update`
        : `${API_URL}/service/create`;

      fetch(url, requestOptions)
        .then((response) => {
          return response.json().then((result) => {
            // Check if response is not OK
            if (!response.ok) {
              if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
                Swal.fire({
                  title: "Session Expired",
                  text: "Your session has expired. Please log in again.",
                  icon: "warning",
                  confirmButtonText: "Ok",
                }).then(() => {
                  // Redirect to admin login page
                  window.location.href = "admin-login"; // Replace with your login route
                });
              }
              const errorMessage = result.message || "An unknown error occurred";
              Swal.fire({
                title: "Error!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Ok",
              });
              throw new Error(errorMessage);
            }

            // Success: Show API message or fallback
            Swal.fire({
              title: "Success!",
              text: result.message || (isEdit ? "Service updated successfully" : "Service added successfully"),
              icon: "success",
              confirmButtonText: "Ok",
            });

            // Handle the token (if provided)
            const newToken = result._token || result.token;
            if (newToken) {
              localStorage.setItem("_token", newToken);
            }
           

            return result;
          });
        })
        .then((result) => {
          setError({});
          if (isEdit) {
            // Update the service list for editing
            updateServiceList((prevList) =>
              prevList.map((service) => (service.id === result.id ? result : service))
            );
          } else {
            updateServiceList((prevList) => [...prevList, result]);
          }

          fetchData(); // Refresh data
          setServiceInput({ name: "", d_name: "", sac_code: "", short_code: "" ,group:""});
          setIsEdit(false);
        })
        .catch((error) => {
          console.error("API Error:", error.message);
        })
        .finally(() => {
          setLoading(false); // Stop loading
        });
    } else {
      setError(validateError);
    }
  };

  const resetForm=()=>{
    setServiceInput({ name: "", d_name: "", sac_code: "", short_code: "" ,group:""});
    setError({});
    setSelectedService({name: "", d_name: "", sac_code: "", short_code: "" ,group:""})

  }

  return (
    <form onSubmit={handleSubmit} disabled={loading}>
      <div className="mb-4">
        <label htmlFor="ServiceName" className="block">Service Name<span className='text-red-500'>*</span></label>
        <input
          type="text"
          name="name"
          id="ServiceName"
          value={serviceInput.name}
          onChange={handleChange}
          className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
        {error.name && <p className='text-red-500'>{error.name}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="ServiceDisplayName" className="block">Service Description<span className='text-red-500'>*</span></label>
        <input
          type="text"
          name="d_name"
          id="ServiceDisplayName"
          value={serviceInput.d_name}
          onChange={handleChange}
          className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
        {error.d_name && <p className='text-red-500'>{error.d_name}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="sac_code" className="block">SAC<span className='text-red-500'>*</span></label>
        <input
          type="text"
          name="sac_code"
          id="sac_code"
          value={serviceInput.sac_code}
          onChange={handleChange}
          className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
        {error.sac_code && <p className='text-red-500'>{error.sac_code}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="short_code" className="block">Short Code<span className='text-red-500'>*</span></label>
        <input
          type="text"
          name="short_code"
          id="short_code"
          value={serviceInput.short_code}
          onChange={handleChange}
          className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
        {error.short_code && <p className='text-red-500'>{error.short_code}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="group" className="block">Service Group<span className='text-red-500'>*</span></label>
        <input
          type="text"
          name="group"
          id="group"
          value={serviceInput.group}
          onChange={handleChange}
          className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
        {error.group && <p className='text-red-500'>{error.group}</p>}
      </div>
      <button className="bg-green-500 hover:bg-green-200 text-white w-full rounded-md p-3" type='submit' disabled={loading}>
        {loading ? 'Processing...' : isEdit ? 'Update' : 'Add'}
      </button>
      <button onClick={resetForm} className="bg-blue-500 mt-5  hover:bg-blue-200 text-white w-full rounded-md p-3" type='button' >
        Refresh Form
      </button>
    </form>
  );
};

export default ServiceForm;
