import React, { useCallback, useContext, useEffect, useState } from 'react';
import { BranchContextExel } from '../BranchContextExel';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useGenerateReport } from '../GenerateReportContext';

const CandidateApplications = () => {
    const [files, setFiles] = useState([]);
    const renderedServices = new Set();
    const [allInputDetails, setAllInputDetails] = useState([]);
    const [disabledFields, setDisabledFields] = useState({
        month_year: false,
        initiation_date: false,
        organization_name: false,
        verification_purpose: false,
        employee_id: false,
        client_code: false,
        applicant_name: false,
        contact_number: false,
        contact_number2: false,
        father_name: false,
        dob: false,
        gender: false,
        marital_status: false,
        nationality: false,
        insuff: false,
    });
    const [, setAnnexureData] = useState({});
    const { service_id, branch_id, application_id } = useContext(BranchContextExel);
    const [annexure, setAnnexure] = useState({});
    const [, setLoading] = useState(false);
    const [, setError] = useState(null);
    const { formData, setFormData, handleInputChange } = useGenerateReport();
    const [errors, setErrors] = useState({});
    const [serviceHeadings, setServiceHeadings] = useState([]);
    const [cmtData, setCmtData] = useState([]);
    const [applications, setApplications] = useState([]);
    const [customerInfo, setCustomerInfo] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState(Array(serviceHeadings.length).fill(''));


    const handleSelectChange = (index, value) => {
        const updatedStatuses = [...selectedStatuses];
        updatedStatuses[index] = value;
        setSelectedStatuses(updatedStatuses);
    };

    const isAllCompleted = selectedStatuses.length > 0 && selectedStatuses.every(status => status.includes("completed"));


    const fetchServices = useCallback(() => {
        const servicesArray = service_id ? service_id.split(',').map(Number) : [];
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
        setLoading(true);
        setError(null);

        const allInputDetails = [];
        let inNo = [];
        Promise.all(
            servicesArray.map(serviceId => {
                return fetch(
                    `https://octopus-app-www87.ondigitalocean.app/client-master-tracker/report-form-json-by-service-id?service_id=${serviceId}&admin_id=${admin_id}&_token=${storedToken}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => {
                                const errorData = JSON.parse(text);
                                throw new Error(text);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        const newToken = data._token || data.token;
                        if (newToken) {
                            localStorage.setItem("_token", newToken);
                        }

                        let parsedJson;
                        try {
                            parsedJson = JSON.parse(data.reportFormJson.json || '{}');
                        } catch (error) {
                            console.error("Failed to parse reportFormJson:", error);
                            return { serviceId, parsedJson: null };
                        }

                        // Collect unique service headings
                        setServiceHeadings(prevHeadings => {
                            const updatedHeadings = [...prevHeadings];

                            if (!updatedHeadings.some(service => service.service_id === serviceId)) {
                                updatedHeadings.push({
                                    heading: parsedJson.heading,
                                    service_id: serviceId,
                                });
                            }

                            return updatedHeadings;
                        });

                        if (parsedJson.db_table && parsedJson.db_table.trim() !== '') {
                            const annexureURL = `https://octopus-app-www87.ondigitalocean.app/client-master-tracker/annexure-data?application_id=${application_id}&db_table=${parsedJson.db_table}&admin_id=${admin_id}&_token=${storedToken}`;

                            return fetch(annexureURL)
                                .then(annexureResponse => {
                                    const inputDetails = [];
                                    const db_table = parsedJson.db_table;

                                    if (!annexureResponse.ok) {
                                        if (!inNo.includes(db_table)) {
                                            parsedJson.rows.forEach(row => {
                                                row.inputs.forEach(input => {
                                                    inputDetails.push({
                                                        label: input.label,
                                                        name: input.name,
                                                        type: input.type,
                                                        value: null,
                                                        options: input.options || undefined,
                                                    });
                                                });
                                            });

                                            allInputDetails.push({ db_table, serviceId, inputDetails });
                                            inNo.push(db_table);

                                            console.error(`HTTP error! status: ${annexureResponse.status}`);
                                        }
                                    }

                                    return annexureResponse.json()
                                        .then(annexureResult => {
                                            const inputDetails = [];

                                            if (Array.isArray(annexureResult.annexureData)) {
                                                parsedJson.rows.forEach(row => {
                                                    row.inputs.forEach(input => {
                                                        const foundItem = annexureResult.annexureData.find(item => item.name === input.name);
                                                        const value = foundItem ? foundItem.value : null;

                                                        inputDetails.push({
                                                            label: input.label,
                                                            name: input.name,
                                                            type: input.type,
                                                            value: value,
                                                            options: input.options || undefined,
                                                        });
                                                    });
                                                });
                                            } else if (typeof annexureResult.annexureData === 'object' && annexureResult.annexureData !== null) {


                                                parsedJson.rows.forEach(row => {
                                                    row.inputs.forEach(input => {
                                                        const value = annexureResult.annexureData[input.name] || null;

                                                        inputDetails.push({
                                                            label: input.label,
                                                            name: input.name,
                                                            type: input.type,
                                                            value: value,
                                                            options: input.options || undefined,
                                                        });
                                                    });
                                                });
                                            } else {
                                                parsedJson.rows.forEach(row => {
                                                    row.inputs.forEach(input => {
                                                        inputDetails.push({
                                                            label: input.label,
                                                            name: input.name,
                                                            type: input.type,
                                                            options: input.options || undefined,
                                                        });
                                                    });
                                                });
                                                console.error("Expected annexureData to be either an array or an object, but got:", annexureResult.annexureData);
                                            }

                                            // Check if the service already exists before adding
                                            if (!allInputDetails.some(item => item.db_table === db_table)) {
                                                allInputDetails.push({ db_table, serviceId, inputDetails });
                                            }

                                            return { serviceId, parsedJson };
                                        });
                                })
                                .catch(annexureError => {
                                    console.error("Fetch error: ", annexureError);
                                    throw annexureError;

                                });
                        }


                        return { serviceId, parsedJson };
                    });
            })
        )
            .then(results => {
                setAllInputDetails(allInputDetails);

                const mainAnnexureData = allInputDetails.reduce((acc, { serviceId, inputDetails }) => {

                    acc[serviceId] = inputDetails.reduce((inputAcc, { name, value }) => {
                        inputAcc[name] = value !== undefined ? value : '';
                        return inputAcc;
                    }, {});
                    return acc;
                }, {});



                const newAnnexureData = results.reduce((acc, { serviceId, parsedJson }) => {
                    const title = parsedJson.db_table;
                    const valueObject = {};

                    parsedJson.rows.forEach(row => {
                        row.inputs.forEach(input => {
                            valueObject[input.name] = input.value || "";
                        });
                    });

                    acc[title] = valueObject;
                    return acc;
                }, {});

                setAnnexure(mainAnnexureData);
                setAnnexureData(newAnnexureData);
            }).catch(error => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, [service_id, application_id]);


    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [];

        requiredFields.forEach(field => {
            if (!formData[field]) {
            }
            if (!formData[field]) newErrors[field] = "This field is required*";
        });

        return newErrors;
    };


    const annexureValues = useCallback((application_id, db_name) => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        if (!admin_id || !storedToken || !application_id) {
            return;
        }

        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        const url = `https://octopus-app-www87.ondigitalocean.app/client-master-tracker/annexure-data?application_id=${application_id}&db_table=${db_name}&admin_id=${admin_id}&_token=${storedToken}`;

        return fetch(url, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((result) => {
                if (result && result.annexureData) {
                    return result.annexureData;
                } else {
                    console.error("No annexure data found in the response.");
                    return false;
                }
            })
            .catch((error) => console.error("Fetch error: ", error));
    }, [application_id]);



    const fetchClients = useCallback(() => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
        setLoading(true);
        setError(null);

        if (!admin_id || !storedToken || !application_id || !branch_id) {
            console.error("Missing required parameters");
            setError('Missing required parameters');
            setLoading(false);
            return;
        }

        fetch(
            `https://octopus-app-www87.ondigitalocean.app/client-master-tracker/application-by-id?application_id=${application_id}&branch_id=${branch_id}&admin_id=${admin_id}&_token=${storedToken}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
            .then((res) => {
                if (!res.ok) {
                    return res.text().then(text => {
                        const errorData = JSON.parse(text);
                        throw new Error(text);
                    });
                }
                return res.json();
            })
            .then(data => {

                const applicationsData = data.application;
                setApplications(applicationsData)
                console.log('applications', applications)

                Object.entries(applications).forEach(([key, value]) => {
                    const input = document.querySelector(`input[name="${key}"]`);
                    if (input) {
                        input.value = value || '';
                    }
                });

                const customerInfo = data.customerInfo;

                setCustomerInfo(customerInfo);
                console.log('customerInfo', customerInfo)
                Object.entries(customerInfo).forEach(([key, value]) => {
                    const input = document.querySelector(`input[name="${key}"]`);
                    if (input) {
                        input.value = value || '';
                    }
                });

                const cmtData = data.CMTData;
                console.log('cmtData', cmtData);
                setCmtData(cmtData)

                Object.entries(cmtData).forEach(([key, value]) => {
                    const input = document.querySelector(`input[name="${key}"]`);
                    if (input) {
                        input.value = value || '';
                    }
                });

                setDisabledFields({
                    month_year: !!applications.month_year,
                    initiation_date: !!applications.initiation_date,
                    organization_name: !!applications.organization_name,
                    verification_purpose: !!applications.verification_purpose,
                    client_code: !!applications.client_code,
                    applicant_name: !!applications.name,
                    employee_id: !!applications.employee_id,
                    contact_number: !!applications.contact_number,
                    contact_number2: !!applications.contact_number2,
                    father_name: !!applications.father_name,
                    dob: !!applications.dob,
                    gender: !!applications.gender,
                    marital_status: !!applications.marital_status,
                    nationality: !!applications.nationality,
                    insuff: !!applications.insuff,
                });
            })
            .catch(error => {
                console.error('Fetch error:', error);
                setError('Failed to load client data');
            })
            .finally(() => setLoading(false));
    }, [application_id, branch_id]);



    const handleFileChange = (fileName, e, selectedDb) => {

        const selectedFiles = Array.from(e.target.files);

        // Update the state with the new selected files
        setFiles((prevFiles) => ({
            ...prevFiles,
            [selectedDb]: { selectedFiles, fileName },
        }));
    };

    useEffect(() => {

        fetchServices();
        annexureValues(application_id);
        fetchClients();
    }, [fetchServices, fetchClients, annexureValues, application_id, service_id]);
    const uploadCustomerLogo = async (email_status) => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        const fileCount = Object.keys(files).length;
        for (const [key, value] of Object.entries(files)) {
            const customerLogoFormData = new FormData();

            customerLogoFormData.append('admin_id', admin_id);
            customerLogoFormData.append('_token', storedToken);
            customerLogoFormData.append('application_id', application_id);
            customerLogoFormData.append('email_status', email_status || 0);
            customerLogoFormData.append('branch_id', branch_id);
            customerLogoFormData.append('customer_code', customerInfo.client_unique_id);
            customerLogoFormData.append('application_code', applications.application_id);


            // Check if selectedFiles is not empty
            if (value.selectedFiles.length > 0) {
                for (const file of value.selectedFiles) {
                    // Ensure file is a valid File object
                    if (file instanceof File) {
                        customerLogoFormData.append('images', file); // Append each valid file
                    } else {
                        console.error('Invalid file object:', file);
                    }
                }
                customerLogoFormData.append('db_column', value.fileName);
                customerLogoFormData.append('db_table', key);
            }

            if (fileCount === Object.keys(files).indexOf(key) + 1) {
                customerLogoFormData.append('send_mail', 1);
            }

            try {
                await axios.post(
                    `https://octopus-app-www87.ondigitalocean.app/client-master-tracker/upload`,
                    customerLogoFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            } catch (err) {
            }
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validate form and check for errors
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Get stored data for admin and token
        const adminData = JSON.parse(localStorage.getItem("admin"));
        const token = localStorage.getItem("_token");

        // Prepare main annexure data
        const mainAnnexureData = allInputDetails.reduce((acc, { db_table, inputDetails }) => {
            acc[db_table] = inputDetails.reduce((inputAcc, { name, value }) => {
                inputAcc[name] = value !== undefined ? value : '';
                return inputAcc;
            }, {});

            const serviceIndex = serviceHeadings.findIndex(
                heading => heading.heading.replace(/\s/g, '').toLowerCase() === db_table.replace(/_/g, '').toLowerCase()
            );

            acc[db_table].status = serviceIndex !== -1 ? (selectedStatuses[serviceIndex] || '') : 'Status not found';
            return acc;
        }, {});

        // Determine raw data for request based on file count
        const raw = JSON.stringify({
            admin_id: adminData?.id,
            _token: token,
            branch_id: branch_id,
            customer_id: 1,
            application_id: application_id,
            annexure: mainAnnexureData,
            ...formData,
            send_mail: Object.keys(files).length === 0 ? 1 : 0,
        });

        // Define request options
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: raw,
        };

        // Fetch request to generate report
        fetch(`https://octopus-app-www87.ondigitalocean.app/client-master-tracker/generate-report`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse response as JSON directly
            })
            .then(result => {
                const { email_status, _token: newToken } = result;

                Swal.fire('Success!', 'Application updated successfully.', 'success');
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }

                uploadCustomerLogo(email_status);

                // Reset form data
                setFormData({
                    updated_json: {
                        month_year: '',
                        initiation_date: '',
                        organization_name: '',
                        verification_purpose: '',
                        employee_id: '',
                        client_code: '',
                        applicant_name: '',
                        contact_number: '',
                        contact_number2: '',
                        father_name: '',
                        dob: '',
                        gender: '',
                        marital_status: '',
                        nationality: '',
                        insuff: '',
                        address: {
                            address: '',
                            landmark: '',
                            residence_mobile_number: '',
                            state: '',
                        },
                        permanent_address: {
                            permanent_address: '',
                            permanent_sender_name: '',
                            permanent_reciever_name: '',
                            permanent_landmark: '',
                            permanent_pin_code: '',
                            permanent_state: '',
                        },
                        insuffDetails: {
                            first_insufficiency_marks: '',
                            first_insuff_date: '',
                            first_insuff_reopened_date: '',
                            second_insufficiency_marks: '',
                            second_insuff_date: '',
                            second_insuff_reopened_date: '',
                            third_insufficiency_marks: '',
                            third_insuff_date: '',
                            third_insuff_reopened_date: '',
                            overall_status: '',
                            report_date: '',
                            report_status: '',
                            report_type: '',
                            final_verification_status: '',
                            is_verify: '',
                            deadline_date: '',
                            insuff_address: '',
                            basic_entry: '',
                            education: '',
                            case_upload: '',
                            emp_spoc: '',
                            report_generate_by: '',
                            qc_done_by: '',
                            delay_reason: '',
                        },
                    },
                });
            })
            .catch(error => {
                console.error('Error updating application data:', error);
                setError('Failed to update application data');
            });
    };


    const handleChange = (e) => {
        const { name, value } = e.target;

        setAllInputDetails(prev =>
            prev.map(item => ({
                ...item,
                inputDetails: item.inputDetails.map(input =>
                    input.name === name ? { ...input, value } : input
                )
            }))
        );
    };


    console.log('formData', formData)

    return (
        <form onSubmit={handleFormSubmit}>
            <div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label htmlFor="month_year">Month - Year*</label>
                        <input
                            type="text"
                            name="month_year"
                            id="month_year"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.month_year || ""}
                            disabled={disabledFields.month_year}
                            onChange={handleInputChange}
                        />
                        {errors.month_year && <span className="text-red-500">{errors.month_year}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="initiation_date">Initiation Date</label>
                        <input
                            type="date"
                            name="initiation_date"
                            id="initiation_date"
                            className="w-full border p-2 outline-none rounded-md mt-2"
                            value={formData.updated_json.initiation_date || ""}
                            disabled={disabledFields.initiation_date}
                            onChange={handleInputChange}
                        />
                        {errors.initiation_date && <span className="text-red-500">{errors.initiation_date}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label htmlFor="organization_name">Name of the Client Organization</label>
                        <input
                            type="text"
                            name="organization_name"
                            id="organization_name"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.organization_name || ""}
                            disabled={disabledFields.organization_name}
                            onChange={handleInputChange}
                        />
                        {errors.organization_name && <span className="text-red-500">{errors.organization_name}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="verification_purpose">Verification Purpose*</label>
                        <input
                            type="text"
                            name="verification_purpose"
                            id="verification_purpose"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.verification_purpose || ""}
                            disabled={disabledFields.verification_purpose}
                            onChange={handleInputChange}
                        />
                        {errors.verification_purpose && <span className="text-red-500">{errors.verification_purpose}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label htmlFor="employee_id">Applicant Employee ID</label>
                        <input
                            type="text"
                            name="employee_id"
                            id="employee_id"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.employee_id || ""}
                            disabled={disabledFields.employee_id}
                            onChange={handleInputChange}
                        />
                        {errors.employee_id && <span className="text-red-500">{errors.employee_id}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="client_code">Client Code</label>
                        <input
                            type="text"
                            name="client_code"
                            id="client_code"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.client_code || ""}
                            disabled={disabledFields.client_code}
                            onChange={handleInputChange}
                        />
                        {errors.client_code && <span className="text-red-500">{errors.client_code}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label htmlFor="applicant_name">Name of the Applicant*</label>
                        <input
                            type="text"
                            name="applicant_name"
                            id="applicant_name"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.applicant_name || ""}
                            disabled={disabledFields.applicant_name}
                            onChange={handleInputChange}
                        />
                        {errors.applicant_name && <span className="text-red-500">{errors.applicant_name}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="contact_number">Contact Number</label>
                        <input
                            type="tel"
                            name="contact_number"
                            id="contact_number"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.contact_number || ""}
                            disabled={disabledFields.contact_number}
                            onChange={handleInputChange}
                        />
                        {errors.contact_number && <span className="text-red-500">{errors.contact_number}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label htmlFor="contact_number2">Contact Number 2:</label>
                        <input
                            type="tel"
                            name="contact_number2"
                            id="contact_number2"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.contact_number2 || ""}
                            disabled={disabledFields.contact_number2}
                            onChange={handleInputChange}
                        />
                        {errors.contact_number2 && <span className="text-red-500">{errors.contact_number2}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="father_name">Father's Name:</label>
                        <input
                            type="text"
                            name="father_name"
                            id="father_name"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.father_name || ""}
                            disabled={disabledFields.father_name}
                            onChange={handleInputChange}
                        />
                        {errors.father_name && <span className="text-red-500">{errors.father_name}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label htmlFor="gender">Gender</label>
                        <select
                            name="gender"
                            id="gender"
                            className="border w-full rounded-md p-2 mt-2"
                            value={formData.updated_json.gender || ""}
                            disabled={disabledFields.gender}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {errors.gender && <span className="text-red-500">{errors.gender}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="marital_status">Marital Status</label>
                        <select
                            name="marital_status"
                            id="marital_status"
                            className="border w-full rounded-md p-2 mt-2"
                            value={formData.updated_json.marital_status || ""}
                            disabled={disabledFields.marital_status}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Marital Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                        </select>
                        {errors.marital_status && <span className="text-red-500">{errors.marital_status}</span>}
                    </div>
                </div>


            </div>

            <h3 className='text-2xl text-center font-bold my-5'>Permanent Address</h3>
            <div className="form-group border p-3 rounded-md">
                <div className="mb-4">
                    <label htmlFor="full_address">Full Address:</label>
                    <input
                        type="text"
                        name="updated_json.permanent_address.permanent_address"
                        id="full_address"
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                        value={formData.updated_json.permanent_address.permanent_address}
                        onChange={handleInputChange}
                    />
                    {errors.permanent_address && <span className="text-red-500">{errors.permanent_address}</span>}
                </div>

                <div className="form-group">
                    <h3 className="font-semibold text-xl mb-3">Period of Stay</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="mb-4">
                            <label htmlFor="permanent_sender_name">From:</label>
                            <input
                                type="text"
                                name="updated_json.permanent_address.permanent_sender_name"
                                id="permanent_sender_name"
                                className="border w-full rounded-md p-2 mt-2 capitalize"
                                value={formData.updated_json.permanent_address.permanent_sender_name}
                                onChange={handleInputChange}
                            />
                            {errors.permanent_sender_name && <span className="text-red-500">{errors.permanent_sender_name}</span>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="permanent_reciever_name">To:</label>
                            <input
                                type="text"
                                name="updated_json.permanent_address.permanent_reciever_name"
                                id="permanent_reciever_name"
                                className="w-full border p-2 outline-none rounded-md mt-2 capitalize"
                                value={formData.updated_json.permanent_address.permanent_reciever_name}
                                onChange={handleInputChange}
                            />
                            {errors.permanent_reciever_name && <span className="text-red-500">{errors.permanent_reciever_name}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="mb-4">
                            <label htmlFor="permanent_landmark">Landmark:</label>
                            <input
                                type="text"
                                name="updated_json.permanent_address.permanent_landmark"
                                id="permanent_landmark"
                                className="border w-full rounded-md p-2 mt-2 capitalize"
                                value={formData.updated_json.permanent_address.permanent_landmark}
                                onChange={handleInputChange}
                            />
                            {errors.permanent_landmark && <span className="text-red-500">{errors.permanent_landmark}</span>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="permanent_pin_code">Pin Code:</label>
                            <input
                                type="text" // Keep as text to handle leading zeros
                                name="updated_json.permanent_address.permanent_pin_code"
                                id="permanent_pin_code"
                                className="w-full border p-2 outline-none rounded-md mt-2 capitalize"
                                value={formData.updated_json.permanent_address.permanent_pin_code}
                                onChange={handleInputChange}
                            />
                            {errors.permanent_pin_code && <span className="text-red-500">{errors.permanent_pin_code}</span>}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="permanent_state">State:</label>
                        <input
                            type="text"
                            name="updated_json.permanent_address.permanent_state"
                            id="permanent_state"
                            className="w-full border p-2 outline-none rounded-md mt-2 capitalize"
                            value={formData.updated_json.permanent_address.permanent_state}
                            onChange={handleInputChange}
                        />
                        {errors.permanent_state && <span className="text-red-500">{errors.permanent_state}</span>}
                    </div>
                </div>
            </div>

            <h3 className='text-2xl text-center font-semi-bold my-5'>Current Address</h3>
            <div className="form-group border rounded-md p-3">
            <div className="mb-4">
                <label htmlFor="full_address">Full Address:</label>
                <input
                    type="text"
                    name="updated_json.address.address"
                    id="address"
                    className="border w-full rounded-md p-2 mt-2 capitalize"
                    value={formData.updated_json.address.address}
                    onChange={handleInputChange}
                />
                {errors.address && <span className="text-red-500">{errors.address}</span>}
            </div>
            <div className="mb-4">
                <label htmlFor="Landmark">Landmark:</label>
                <input
                    type="text"
                    name="updated_json.address.landmark"
                    id="landmark"
                    className="border w-full rounded-md p-2 mt-2 capitalize"
                    value={formData.updated_json.address.landmark}
                    onChange={handleInputChange}
                />
                {errors.landmark && <span className="text-red-500">{errors.landmark}</span>}
            </div>
            <div className="mb-4">
                <label htmlFor="residence_mobile_number">Residence Mobile No:</label>
                <input
                    type="text"
                    name="updated_json.address.residence_mobile_number"
                    id="residence_mobile_number"
                    className="border w-full rounded-md p-2 mt-2 capitalize"
                    value={formData.updated_json.address.residence_mobile_number}
                    onChange={handleInputChange}
                />
                {errors.residence_mobile_number && <span className="text-red-500">{errors.residence_mobile_number}</span>}
            </div>
            <div className="mb-4">
                <label htmlFor="state">State</label>
                <input
                    type="text"
                    name="updated_json.address.state"
                    id="state"
                    className="w-full border p-2 outline-none rounded-md mt-2 capitalize"
                    value={formData.updated_json.address.state}
                    onChange={handleInputChange}
                />
                {errors.residence_mobile_number && <span className="text-red-500">{errors.residence_mobile_number}</span>}
            </div>
        </div>


            <div className="services-table border p-2 mt-5 mb-5">
                <h3 className='text-center text-2xl py-4'>Selected Services</h3>
                {serviceHeadings.map((item, index) => (
                    <div key={index} className="service-box border p-3 rounded-md w-full mb-3 flex items-center bg-slate-100">
                        <span className='w-5/12'>{item.heading}</span>
                        <select
                            className="border p-2 w-7/12"
                            value={selectedStatuses[index]}
                            onChange={(e) => handleSelectChange(index, e.target.value)}
                            required
                        >
                            <option disabled value="">--Select status--</option>
                            <option value="nil">NIL</option>
                            <option value="initiated">INITIATED</option>
                            <option value="hold">HOLD</option>
                            <option value="closure advice">CLOSURE ADVICE</option>
                            <option value="wip">WIP</option>
                            <option value="insuff">INSUFF</option>
                            <option value="completed">COMPLETED</option>
                            <option value="completed_green">COMPLETED GREEN</option>
                            <option value="completed_orange">COMPLETED ORANGE</option>
                            <option value="completed_red">COMPLETED RED</option>
                            <option value="completed_yellow">COMPLETED YELLOW</option>
                            <option value="completed_pink">COMPLETED PINK</option>
                            <option value="stopcheck">STOPCHECK</option>
                            <option value="active employment">ACTIVE EMPLOYMENT</option>
                            <option value="not doable">NOT DOABLE</option>
                            <option value="candidate denied">CANDIDATE DENIED</option>
                        </select>
                    </div>
                ))}
            </div>

            {Array.from(new Set(Object.keys(annexure))).map(serviceId => {
                const form = annexure[serviceId];
                const idNumber = Number(serviceId);

                if (renderedServices.has(idNumber)) {
                    return null;
                }

                renderedServices.add(idNumber);

                const filteredInputs = Array.isArray(allInputDetails)
                    ? allInputDetails.filter(({ serviceId: id }) => id === idNumber)
                    : [];

                const selectedDb = filteredInputs[0].db_table


                const heading = serviceHeadings.find(service => service.service_id === idNumber)?.heading || 'No heading';

                return (
                    <div key={serviceId} className="form-section mb-6">
                        <h4 className="text-2xl text-center mt-4 font-bold my-5">
                            {heading}
                        </h4>

                        <div className="form-group bg-slate-100 p-3 rounded-md mb-4">
                            {filteredInputs.length > 0 ? (
                                filteredInputs.flatMap(({ inputDetails }) => inputDetails).map((input) => (

                                    <div key={input.name} className="mb-4">
                                        <label className='capitalize' htmlFor={input.name}>
                                            {input.label}
                                        </label>
                                        {input.type === 'text' || input.type === 'datepicker' ? (
                                            <input
                                                type="text"
                                                name={input.name}
                                                id={input.name}
                                                value={input.value}
                                                className="border w-full rounded-md p-2 mt-2"
                                                onChange={handleChange}
                                            />
                                        ) : input.type === 'dropdown' ? (
                                            <select
                                                name={input.name}
                                                id={input.name}
                                                className="border w-full rounded-md p-2 mt-2"
                                                onChange={handleChange}
                                                value={input.value}
                                            >
                                                <option value="">Select...</option>
                                                {input.options.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.showText}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : input.type === 'file' ? (
                                            <input
                                                type="file"
                                                name={input.name}
                                                id={input.name}
                                                className="border w-full rounded-md p-2 mt-2"
                                                onChange={(e) => handleFileChange(input.name, e, selectedDb)}
                                            />
                                        ) : null}
                                        {errors[input.name] && (
                                            <span className="text-red-600">{errors[input.name]}</span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No inputs available for this service.</p>
                            )}
                        </div>
                    </div>
                );
            })}



            <div className="form-group border rounded-md p-3">
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="first_insufficiency_marks">First Level Insufficiency Remarks</label>
                    <input
                        type="text"
                        name="updated_json.insuffDetails.first_insufficiency_marks"
                        id="first_insufficiency_marks"
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                        value={formData.updated_json.insuffDetails.first_insufficiency_marks}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="first_insuff_date">First Insuff Raised Date:</label>
                    <input
                        type="date"
                        name="updated_json.insuffDetails.first_insuff_date"
                        id="first_insuff_date"
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                        value={formData.updated_json.insuffDetails.first_insuff_date}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="first_insuff_reopened_date">First Insuff Cleared Date / Re-Opened date</label>
                    <input
                        type="date"
                        name="updated_json.insuffDetails.first_insuff_reopened_date"
                        id="first_insuff_reopened_date"
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                        value={formData.updated_json.insuffDetails.first_insuff_reopened_date}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="second Level Insufficiency Remarks">Second Level Insufficiency Remarks</label>
                    <input
                        type="text"
                        name="updated_json.insuffDetails.second_insufficiency_marks"
                        id="second_insufficiency_marks"
                        value={formData.updated_json.insuffDetails.second_insufficiency_marks}
                        onChange={handleInputChange}
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                    />

                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="second Insuff Raised Date:">Second Insuff Raised Date:</label>
                    <input
                        type="date"
                        name="updated_json.insuffDetails.second_insuff_date"
                        id="second_insuff_date"
                        value={formData.updated_json.insuffDetails.second_insuff_dat}
                        onChange={handleInputChange}
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                    />

                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="second Insuff Cleared Date / Re-Opened date">Second Insuff Cleared Date / Re-Opened date</label>
                    <input
                        type="date"
                        name="updated_json.insuffDetails.second_insuff_reopened_date"
                        id="second_insuff_reopened_date"
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                        value={formData.updated_json.insuffDetails.second_insuff_reopened_dat}
                        onChange={handleInputChange}
                    />

                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="third Level Insufficiency Remarks">third Level Insufficiency Remarks</label>
                    <input
                        type="text"
                        name="updated_json.insuffDetails.third_insufficiency_marks"
                        id="third_insufficiency_marks"
                        value={formData.updated_json.insuffDetails.third_insufficiency_marks}
                        onChange={handleInputChange}
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                    />

                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="third Insuff Raised Date:">third Insuff Raised Date:</label>
                    <input
                        type="date"
                        name="updated_json.insuffDetails.third_insuff_date"
                        id="third_insuff_date"
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                        value={formData.updated_json.insuffDetails.third_insuff_date}
                        onChange={handleInputChange}
                    />

                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="third Insuff Cleared Date / Re-Opened date">third Insuff Cleared Date / Re-Opened date</label>
                    <input
                        type="date"
                        name="updated_json.insuffDetails.third_insuff_reopened_date"
                        id="third_insuff_reopened_date"
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                        value={formData.updated_json.insuffDetails.third_insuff_reopened_dat}
                        onChange={handleInputChange}
                    />

                </div>
                <div className="mb-4 ">
                    <label className='capitalize text-gray-500' htmlFor="overall status">overall status</label>
                    <select
                        name="updated_json.insuffDetails.overall_status"
                        value={formData.updated_json.insuffDetails.overall_status}
                        onChange={handleInputChange}
                        className="border rounded-md p-2 mt-2 uppercase w-full"
                    >
                        <option value="insuff">insuff</option>
                        <option value="initiated">initiated</option>
                        <option value="wip">wip</option>
                        <option value="hold">hold</option>
                        <option value="completed" disabled={!isAllCompleted}>
                            completed
                        </option>
                    </select>

                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label className='capitalize text-gray-500' htmlFor="report date">report date</label>
                        <input
                            type="date"
                            name="updated_json.insuffDetails.report_date"
                            id="report_date"
                            className="border rounded-md p-2 w-full mt-2 capitalize"
                            value={formData.updated_json.insuffDetails.report_date}
                            onChange={handleInputChange}
                        />

                    </div>
                    <div className="mb-4">
                        <label className='capitalize text-gray-500' htmlFor="overall status">Report Status:</label>
                        <select name="updated_json.insuffDetails.report_status" id=""
                            value={formData.updated_json.insuffDetails.report_status}
                            onChange={handleInputChange}
                            className="border rounded-md p-2 mt-2 uppercase w-full">
                            <option value="insuff">insuff</option>
                            <option value="inititated">inititated</option>
                            <option value="wip" >wip</option>
                            <option value="hold">hold</option>
                        </select>

                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label className='capitalize text-gray-500' htmlFor="report status">Report Type:</label>
                        <select name="updated_json.insuffDetails.report_type" id=""
                            value={formData.updated_json.insuffDetails.report_type}
                            onChange={handleInputChange}
                            className="border rounded-md p-2 mt-2 uppercase w-full">
                            <option value="insuff">insuff</option>
                            <option value="inititated">inititated</option>
                            <option value="wip" >wip</option>
                            <option value="hold">hold</option>
                        </select>

                    </div>
                    <div className="mb-4">
                        <label className='capitalize text-gray-500' htmlFor="Final Verification Status:">Final Verification Status:</label>
                        <select name="updated_json.insuffDetails.final_verification_status"
                            value={formData.updated_json.insuffDetails.final_verification_status}
                            onChange={handleInputChange}
                            id="" className="border w-full rounded-md p-2 mt-2 uppercase">
                            <option value="insuff">insuff</option>
                            <option value="inititated">inititated</option>
                            <option value="wip" >wip</option>
                            <option value="hold">hold</option>
                        </select>



                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label className='capitalize text-gray-500  ' htmlFor="Is verified by quality team">Is verified by quality team</label>
                        <select name="updated_json.insuffDetails.is_verify"
                            value={formData.updated_json.insuffDetails.is_verify}
                            onChange={handleInputChange}

                            id="" className="border w-full rounded-md p-2 mt-2 uppercase">
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                        </select>

                    </div>
                    <div className="mb-4">
                        <label className='capitalize text-gray-500 ' htmlFor="deadline date">deadline date</label>
                        <input
                            type="date"
                            name="updated_json.insuffDetails.deadline_date"
                            id="deadline_date"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.insuffDetails.deadline_date}
                            onChange={handleInputChange}
                        />

                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4">
                        <label className='capitalize text-gray-500 ' htmlFor="Address">Address</label>
                        <select name="updated_json.insuffDetails.insuff_address"
                            value={formData.updated_json.insuffDetails.insuff_address}
                            onChange={handleInputChange}
                            id="" className="border w-full rounded-md p-2 mt-2 uppercase">
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                        </select>

                    </div>
                    <div className="mb-4 ">
                        <label className='capitalize text-gray-500' htmlFor="basic entry">basic entry</label>
                        <select name="updated_json.insuffDetails.basic_entry"
                            value={formData.updated_json.insuffDetails.basic_entry}
                            onChange={handleInputChange}
                            id="" className="border w-full rounded-md p-2 mt-2 uppercase">
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                        </select>

                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4 ">
                        <label className='capitalize text-gray-500 ' htmlFor="education">education</label>
                        <select name="updated_json.insuffDetails.education" id=""
                            value={formData.updated_json.insuffDetails.education}
                            onChange={handleInputChange}
                            className="border w-full rounded-md p-2 mt-2 uppercase">
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                        </select>

                    </div>

                    <div className="mb-4">
                        <label className='capitalize text-gray-500' htmlFor="case upload">case upload</label>
                        <input
                            type="text"
                            name="updated_json.insuffDetails.case_upload"
                            id="case_upload"
                            className="border w-full rounded-md p-2 mt-2 capitalize"
                            value={formData.updated_json.insuffDetails.case_upload}
                            onChange={handleInputChange}
                        />

                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-4 ">
                        <label className='capitalize text-gray-500 block' htmlFor="Employment Spoc:">Employment Spoc:</label>
                        <select name="updated_json.insuffDetails.emp_spoc" id=""
                            value={formData.updated_json.insuffDetails.emp_spoc}
                            onChange={handleInputChange}
                            className="border w-full rounded-md p-2 mt-2 uppercase">
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                        </select>

                    </div>
                    <div className="mb-4 ">
                        <label className='capitalize text-gray-500' htmlFor="Report Generated By:">Report Generated By:</label>
                        <select name="updated_json.insuffDetails.report_generate_by"
                            value={formData.updated_json.insuffDetails.report_generate_by}
                            onChange={handleInputChange}
                            id="" className="border w-full rounded-md p-2 mt-2 uppercase">
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                        </select>

                    </div>
                </div>
                <div className="mb-4 ">
                    <label className='capitalize block text-gray-500' htmlFor="QC Done By:">QC Done By:</label>

                    <select name="updated_json.insuffDetails.qc_done_by"
                        value={formData.updated_json.insuffDetails.qc_done_by}
                        onChange={handleInputChange}
                        id="" className="border w-full rounded-md p-2 mt-2 uppercase">
                        <option value="yes">yes</option>
                        <option value="no">no</option>
                    </select>

                </div>
                <div className="mb-4">
                    <label className='capitalize text-gray-500' htmlFor="Remarks & reason for Delay:">Remarks & reason for Delay:</label>
                    <input
                        type="text"
                        value={formData.updated_json.insuffDetails.delay_reason}
                        onChange={handleInputChange}
                        name="updated_json.insuffDetails.delay_reason"
                        id="delay_reason"
                        className="border w-full rounded-md p-2 mt-2 capitalize"
                    />

                </div>
            </div>
            <button type='submit' className='w-full bg-green-500 p-3 rounded-md m-3 text-white'>submit</button>
        </form>
    );
};

export default CandidateApplications;