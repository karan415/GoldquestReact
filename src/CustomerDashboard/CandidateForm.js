import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import DropBoxContext from './DropBoxContext';
import { useApi } from '../ApiContext';
import PulseLoader from 'react-spinners/PulseLoader';
import { useNavigate } from 'react-router-dom';

const CandidateForm = () => {
    const { services, uniquePackages, selectedCandidate, fetchClient, candidateLoading } = useContext(DropBoxContext);
    const [isEditClient, setIsEditClient] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const API_URL = useApi();
    const navigate = useNavigate();

    const branchEmail = JSON.parse(localStorage.getItem("branch"))?.email;

    const [input, setInput] = useState({
        name: "",
        employee_id: "",
        mobile_number: "",
        email: "",
        services: [],
        package: [],
        candidate_application_id: ''
    });
    const branch_name = JSON.parse(localStorage.getItem("branch"));

    const [error, setError] = useState({});


    const handlePackageChange = (e) => {
        const selectedValue = e.target.value; // The selected package ID

        if (selectedValue === "") {
            setInput(prevState => ({
                ...prevState,
                package: "",
                services: [], // Clear services if no package is selected
            }));
            return;
        }

        const associatedServices = services
            .filter(service => service.packages && Object.keys(service.packages).includes(selectedValue))
            .map(service => String(service.serviceId)); // Ensure service IDs are strings

        setInput(prevState => ({
            ...prevState,
            package: selectedValue, // Set the selected package
            services: associatedServices, // Automatically select all associated services
        }));
    };
    console.log('services', input.services)

    const handleChange = (event) => {
        const { name, value, checked } = event.target;

        if (name === 'services') {
            setInput((prev) => {
                let updatedServices = [...prev.services];

                if (checked) {
                    // If checked, add the service
                    updatedServices.push(value);
                } else {
                    // If unchecked, remove the service
                    updatedServices = updatedServices.filter((serviceId) => serviceId !== value);
                }

                return { ...prev, services: updatedServices };
            });
        } else {
            setInput((prev) => ({ ...prev, [name]: value }));
        }
    };




    useEffect(() => {
        // This effect will run when the selectedCandidate changes
        setIsEditClient(false); // Optionally reset edit state

        if (selectedCandidate) {
            const parsedServices = Array.isArray(selectedCandidate.services)
                ? selectedCandidate.services
                : selectedCandidate.services ? selectedCandidate.services.split(',') : [];

            setInput({
                name: selectedCandidate.name,
                employee_id: selectedCandidate.employee_id,
                mobile_number: selectedCandidate.mobile_number,
                email: selectedCandidate.email,
                services: parsedServices,
                package: selectedCandidate.packages || [],
                candidate_application_id: selectedCandidate.id || ''
            });
            setIsEditClient(true);
        } else {
            setInput({
                name: "",
                employee_id: "",
                mobile_number: "",
                email: "",
                services: [],
                package: [],
                candidate_application_id: ""
            });
            setIsEditClient(false);
        }

        // Cleanup function to reset the form when the component unmounts or user navigates away
        return () => {
            setInput({
                name: "",
                employee_id: "",
                mobile_number: "",
                email: "",
                services: [],
                package: [],
                candidate_application_id: ""
            });
        };

    }, [selectedCandidate]);


    const validate = () => {
        const NewErr = {};

        // Ensure all inputs are treated as strings and trim spaces
        const name = String(input.name || '').trim();
        const employee_id = String(input.employee_id || '').trim();
        const mobile_number = String(input.mobile_number || '').trim();
        const email = String(input.email || '').trim();

        // Validate Name (non-empty check)
        if (!name) {
            NewErr.name = 'Name is required';
        }

        // Validate Employee ID (non-empty check)
        if (!employee_id) {
            NewErr.employee_id = 'Employee ID is required';
        }

        // Validate Mobile Number
        if (!mobile_number) {
            NewErr.mobile_number = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(mobile_number)) {
            NewErr.mobile_number = "Please enter a valid phone number, containing 10 digits.";
        }

        // Validate Email
        if (!email) {
            NewErr.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                NewErr.email = 'Invalid email format';
            } else {
                // Ensure email is in lowercase
                input.email = email.toLowerCase();
            }
        }

        return NewErr;
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        setFormLoading(true);

        // Step 1: Validate form fields first
        const errors = validate();
        if (Object.keys(errors).length === 0) {
            setError({});
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

            // Step 3: Send the request
            fetch(url, requestOptions)
                .then(response => {
                    // If response is not ok, throw an error
                    if (!response.ok) {
                        return response.json().then(errorResult => {
                            const errorMessage = errorResult.message || 'An error occurred';
                            Swal.fire('Error!', errorMessage, 'error');
                            if (errorMessage.message && errorMessage.message.toLowerCase().includes('invalid') && errorMessage.message.toLowerCase().includes('token')) {
                                navigate(`/customer-login?email=${branchEmail}`)
                            }
                            throw new Error(errorMessage);
                        });
                    }
                    return response.json();
                })
                .then(result => {
                    // Step 4: Handle success response
                    const newToken = result._token || result.token;
                    if (newToken) {
                        localStorage.setItem("branch_token", newToken);
                    }

                    setInput({
                        name: "",
                        employee_id: "",
                        mobile_number: "",
                        email: "",
                        services: [],
                        package: '',
                        candidate_application_id: ''
                    });
                    setError({}); // Clear errors

                    fetchClient(); // Refresh client list

                    Swal.fire({
                        title: "Success",
                        text: isEditClient ? 'Candidate Application edited successfully' : 'Candidate Application added successfully',
                        icon: "success",
                        confirmButtonText: "Ok"
                    });

                    setIsEditClient(false); // Reset edit mode
                })
                .catch(error => {
                    // Log any errors that occur during fetch
                    console.error("There was an error!", error);
                })
                .finally(() => {
                    setFormLoading(false); // Stop loading state
                });

        } else {
            // Step 5: Handle validation errors
            setError(errors);
            setFormLoading(false); // Stop loading state
        }
    };



    return (
        <>
            {formLoading ? (
                <div className='flex justify-center'>  <PulseLoader color="#36A2EB" loading={formLoading} size={15} /></div>
            ) : (
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
                                <div className='mt-4'>
                                    <h2 className='bg-green-500 rounded-md p-4 text-white mb-4 hover:bg-green-200'>Service Names</h2>
                                    {candidateLoading ? (
                                        <PulseLoader color="#36A2EB" loading={candidateLoading} size={15} />
                                    ) : services.length > 0 ? (
                                        <ul>
                                            {services.map((item) => (
                                                <li
                                                    key={item.serviceId}
                                                    className={`border p-2 my-1 flex gap-3 items-center ${input.services.includes(String(item.serviceId)) ? 'selected' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="services"
                                                        value={String(item.serviceId)} // Ensure `value` matches the service ID type
                                                        onChange={handleChange}
                                                        checked={input.services.includes(String(item.serviceId))} // Match ID type
                                                    />

                                                    <div className='font-bold'>{item.serviceTitle}</div>
                                                </li>
                                            ))}
                                        </ul>


                                    ) : (
                                        <p>No services available</p>
                                    )}
                                </div>
                                <div className="mt-5">
                                    <strong className="mb-2 block">Packages:</strong>
                                    {!candidateLoading && (
                                        <select
                                            value={input.package[0] || ""}
                                            onChange={handlePackageChange}
                                            className="text-left w-full border p-2 rounded-md"
                                        >
                                            <option value="">Select a package</option>
                                            {uniquePackages.map(pkg => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.name || "No Name"}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                    <button type="submit" className='bg-green-400 hover:bg-green-200 text-white p-3 rounded-md w-auto'>{isEditClient ? "Edit" : "Send"}</button>
                    {/* <span className='flex justify-center py-4 font-bold text-lg'>OR</span>
                    <button type="button" className='bg-green-400 text-white p-3 rounded-md w-full hover:bg-green-200'>Bulk Mailer</button> */}
                </form>
            )}

        </>
    );
}

export default CandidateForm;
