import React, { useEffect, useState } from 'react';
import { useService } from './ServiceContext';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';

const ServiceForm = () => {
    const API_URL = useApi();
    const { selectedService, updateServiceList, fetchData } = useService();
    const [adminId, setAdminId] = useState(null);
    const [storedToken, setStoredToken] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serviceInput, setServiceInput] = useState({
        name: "",
        d_name: "",
        short_code: "",
        sac_code: ""
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
                short_code: selectedService.short_code || '',
            });
            setIsEdit(true);
        } else {
            setServiceInput({
                name: "",
                d_name: "",
                short_code: "",
                sac_code: ""
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
                    sac_code: serviceInput.sac_code,
                    admin_id: adminId,
                    _token: storedToken,
                }),
            };

            const url = isEdit
                ? `${API_URL}/service/update`
                : `${API_URL}/service/create`;

            fetch(url, requestOptions)
            .then(response => {
                // Parse the response JSON
                return response.json().then(result => {
                  // Check if response is successful
                  if (!response.ok) {
                    // Handle the error if the response is not ok
                    const errorMessage = result.message || 'Unknown error occurred';
                    Swal.fire(
                      'Error!',
                      `An error occurred: ${errorMessage}`,
                      'error'
                    );
                    throw new Error(errorMessage);
                  }
              
                  // If the response is ok, handle the token (if exists)
                  const newToken = result._token || result.token;
                  if (newToken) {
                    localStorage.setItem("_token", newToken);
                  }
              
                  // Return the result if everything is fine
                  return result;
                });
              })
              
                .then((result) => {

                    setError({});
                    Swal.fire({
                        title: "Success",
                        text: isEdit ? 'Service updated successfully' : 'Service added successfully',
                        icon: "success",
                        confirmButtonText: "Ok"
                    });

                    if (isEdit) {
                        updateServiceList(prevList => prevList.map(service => service.id === result.id ? result : service));
                    } else {
                        updateServiceList(prevList => [...prevList, result]);
                    }
                    fetchData();
                    setServiceInput({ name: "", d_name: "", sac_code: "", short_code: "" });
                    setIsEdit(false);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false); // Stop loading
                });
        } else {
            setError(validateError);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="ServiceName" className="block">Service Name</label>
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
                <label htmlFor="ServiceDisplayName" className="block">Service Description</label>
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
                <label htmlFor="ServiceDisplayName" className="block">SAC</label>
                <input
                    type="text"
                    name="sac_code"
                    id="ServiceDisplayName"
                    value={serviceInput.sac_code}
                    onChange={handleChange}
                    className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
                {error.sac_code && <p className='text-red-500'>{error.sac_code}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="ServiceDisplayName" className="block">Short Code</label>
                <input
                    type="text"
                    name="short_code"
                    id="ServiceDisplayName"
                    value={serviceInput.short_code}
                    onChange={handleChange}
                    className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
                {error.short_code && <p className='text-red-500'>{error.short_code}</p>}
            </div>
            <button className="bg-green-500 hover:bg-green-200 text-white w-full rounded-md p-3" type='submit' disabled={loading}>
                {loading ? 'Processing...' : isEdit ? 'Update' : 'Add'}
            </button>
        </form>
    );
};

export default ServiceForm;
