import React, { useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import DropBoxContext from './DropBoxContext';
import { useApi } from '../ApiContext';
import axios from 'axios';
import Multiselect from 'multiselect-react-dropdown';
import PulseLoader from 'react-spinners/PulseLoader';
const ClientForm = () => {
    const branch_name = JSON.parse(localStorage.getItem("branch"));
    const storedBranchData = JSON.parse(localStorage.getItem("branch"));
    const branch_token = localStorage.getItem("branch_token");
    const API_URL = useApi();
    const customer_id = storedBranchData?.customer_id;
    const customer_code = localStorage.getItem("customer_code");
    const [files, setFiles] = useState({});
    const [clientInput, setClientInput] = useState({
        name: '',
        employee_id: '',
        spoc: '',
        location: '',
        batch_number: '',
        sub_client: '',
        services: [],
        package: [],
        client_application_id: '',
    });

    const { selectedDropBox, fetchClientDrop, services, uniquePackages, loading } = useContext(DropBoxContext);
    const [isEditClient, setIsEditClient] = useState(false);
    const [inputError, setInputError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        ['name', 'employee_id', 'spoc', 'location', 'batch_number', 'sub_client'].forEach(field => {
            if (!clientInput[field]) newErrors[field] = "This Field is Required";
        });
        return newErrors;
    };

    useEffect(() => {
        if (selectedDropBox) {
            // Ensure services are always in an array format
            const parsedServices = Array.isArray(selectedDropBox.services)
                ? selectedDropBox.services
                : selectedDropBox.services ? selectedDropBox.services.split(',') : [];

            setClientInput({
                name: selectedDropBox.name || "",
                employee_id: selectedDropBox.employee_id || "",
                spoc: selectedDropBox.single_point_of_contact || "",
                location: selectedDropBox.location || "",
                batch_number: selectedDropBox.batch_number || "",
                sub_client: selectedDropBox.sub_client || "",
                services: parsedServices, // Make sure services is always an array
                package: selectedDropBox.package || [],
                client_application_id: selectedDropBox.id || "",
            });
            setIsEditClient(true);
        } else {
            setClientInput({
                name: "",
                employee_id: "",
                spoc: "",
                location: "",
                batch_number: "",
                sub_client: "",
                services: [],
                package: "",
                client_application_id: "",
            });
            setIsEditClient(false);
        }
    }, [selectedDropBox]);




    useEffect(() => {
        fetchClientDrop();
    }, [fetchClientDrop])


    const handleFileChange = (fileName, e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prevFiles => ({ ...prevFiles, [fileName]: selectedFiles }));
    };

    const uploadCustomerLogo = async (insertedId, new_application_id) => {
        const fileCount = Object.keys(files).length;
        const serviceData = JSON.stringify(services);
        for (const [index, [key, value]] of Object.entries(files).entries()) {
            const customerLogoFormData = new FormData();
            customerLogoFormData.append('branch_id', storedBranchData?.id);
            customerLogoFormData.append('_token', branch_token);
            customerLogoFormData.append('customer_code', customer_code);
            customerLogoFormData.append('client_application_id', insertedId);

            for (const file of value) {
                customerLogoFormData.append('images', file);
                customerLogoFormData.append('upload_category', key);
            }

            if (fileCount === (index + 1)) {
                if (isEditClient) {

                    customerLogoFormData.append('send_mail', 0);
                } else {
                    customerLogoFormData.append('send_mail', 1);
                }
                customerLogoFormData.append('services', serviceData);
                customerLogoFormData.append('client_application_name', clientInput.name);
                customerLogoFormData.append('client_application_generated_id', new_application_id);
            }
            try {
                await axios.post(`${API_URL}/branch/client-application/upload`, customerLogoFormData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } catch (err) {
                Swal.fire('Error!', `An error occurred while uploading logo: ${err.message}`, 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let requestBody;
        const errors = validate();

        if (Object.keys(errors).length === 0) {
            setIsLoading(true); // Set loading state to true
            const branch_id = storedBranchData?.id;
            const fileCount = Object.keys(files).length;

            if (fileCount === 0) {
                requestBody = {
                    customer_id,
                    branch_id,
                    send_mail: 1,
                    _token: branch_token,
                    ...clientInput
                };
            } else {
                requestBody = {
                    customer_id,
                    branch_id,
                    send_mail: 0,
                    _token: branch_token,
                    ...clientInput
                };
            }

            try {
                const response = await fetch(
                    isEditClient
                        ? `${API_URL}/branch/client-application/update`
                        : `${API_URL}/branch/client-application/create`,
                    {
                        method: isEditClient ? 'PUT' : "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(requestBody)
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    // Handle error response from API
                    const errorMessage = result.message || 'Unknown error occurred';
                    const apiError = result.errors || 'An unexpected error occurred. Please try again later.';
                    Swal.fire(
                        'Error!',
                        `An error occurred: ${errorMessage}\n${apiError}`,
                        'error'
                    );
                    throw new Error(errorMessage);
                }

                const newToken = result._token || result.token;
                if (newToken) {
                    localStorage.setItem("branch_token", newToken);
                }

                let insertedId;
                let new_application_id;
                if (isEditClient) {
                    insertedId = clientInput.client_application_id;
                    new_application_id = clientInput.application_id;
                } else {
                    insertedId = result.result.results.insertId;
                    new_application_id = result.result.new_application_id;
                }

                // Reset the form fields including files
                setClientInput({
                    name: '',
                    employee_id: '',
                    spoc: '',
                    location: '',
                    batch_number: '',
                    sub_client: '',
                    services: [],
                    package: '',
                    client_application_id: ''
                });

                setFiles({}); // Clear files
                setInputError({}); // Reset input errors

                console.log("Files reset: ", files); // Verify the state change

                // Show success message
                if (fileCount === 0) {
                    Swal.fire({
                        title: "Success",
                        text: `Client Application Created Successfully.`,
                        icon: "success",
                        confirmButtonText: "Ok",
                    });
                }

                if (fileCount > 0) {
                    // Proceed to upload files if files exist
                    await uploadCustomerLogo(insertedId, new_application_id);

                    Swal.fire({
                        title: "Success",
                        text: `Client Application Created Successfully.`,
                        icon: "success",
                        confirmButtonText: "Ok",
                    });
                }

                console.log('insertedId', insertedId, 'new_application_id', new_application_id);

                fetchClientDrop(); // Refresh the client data

            } catch (error) {
                console.error("There was an error!", error);

                Swal.fire(
                    'Error!',
                    'There was an error with the request. Please try again later.',
                    'error'
                );
            } finally {
                setIsLoading(false); // Reset loading state after the request is done
            }
        } else {
            setInputError(errors); // Set the input errors if validation fails
        }
    };




    const handlePackageChange = (e) => {
        const selectedValue = e.target.value; // The selected package ID

        if (selectedValue === "") {
            // No package selected
            setClientInput(prevState => ({
                ...prevState,
                package: "",
                services: [], // Clear services if no package is selected
            }));
            return;
        }

        // Find all services associated with the selected package
        const associatedServices = services
            .filter(service => service.packages && Object.keys(service.packages).includes(selectedValue))
            .map(service => String(service.serviceId)); // Ensure service IDs are strings

        setClientInput(prevState => ({
            ...prevState,
            package: selectedValue, // Set the selected package
            services: associatedServices, // Automatically select all associated services
        }));
    };
    console.log('services', clientInput.services)

    const handleChange = (event) => {
        const { name, value, checked } = event.target;

        if (name === 'services') {
            setClientInput((prev) => {
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
            setClientInput((prev) => ({ ...prev, [name]: value }));
        }
    };





    return (
        <>


            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 grid-cols-2 mb-4">
                    <div className="col bg-white shadow-md rounded-md p-3 md:p-6">
                        <div className="md:flex gap-5">
                            <div className="mb-4 md:w-6/12">
                                <label htmlFor="organisation_name" className='text-sm'>Name of the organisation:</label>
                                <input type="text" name="organisation_name" id="Organisation_Name" className="border w-full capitalize rounded-md p-2 mt-2" disabled value={branch_name?.name} />
                                {inputError.organisation_name && <p className='text-red-500'>{inputError.organisation_name}</p>}
                            </div>
                            <div className="mb-4 md:w-6/12">
                                <label htmlFor="name" className='text-sm'>Full name of the applicant *</label>
                                <input type="text" name="name" id="Applicant-Name" className="border w-full capitalize rounded-md p-2 mt-2" onChange={handleChange} value={clientInput.name} />
                                {inputError.name && <p className='text-red-500'>{inputError.name}</p>}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="attach_documents" className='text-sm'>Attach documents: *</label>
                            <input type="file" name="attach_documents" id="Attach_Docs" className="border w-full capitalize rounded-md p-2 mt-2" onChange={(e) => handleFileChange('attach_documents', e)} />
                            {inputError.attach_documents && <p className='text-red-500'>{inputError.attach_documents}</p>}
                        </div>
                        <div className="md:flex gap-5">
                            <div className="mb-4 md:w-6/12">
                                <label htmlFor="employee_id" className='text-sm'>Employee ID:</label>
                                <input type="text" name="employee_id" id="EmployeeId" className="border w-full capitalize rounded-md p-2 mt-2" onChange={handleChange} value={clientInput.employee_id} />
                                {inputError.employee_id && <p className='text-red-500'>{inputError.employee_id}</p>}
                            </div>
                            <div className="mb-4 md:w-6/12">
                                <label htmlFor="spoc" className='text-sm'>Name of the SPOC:</label>
                                <input type="text" name="spoc" id="spoc" className="border w-full capitalize rounded-md p-2 mt-2" onChange={handleChange} value={clientInput.spoc} />
                                {inputError.spoc && <p className='text-red-500'>{inputError.spoc}</p>}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="location" className='text-sm'>Location:</label>
                            <input type="text" name="location" id="Locations" className="border w-full capitalize rounded-md p-2 mt-2" onChange={handleChange} value={clientInput.location} />
                            {inputError.location && <p className='text-red-500'>{inputError.location}</p>}
                        </div>
                        <div className="md:flex gap-5">
                            <div className="mb-4 md:w-6/12">
                                <label htmlFor="batch_number" className='text-sm'>Batch number:</label>
                                <input type="text" name="batch_number" id="Batch-Number" className="border w-full capitalize rounded-md p-2 mt-2" onChange={handleChange} value={clientInput.batch_number} />
                                {inputError.batch_number && <p className='text-red-500'>{inputError.batch_number}</p>}
                            </div>
                            <div className="mb-4 md:w-6/12">
                                <label htmlFor="sub_client" className='text-sm'>Sub client:</label>
                                <input type="text" name="sub_client" id="SubClient" className="border w-full capitalize rounded-md p-2 mt-2" onChange={handleChange} value={clientInput.sub_client} />
                                {inputError.sub_client && <p className='text-red-500'>{inputError.sub_client}</p>}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="photo">Upload photo:</label>
                            <input type="file" name="photo" id="upPhoto" className="border w-full capitalize rounded-md p-2 mt-2 outline-none" onChange={(e) => handleFileChange('photo', e)} />
                            {inputError.photo && <p className='text-red-500'>{inputError.photo}</p>}
                        </div>
                    </div>
                    <div className="col bg-white shadow-md rounded-md p-3 md:p-6">
                        <div className="flex flex-wrap flex-col-reverse">
                            <div className='mt-4'>
                                <h2 className='bg-green-500 rounded-md p-4 text-white mb-4 hover:bg-green-200'>Service Names</h2>
                                {loading ? (
                                    <PulseLoader color="#36A2EB" loading={loading} size={15} />
                                ) : services.length > 0 ? (
                                    <ul>
                                        {services.map((item) => (
                                            <li
                                                key={item.serviceId}
                                                className={`border p-2 my-1 flex gap-3 items-center ${clientInput.services.includes(String(item.serviceId)) ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="services"
                                                    value={String(item.serviceId)} // Ensure `value` matches the service ID type
                                                    onChange={handleChange}
                                                    checked={clientInput.services.includes(String(item.serviceId))} // Match ID type
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
                                {!loading && (
                                    <select
                                        value={clientInput.package[0] || ""}
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
                <button type="submit" className='bg-green-400 hover:bg-green-200 text-white p-3 rounded-md w-auto' disabled={isLoading}>
                    {isLoading ? 'Submitting...' : (isEditClient ? "Edit" : "Send")}
                </button>
                <button type="button" className='bg-green-400 hover:bg-green-200 mt-4 text-white p-3 rounded-md w-auto ms-3'>Bulk Upload</button>
            </form>
            {isLoading && <div className="loader">Loading...</div>} {/* Add a simple loader here */}
        </>
    );
}

export default ClientForm;
