import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import DropBoxContext from './DropBoxContext';
import { useApi } from '../ApiContext';
import PulseLoader from 'react-spinners/PulseLoader';

const CandidateForm = () => {
    const { services, uniquePackages, fetchServices, selectedDropBox, fetchClient, loading } = useContext(DropBoxContext);
    const [, setBranchId] = useState(null);
    const [, setStoredToken] = useState(null);
    const [isEditClient, setIsEditClient] = useState(false);
    const [, setIsSubmitting] = useState(false);
    const API_URL = useApi();


    const [input, setInput] = useState({
        name: "",
        employee_id: "",
        mobile_number: "",
        email: "",
        services: [],
        package: '',
        candidate_application_id: ''
    });
    const branch_name = JSON.parse(localStorage.getItem("branch"));

    const [error, setError] = useState({});

    const handleChange = (event) => {
        const { name, value, checked } = event.target;
        if (name === 'services') {
            setInput((prev) => {
                const updatedServices = checked
                    ? [...prev.services, value]
                    : prev.services.filter(serviceId => serviceId !== value);

                return { ...prev, services: updatedServices };
            });
        } else {
            setInput((prev) => ({ ...prev, [name]: value }));
        }

        // Clear error for the field when user inputs valid data
        if (error[name]) {
            setError(prevError => ({ ...prevError, [name]: '' }));
        }
    };

    useEffect(() => {
        fetchServices();
        fetchClient();
    }, [fetchServices, fetchClient])

    useEffect(() => {
        const storedBranchData = JSON.parse(localStorage.getItem("branch"));
        const branch_token = localStorage.getItem("branch_token");

        if (storedBranchData) setBranchId(storedBranchData.id);
        if (branch_token) setStoredToken(branch_token);

        if (selectedDropBox) {
            setInput({
                name: selectedDropBox.name,
                employee_id: selectedDropBox.employee_id,
                mobile_number: selectedDropBox.mobile_number,
                email: selectedDropBox.email,
                services: selectedDropBox.services || [],
                package: selectedDropBox.packages || '',
                candidate_application_id: selectedDropBox.id || ''
            });
            setIsEditClient(true);
        } else {
            setInput({
                name: "",
                employee_id: "",
                mobile_number: "",
                email: "",
                services: [],
                package: "",
                candidate_application_id: ""
            });
            setIsEditClient(false);
        }
    }, [selectedDropBox]);

    const validate = () => {
        const NewErr = {};
        if (!input.name) NewErr.name = 'This is required';
        if (!input.employee_id) NewErr.employee_id = 'This is required';
        if (!input.mobile_number) {
            NewErr.mobile_number = 'This is required';
        } else if (input.mobile_number.length !== 10) {
            NewErr.mobile_number = "Please enter a valid phone number, containing 10 digits.";
        }
        if (!input.email) {
            NewErr.email = 'This is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.email)) {
                NewErr.email = 'Invalid email format';
            }
        }
        return NewErr;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const errors = validate();
        if (Object.keys(errors).length === 0) {
            const customer_id = JSON.parse(localStorage.getItem("branch"))?.customer_id;
            const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
            const branch_token = localStorage.getItem("branch_token");
            const myHeaders = new Headers({
                "Content-Type": "application/json"
            });

            const servicesString = Array.isArray(input.services) ? input.services.join(',') : '';

            const Raw = JSON.stringify({
                customer_id,
                branch_id,
                _token: branch_token,
                name: input.name,
                employee_id: input.employee_id,
                mobile_number: input.mobile_number,
                email: input.email,
                package: input.package,
                services: servicesString,
                candidate_application_id: input.candidate_application_id
            });

            const requestOptions = {
                method: isEditClient ? 'PUT' : "POST",
                headers: myHeaders,
                body: Raw,
                redirect: "follow"
            };
            const url = isEditClient
                ? `${API_URL}/branch/candidate-application/update`
                : `${API_URL}/branch/candidate-application/create`;

            fetch(url, requestOptions)
                .then(response => {
                    const result = response.json();
                    const newToken = result._token || result.token;
                    if (newToken) {
                        localStorage.setItem("branch_token", newToken);
                    }
                    if (!response.ok) {
                        return response.text().then(text => {
                            const errorData = JSON.parse(text);
                            Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                            throw new Error(text);
                        });
                    }
                    return result;
                })
                .then(data => {
                    setInput({
                        name: "",
                        employee_id: "",
                        mobile_number: "",
                        email: "",
                        services: [],
                        package: '',
                        candidate_application_id: ''
                    });
                    setError({});
                    fetchClient();
                    Swal.fire({
                        title: "Success",
                        text: isEditClient ? 'Candidate Application edited successfully' : 'Candidate Application added successfully',
                        icon: "success",
                        confirmButtonText: "Ok"
                    });
                    setIsEditClient(false); // Reset after success
                })
                .catch(error => {
                    console.error("There was an error!", error);
                })
                .finally(() => setIsSubmitting(false));
        } else {
            setError(errors);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 grid-cols-2 mb-4">
                    <div className="col bg-white shadow-md rounded-md p-3 md:p-6">
                        <div className="mb-4">
                            <label htmlFor="applicant_name" className='text-sm'>Name of the organisation:</label>
                            <input type="text" name="applicant_name" className="border w-full rounded-md p-2 mt-2" disabled value={branch_name?.name} />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="name" className='text-sm'>Full name of the applicant *</label>
                            <input type="text" name="name" className="border w-full rounded-md p-2 mt-2" onChange={handleChange} value={input.name} />
                            {error.name && <p className='text-red-500'>{error.name}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="employee_id" className='text-sm'>Employee ID:</label>
                            <input type="text" name="employee_id" className="border w-full rounded-md p-2 mt-2" onChange={handleChange} value={input.employee_id} />
                            {error.employee_id && <p className='text-red-500'>{error.employee_id}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="mobile_number" className='text-sm'>Mobile Number:</label>
                            <input type="tel" name="mobile_number" className="border w-full rounded-md p-2 mt-2" onChange={handleChange} value={input.mobile_number} />
                            {error.mobile_number && <p className='text-red-500'>{error.mobile_number}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className='text-sm'>Email ID*:</label>
                            <input type="email" name="email" className="border w-full rounded-md p-2 mt-2" onChange={handleChange} value={input.email} />
                            {error.email && <p className='text-red-500'>{error.email}</p>}
                        </div>
                    </div>
                    <div className="col bg-white shadow-md rounded-md p-3 md:p-6">
                        <div className="flex flex-wrap flex-col-reverse">
                            <div>
                                <h2 className='bg-green-500 rounded-md p-4 text-white mb-4 hover:bg-green-200 mt-5'>Service Names</h2>
                                {loading ? ( // Check for loading state
                                    <div className="flex justify-center py-5">
                                        <PulseLoader color="#36A2EB" loading={loading} size={15} />
                                    </div>
                                ) : services.length > 0 ? (
                                    <ul>
                                        {services.map((item) => (
                                            <li key={item.serviceId} className={`border p-2 my-1 flex gap-3 items-center ${input.services.includes(item.serviceId) ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    name="services"
                                                    value={String(item.serviceId)}
                                                    onChange={handleChange}
                                                    checked={input.services.includes(String(item.serviceId))}
                                                />
                                                <div className='font-bold'>{item.serviceTitle}</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No services available</p>
                                )}
                            </div>
                            <div>
                                <strong>Packages:</strong>
                                {loading ? ( // Check for loading state
                                    <div className="flex justify-center py-5">
                                        <PulseLoader color="#36A2EB" loading={loading} size={15} />
                                    </div>
                                ) : uniquePackages.length > 0 ? (
                                    <select
                                        className='border w-full rounded-md p-2 mt-2 outline-none'
                                        name="package"
                                        onChange={handleChange}
                                        value={input.package}
                                    >
                                        <option value="">Select a package</option>
                                        {uniquePackages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name || "No Name"}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p>No packages available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" className='bg-green-400 hover:bg-green-200 text-white p-3 rounded-md w-auto'>{isEditClient ? "Edit" : "Send"}</button>
                <span className='flex justify-center py-4 font-bold text-lg'>OR</span>
                <button type="button" className='bg-green-400 text-white p-3 rounded-md w-full hover:bg-green-200'>Bulk Mailer</button>
            </form>
        </>
    );
}

export default CandidateForm;
