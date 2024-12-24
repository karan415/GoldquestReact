import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import PulseLoader from 'react-spinners/PulseLoader'; // Import the PulseLoader
import LogoBgv from '../Images/LogoBgv.jpg'
import { FaGraduationCap, FaBriefcase, FaIdCard } from 'react-icons/fa';
const BackgroundForm = () => {
    const storedBranchData = JSON.parse(localStorage.getItem("branch"));
    const [errors, setErrors] = useState({});


    const [files, setFiles] = useState({});
    const [serviceData, setServiceData] = useState([]);
    const [status, setStatus] = useState([]);
    const [apiStatus, setApiStatus] = useState(true);
    const [annexureData, setAnnexureData] = useState({});
    const [serviceIds, setServiceIds] = useState(''); // Expecting a comma-separated string
    const [formData, setFormData] = useState({
        personal_information: {
            full_name: '',
            former_name: '',
            mb_no: '',
            father_name: '',
            husband_name: '',
            dob: '',
            gender: '',
            full_address: '',
            pin_code: '',
            current_address: '',
            current_address_landline_number: '',
            current_address_state: '',
            current_prominent_landmark: '',
            current_address_stay_to: '',
            nearest_police_station: '',
            nationality: '',
            marital_status: '',
            name_declaration: '',
            declaration_date: '',
            blood_group: '',
            pan_card_name: '',
            aadhar_card_name: '',
            emergency_details_name: '',
            emergency_details_relation: '',
            emergency_details_contact_number: '',
            pf_details_pf_number: '',
            pf_details_pf_type: '',
            pf_details_pg_nominee: '',
            nps_details_details_pran_number: '',
            nps_details_details_nominee_details: '',
            nps_details_details_nps_contribution: '',
            bank_details_account_number: '',
            bank_details_bank_name: '',
            bank_details_branch_name: '',
            bank_details_ifsc_code: '',
            insurance_details_name: '',
            insurance_details_nominee_relation: '',
            insurance_details_nominee_dob: '',
            insurance_details_contact_number: '',
            icc_bank_acc: '',
            food_coupon: "",

        },
    });

    const [companyName, setCompanyName] = useState([]);
    const refs = useRef({});

    const [isValidApplication, setIsValidApplication] = useState(true);
    const location = useLocation();
    const currentURL = location.pathname + location.search;

    const [loading, setLoading] = useState(false);

    const getValuesFromUrl = (currentURL) => {
        const result = {};
        const keys = [
            "YXBwX2lk",
            "YnJhbmNoX2lk",
            "Y3VzdG9tZXJfaWQ="
        ];

        keys.forEach(key => {
            const regex = new RegExp(`${key}=([^&]*)`);
            const match = currentURL.match(regex);
            result[key] = match && match[1] ? match[1] : null;
        });

        const isValidBase64 = (str) => {
            const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
            return base64Pattern.test(str) && (str.length % 4 === 0);
        };

        const decodeKeyValuePairs = (obj) => {
            return Object.entries(obj).reduce((acc, [key, value]) => {
                const decodedKey = isValidBase64(key) ? atob(key) : key;
                const decodedValue = value && isValidBase64(value) ? atob(value) : null;
                acc[decodedKey] = decodedValue;
                return acc;
            }, {});
        };

        return decodeKeyValuePairs(result);
    };

    const decodedValues = getValuesFromUrl(currentURL);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({
                ...formData,
                personal_information: {
                    ...formData.personal_information,
                    [name]: value
                }
            });
        }
    };


    const validate = () => {
        const newErrors = {}; // Object to hold validation errors
        const requiredFields = [
            "full_name", "former_name", "mb_no", "father_name", "husband_name", "dob",
            "gender", "full_address", "pin_code", "current_address", "current_address_landline_number",
            "current_address_state", "current_prominent_landmark", "current_address_stay_to",
            "nearest_police_station", "nationality", "marital_status",
        ];

        if (status === 1) {
            const additionalFields = [
                "name_declaration", "declaration_date", "pan_card_name", "aadhar_card_name",
                "emergency_details_name", "emergency_details_relation", "emergency_details_contact_number",
                "bank_details_account_number", "bank_details_bank_name", "bank_details_branch_name",
                "bank_details_ifsc_code", "insurance_details_name", "insurance_details_nominee_relation",
                "insurance_details_nominee_dob", "insurance_details_contact_number", "icc_bank_acc", "food_coupon"
            ];

            // Concatenate the requiredFields array with additionalFields
            requiredFields.push(...additionalFields);
        }

        const maxSize = 2 * 1024 * 1024; // 2MB size limit
        const allowedTypes = [
            "image/jpeg", "image/png", "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]; // Allowed file types


        const validateFile = (fileName) => {

            // Check if there are existing errors and if none contain 'is required'
            if (errors[fileName] && errors[fileName].length > 0 && !errors[fileName].some(error => error.toLowerCase().includes('is required'))) {
                return errors[fileName];
            } else {
                // Correct dynamic property access to get the selected file
                const file = files[`applications_${fileName}`]?.selectedFiles;

                let fileErrors = [];
                if (file) {
                    // Validate each file item
                    file.forEach((fileItem) => {

                        if (fileItem.size > maxSize) {
                            const errorMessage = `${fileItem.name}: File size must be less than 2MB.`;
                            fileErrors.push(errorMessage);
                        }

                        if (!allowedTypes.includes(fileItem.type)) {
                            const errorMessage = `${fileItem.name}: Invalid file type. Only JPG, PNG, PDF, DOCX, and XLSX are allowed.`;
                            fileErrors.push(errorMessage);
                        }
                    });
                } else {
                    const errorMessage = `${fileName} is required.`;
                    fileErrors.push(errorMessage);
                }

                return fileErrors;
            }
        };




        const requiredFileInputs = ["govt_id", "resume_file", "signature",];

        if (status === 1) {
            const additionalImagesFields = ["passport_photo", "aadhar_card_image", "pan_card_image"];

            // Concatenate the requiredFields array with additionalFields
            requiredFileInputs.push(...additionalImagesFields);
        }
        requiredFileInputs.forEach((field) => {
            const agrUploadErrors = validateFile(field);
            if (agrUploadErrors.length > 0) {
                newErrors[field] = agrUploadErrors;
            }
        });

        // Validate required fields
        requiredFields.forEach((field) => {
            if (
                !formData.personal_information[field] ||
                formData.personal_information[field].trim() === ""
            ) {
                newErrors[field] = "This field is required*";
            }
        });

        return newErrors;
    };


    let messageBoxText;

    const handleServiceChange = (serviceKey, inputName, value) => {
        setAnnexureData((prevData) => ({
            ...prevData,
            [serviceKey]: {
                ...prevData[serviceKey],
                [inputName]: value,
            },
        }));


    };
    const fetchApplicationStatus = async () => {
        if (
            isValidApplication &&
            decodedValues.app_id &&
            decodedValues.branch_id &&
            decodedValues.customer_id
        ) {
            try {
                const response = await fetch(
                    `https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/is-application-exist?candidate_application_id=${decodedValues.app_id}&branch_id=${decodedValues.branch_id}&customer_id=${decodedValues.customer_id}`
                );

                const result = await response.json();

                console.log("Result:", result); // Debugging log

                if (result?.status) {
                    // Application exists and is valid
                    setServiceIds(result.data?.services || '');
                    setStatus(result.data?.is_custom_bgv || '');
                    setCompanyName(result.data?.company_name || '');


                } else {
                    // Application does not exist or other error: Hide the form and show an alert
                    const form = document.getElementById('bg-form');
                    if (form) {
                        form.remove();
                        console.log("Form removed"); // Debugging log
                    } else {
                        console.log("Form not found"); // Debugging log
                    }
                    setApiStatus(false);
                    messageBoxText = result.message;

                    // Show message from the response
                    Swal.fire({
                        title: 'Notice',
                        text: result.message || 'Application does not exist.',
                        icon: 'warning',
                        confirmButtonText: 'OK',
                    });
                }
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: err.message || 'An unexpected error occurred.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    useEffect(() => {


        fetchApplicationStatus();
    }, []); // The empty array ensures this runs only once, on mount


    const fetchData = useCallback(() => {
        if (!serviceIds) return; // No service IDs to fetch

        const serviceArr = serviceIds.split(',').map(Number);
        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };

        const fetchPromises = serviceArr.map(serviceId =>
            fetch(
                `https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/service-form-json?service_id=${serviceId}`,
                requestOptions
            )
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Error fetching service ID ${serviceId}: ${res.statusText}`);
                    }
                    return res.json();
                })
        );

        Promise.all(fetchPromises)
            .then(results => {
                const combinedResults = results.flatMap(result => result.formJson || []);
                const parsedData = combinedResults.map(item => {
                    try {
                        const cleanedJson = item.json.replace(/\\/g, '\\\\');
                        return JSON.parse(cleanedJson);
                    } catch (error) {
                        console.error('JSON Parse Error:', error, 'for item:', item);
                        return null;
                    }
                }).filter(data => data !== null);

                setServiceData(parsedData);
            })
            .catch(err => console.error('Fetch error:', err));
    }, [serviceIds]);

    useEffect(() => {
        if (serviceIds) {
            fetchData();
        }
    }, [fetchData, serviceIds]); // Dependencies to control re-run


    const uploadCustomerLogo = async (cef_id) => {
        setLoading(true); // Set loading to true when starting the upload

        const fileCount = Object.keys(files).length;

        for (const [index, [key, value]] of Object.entries(files).entries()) {
            const customerLogoFormData = new FormData();
            customerLogoFormData.append('branch_id', decodedValues.branch_id);
            customerLogoFormData.append('customer_id', decodedValues.customer_id);
            customerLogoFormData.append('candidate_application_id', decodedValues.app_id);

            const dbTableRaw = key; // Fixed the typo here
            const dbColumn = value.fileName;
            const dbTable = dbTableRaw.replace("_" + dbColumn, ''); // Removes dbColumn from dbTableRaw

            customerLogoFormData.append('db_table', dbTable);
            customerLogoFormData.append('db_column', value.fileName);
            customerLogoFormData.append('cef_id', cef_id);

            for (const file of value.selectedFiles) {
                customerLogoFormData.append('images', file);
            }

            if (fileCount === index + 1) {
                customerLogoFormData.append('send_mail', 1);
            }

            try {
                await axios.post(
                    `https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/upload`,
                    customerLogoFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            } catch (err) {
                Swal.fire('Error!', `An error occurred while uploading logo: ${err.message}`, 'error');
            }
        }

        setLoading(false); // Set loading to false once the upload is complete
    };

    const handleFileChange = (dbTable, fileName, e) => {

        const selectedFiles = Array.from(e.target.files); // Convert FileList to an array

        const maxSize = 2 * 1024 * 1024; // 2MB size limit
        const allowedTypes = [
            'image/jpeg', 'image/png', 'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]; // Allowed file types

        let errors = [];
        selectedFiles.forEach((file) => {
            // Check file size
            if (file.size > maxSize) {
                errors.push(`${file.name}: File size must be less than 2MB.`);
            }

            // Check file type (MIME type)
            if (!allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Invalid file type. Only JPG, PNG, PDF, DOCX, and XLSX are allowed.`);
            }
        });

        // If there are errors, show them and don't update the state
        if (errors.length > 0) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [fileName]: errors, // Set errors for this file
            }));
            return; // Don't update state if there are errors
        }

        // If no errors, update the state with the selected files
        setFiles((prevFiles) => ({
            ...prevFiles,
            [dbTable]: { selectedFiles, fileName },
        }));

        setErrors((prevErrors) => {
            const { [fileName]: removedError, ...restErrors } = prevErrors; // Remove the error for this field if valid
            return restErrors;
        });


    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
    
        let newErrors = {};
    
        const validationError = validate();
    
        // Merge flat and nested validation errors
        Object.keys(validationError).forEach((key) => {
            if (validationError[key]) {
                newErrors[key] = validationError[key];
            }
        });
    
        // Show errors only for the current submission
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            console.log(`newErrors - `, errors);
    
            // Focus on the first field with an error
            const errorField = Object.keys(newErrors)[0];
            if (refs.current[errorField]) {
                refs.current[errorField].focus();
            }
    
            return;
        } else {
            setErrors({});
        }
    
        // Count files to determine if mail should be sent
        const fileCount = Object.keys(files).length;
    
        // Prepare request data
        const requestData = {
            branch_id: decodedValues.branch_id,
            customer_id: decodedValues.customer_id,
            application_id: decodedValues.app_id,
            ...formData,
            annexure: annexureData,
            send_mail: fileCount === 0 ? 1 : 0, // Send mail if no files are uploaded
        };
    
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(requestData),
            redirect: "follow",
        };
    
        setLoading(true); // Start loading indicator
    
        try {
            // Send the request
            const response = await fetch(
                "https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/submit",
                requestOptions
            );
    
            // Check if the response is not OK
            if (!response.ok) {
                const errorResponse = await response.json(); // Get the error message from the response body
                throw new Error(errorResponse.message || `HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
    
            // Success handling based on file count
            if (fileCount === 0) {
                Swal.fire({
                    title: "Success",
                    text: `CEF Application Created Successfully.`,
                    icon: "success",
                    confirmButtonText: "Ok",
                });
            } else {
                // Upload files if present
                await uploadCustomerLogo(result.cef_id);
                Swal.fire({
                    title: "Success",
                    text: `CEF Application Created Successfully and files uploaded.`,
                    icon: "success",
                    confirmButtonText: "Ok",
                });
            }
    
            // Refresh application status
            fetchApplicationStatus();
        } catch (error) {
            console.error("Error:", error);
    
            // Error alert with the API message
            Swal.fire("Error!", error.message, "error");
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };
    



    return (
        <>
            {
                loading ? (
                    <div className='flex justify-center items-center py-6 ' >
                        <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />

                    </div >
                ) : <form action="" className='py-6' onSubmit={handleSubmit} id='bg-form'>
                    {status === 1 && (
                        <div className='d-flex justify-center my-3'> <img src={LogoBgv} className='w-[12%] m-auto' /></div>
                    )
                    }
                    <h4 className="text-green-600 text-xl mb-6 text-center font-bold">Background Verification Form</h4>

                    <div className="p-6 rounded md:w-8/12 m-auto ">
                        <div className="mb-6  p-4 rounded-md">
                            <h5 className="text-lg font-bold">Company name: <span className="text-lg font-normal">{companyName}</span></h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6 border rounded-md  p-4">
                            <div className="form-group col-span-2">
                                <label>Applicant’s CV: <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx" // Restrict to specific file types

                                    className="form-control border rounded w-full bg-white p-3 mt-2"
                                    name="resume_file"
                                    id="resume_file"
                                    onChange={(e) => handleFileChange("applications_resume_file", "resume_file", e)}
                                    ref={(el) => (refs.current["resume_file"] = el)} // Attach ref here

                                />
                                {errors.resume_file && <p className="text-red-500">{errors.resume_file}</p>}
                                <p className="text-gray-500 text-sm mt-2">
                                    Only JPG, PNG, PDF, DOCX, and XLSX files are allowed. Max file size: 2MB.
                                </p>
                            </div>
                            <div className="form-group col-span-2">
                                <label>Attach Govt. ID Proof: <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx" // Restrict to specific file types

                                    className="form-control border rounded w-full bg-white p-3 mt-2"
                                    name="govt_id"
                                    onChange={(e) => handleFileChange("applications_govt_id", "govt_id", e)}
                                    multiple
                                    ref={(el) => (refs.current["applications_govt_id"] = el)} // Attach ref here

                                />
                                {errors.govt_id && <p className="text-red-500">{errors.govt_id}</p>}
                                <p className="text-gray-500 text-sm mt-2">
                                    Only JPG, PNG, PDF, DOCX, and XLSX files are allowed. Max file size: 2MB.
                                </p>
                            </div>
                            {status === 1 && (
                                <>
                                    <div className='border p-4 my-4 rounded-md gap-4 grid grid-cols-2'>
                                        <div className='form-group'>
                                            <label>Name as per Aadhar card</label>
                                            <input
                                                type="text"
                                                name="aadhar_card_name"
                                                value={formData.personal_information.aadhar_card_name}
                                                onChange={handleChange}
                                                ref={(el) => (refs.current["aadhar_card_name"] = el)} // Attach ref here

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                            {errors.aadhar_card_name && <p className="text-red-500">{errors.aadhar_card_name}</p>}

                                        </div>
                                        <div className='form-group'>
                                            <label>Aadhar Card Image</label>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx" // Restrict to specific file types

                                                name="aadhar_card_image"
                                                onChange={(e) => handleFileChange("applications_aadhar_card_image", "aadhar_card_image", e)}
                                                className="form-control border rounded w-full p-1 mt-2"
                                                ref={(el) => (refs.current["aadhar_card_image"] = el)} // Attach ref here


                                            />
                                            {errors.aadhar_card_image && <p className="text-red-500">{errors.aadhar_card_image}</p>}
                                            <p className="text-gray-500 text-sm mt-2">
                                                Only JPG, PNG, PDF, DOCX, and XLSX files are allowed. Max file size: 2MB.
                                            </p>
                                        </div>
                                        <div className='form-group'>
                                            <label>Name as per Pan Card</label>
                                            <input
                                                type="text"
                                                name="pan_card_name"
                                                value={formData.personal_information.pan_card_name}
                                                onChange={handleChange}
                                                ref={(el) => (refs.current["pan_card_name"] = el)} // Attach ref here

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                            {errors.pan_card_name && <p className="text-red-500">{errors.pan_card_name}</p>}
                                        </div>
                                        <div className='form-group'>
                                            <label>Pan Card Image</label>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx" // Restrict to specific file types

                                                name="pan_card_image"
                                                onChange={(e) => handleFileChange("applications_pan_card_image", "pan_card_image", e)}
                                                className="form-control border rounded w-full p-1 mt-2"
                                                ref={(el) => (refs.current["pan_card_image"] = el)} // Attach ref here


                                            />
                                            {errors.pan_card_image && <p className="text-red-500">{errors.pan_card_image}</p>}
                                            <p className="text-gray-500 text-sm mt-2">
                                                Only JPG, PNG, PDF, DOCX, and XLSX files are allowed. Max file size: 2MB.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="form-group col-span-2">
                                        <label>Passport size photograph  - (mandatory with white Background) <span className="text-red-500">*</span></label>
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx" // Restrict to specific file types

                                            className="form-control border rounded w-full bg-white p-3 mt-2"
                                            name="passport_photo"
                                            onChange={(e) => handleFileChange("applications_passport_photo", "passport_photo", e)}
                                            multiple
                                            ref={(el) => (refs.current["passport_photo"] = el)} // Attach ref here

                                        />
                                        {errors.passport_photo && <p className="text-red-500">{errors.passport_photo}</p>}
                                        <p className="text-gray-500 text-sm mt-2">
                                            Only JPG, PNG, PDF, DOCX, and XLSX files are allowed. Max file size: 2MB.
                                        </p>
                                    </div>
                                </>
                            )}

                        </div>

                        <h4 className="text-center text-xl my-6 font-bold ">Personal Information</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border  p-4 rounded-md">
                            <div className="form-group">
                                <label htmlFor="full_name">Full Name as per Govt ID Proof (first, middle, last): <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.full_name}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="full_name"
                                    name="full_name"
                                    ref={(el) => (refs.current["full_name"] = el)}

                                />
                                {errors.full_name && <p className="text-red-500">{errors.full_name}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Full Address<span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.full_address}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="full_address"
                                    name="full_address"
                                    ref={(el) => (refs.current["full_address"] = el)} // Attach ref here

                                />
                                {errors.full_address && <p className="text-red-500">{errors.full_address}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Address <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.current_address}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_address"
                                    name="current_address"
                                    ref={(el) => (refs.current["current_address"] = el)} // Attach ref here

                                />
                                {errors.current_address && <p className="text-red-500">{errors.current_address}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="pin_code">Pin Code <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.pin_code}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="pin_code"
                                    name="pin_code"
                                    ref={(el) => (refs.current["pin_code"] = el)} // Attach ref here

                                />
                                {errors.pin_code && <p className="text-red-500">{errors.pin_code}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="current_address_landline_number">Current Landline Number <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.current_address_landline_number}
                                    type="number"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_address_landline_number"
                                    name="current_address_landline_number"
                                    ref={(el) => (refs.current["current_address_landline_number"] = el)} // Attach ref here

                                />
                                {errors.current_address_landline_number && <p className="text-red-500">{errors.current_address_landline_number}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="current_address_state">Current State <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.current_address_state}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_address_state"
                                    name="current_address_state"
                                    ref={(el) => (refs.current["current_address_state"] = el)} // Attach ref here

                                />
                                {errors.current_address_state && <p className="text-red-500">{errors.current_address_state}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="current_prominent_landmark">Current Landmark<span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.current_prominent_landmark}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_prominent_landmark"
                                    name="current_prominent_landmark"
                                    ref={(el) => (refs.current["current_prominent_landmark"] = el)} // Attach ref here

                                />
                                {errors.current_prominent_landmark && <p className="text-red-500">{errors.current_prominent_landmark}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="current_address_stay_to">Current Address Stay No.<span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.current_address_stay_to}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_address_stay_to"
                                    name="current_address_stay_to"
                                    ref={(el) => (refs.current["current_address_stay_to"] = el)} // Attach ref here

                                />
                                {errors.current_address_stay_to && <p className="text-red-500">{errors.current_address_stay_to}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="nearest_police_station">Nearest Police Station.<span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.nearest_police_station}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="nearest_police_station"
                                    name="nearest_police_station"
                                    ref={(el) => (refs.current["nearest_police_station"] = el)} // Attach ref here

                                />
                                {errors.nearest_police_station && <p className="text-red-500">{errors.nearest_police_station}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="former_name">Former Name/ Maiden Name (if applicable):</label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.former_name}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="former_name"
                                    ref={(el) => (refs.current["former_name"] = el)} // Attach ref here
                                    name="former_name"
                                />
                                {errors.former_name && <p className="text-red-500">{errors.former_name}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="mob_no">Mobile Number: <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.mb_no}
                                    type="tel"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="mb_no"
                                    id="mob_no"
                                    minLength="10"
                                    maxLength="10"
                                    ref={(el) => (refs.current["mob_no"] = el)} // Attach ref here

                                />
                                {errors.mb_no && <p className="text-red-500">{errors.mb_no}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="father_name">Father's Name: <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.father_name}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="father_name"
                                    name="father_name"
                                    ref={(el) => (refs.current["father_name"] = el)} // Attach ref here

                                />
                                {errors.father_name && <p className="text-red-500">{errors.father_name}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="husband_name">Spouse's Name:</label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.husband_name}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="husband_name"
                                    ref={(el) => (refs.current["husband_name"] = el)} // Attach ref here
                                    name="husband_name"
                                />
                                {errors.husband_name && <p className="text-red-500">{errors.husband_name}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="dob">DOB: <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.dob}
                                    type="date"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="dob"
                                    id="dob"
                                    ref={(el) => (refs.current["dob"] = el)} // Attach ref here

                                />
                                {errors.dob && <p className="text-red-500">{errors.dob}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">Gender: <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.gender}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="gender"
                                    id="gender"
                                    ref={(el) => (refs.current["gender"] = el)} // Attach ref here

                                />
                                {errors.gender && <p className="text-red-500">{errors.gender}</p>}
                            </div>



                            <div className="form-group">
                                <label htmlFor="nationality">Nationality: <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.nationality}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="nationality"
                                    id="nationality"
                                    ref={(el) => (refs.current["nationality"] = el)} // Attach ref here

                                />
                                {errors.nationality && <p className="text-red-500">{errors.nationality}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="marital_status">Marital Status: <span className="text-red-500">*</span></label>
                                <select
                                    ref={(el) => (refs.current["marital_status"] = el)}
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="marital_status"
                                    id="marital_status"
                                    onChange={handleChange}

                                >
                                    <option value="">SELECT Marital STATUS</option>
                                    <option value="Dont wish to disclose">Don't wish to disclose</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Separated">Separated</option>
                                </select>
                                {errors.marital_status && <p className="text-red-500">{errors.marital_status}</p>}
                            </div>
                        </div>
                        {status === 1 && (
                            <>
                                <label>Blood Group</label>
                                <div className='form-group'>
                                    <input
                                        type="text"
                                        name="blood_group"
                                        value={formData.personal_information.blood_group}
                                        onChange={handleChange}
                                        className="form-control border rounded w-full p-2 mt-2"
                                    />
                                </div>




                                <div className='form-group'>
                                    <label>Declaration Date:</label>
                                    <input
                                        type="date"
                                        name="declaration_date"
                                        value={formData.personal_information.declaration_date}
                                        onChange={handleChange}
                                        ref={(el) => (refs.current["declaration_date"] = el)}
                                        className="form-control border rounded w-full p-2 mt-2"
                                    />
                                    {errors.declaration_date && <p className="text-red-500">{errors.declaration_date}</p>}
                                </div>

                                <div className='border rounded-md p-3 mt-3'>
                                    <h3 className='text-center text-xl font-bold pb-4'>Add Emergency Contact Details</h3>
                                    <div className='grid grid-cols-3 gap-3'>
                                        <div className='form-group'>
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                name="emergency_details_name"
                                                value={formData.personal_information.emergency_details_name}
                                                onChange={handleChange}
                                                ref={(el) => (refs.current["emergency_details_name"] = el)} // Attach ref here

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                            {errors.emergency_details_name && <p className="text-red-500">{errors.emergency_details_name}</p>}
                                        </div>
                                        <div className='form-group'>
                                            <label>Relation</label>
                                            <input
                                                type="text"
                                                name="emergency_details_relation"
                                                value={formData.personal_information.emergency_details_relation}
                                                onChange={handleChange}
                                                ref={(el) => (refs.current["emergency_details_relation"] = el)} // Attach ref here

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                            {errors.emergency_details_relation && <p className="text-red-500">{errors.emergency_details_relation}</p>}
                                        </div>
                                        <div className='form-group'>
                                            <label>Contact Number</label>
                                            <input
                                                type="text"
                                                name="emergency_details_contact_number"
                                                value={formData.personal_information.emergency_details_contact_number}
                                                onChange={handleChange}
                                                ref={(el) => (refs.current["emergency_details_contact_number"] = el)} // Attach ref here

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                            {errors.emergency_details_contact_number && <p className="text-red-500">{errors.emergency_details_contact_number}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className='border rounded-md p-3 mt-3'>
                                    <h3 className='text-center text-xl font-bold pb-4'>Add PF Details</h3>
                                    <div className='grid grid-cols-3 gap-3'>
                                        <div className='form-group'>
                                            <label>PF Number</label>
                                            <input
                                                type="text"
                                                name="pf_details_pf_number"
                                                value={formData.personal_information.pf_details_pf_number}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>PF Type</label>
                                            <input
                                                type="text"
                                                name="pf_details_pf_type"
                                                value={formData.personal_information.pf_details_pf_type}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>PF Nominee</label>
                                            <input
                                                type="text"
                                                name="pf_details_pg_nominee"
                                                value={formData.personal_information.pf_details_pg_nominee}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='border rounded-md p-3 mt-3'>
                                    <h3 className='text-center text-xl font-bold pb-4'>Do you have an NPS Account? If yes</h3>
                                    <div className='grid grid-cols-3 gap-3'>
                                        <div className='form-group '>
                                            <label>PRAN (Permanent Retirement Account Number).</label>
                                            <input
                                                type="text"
                                                name="nps_details_details_pran_number"
                                                value={formData.personal_information.nps_details_details_pran_number}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Enter Nominee Details of NPS. </label>
                                            <input
                                                type="text"
                                                name="nps_details_details_nominee_details"
                                                value={formData.personal_information.nps_details_details_nominee_details}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Enter your contribution details of NPS</label>
                                            <input
                                                type="text"
                                                name="nps_details_details_nps_contribution"
                                                value={formData.personal_information.nps_details_details_nps_contribution}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <label className='mt-5 block'>Do you have an ICICI Bank A/c</label>

                                <div className='flex gap-6 mb-4'>
                                    <div className='form-group pt-2 flex  gap-2'>

                                        <input
                                            type="radio"
                                            name="icc_bank_acc"
                                            value='yes'
                                            onChange={handleChange}
                                            className="form-control border rounded p-2 "
                                        />
                                        <label>Yes</label>
                                    </div>
                                    <div className='form-group pt-2 flex  gap-2'>
                                        <input
                                            type="radio"
                                            name="icc_bank_acc"
                                            value='no'
                                            onChange={handleChange}
                                            className="form-control border rounded p-2 "
                                        />
                                        <label>No</label>
                                    </div>

                                </div>
                                {errors.icc_bank_acc && <p className="text-red-500">{errors.icc_bank_acc}</p>}

                                <div className='border rounded-md p-3 mt-3'>
                                    <h3 className='text-center text-xl font-bold pb-2'>Banking Details: </h3>
                                    <span className='text-sm text-center block'> Note: If you have an ICICI Bank account, please provide those details. If not, feel free to share your banking information from any other bank.</span>
                                    <div className='form-group mt-4'>
                                        <label>Bank Account Number</label>
                                        <input
                                            type="text"
                                            name="bank_details_account_number"
                                            value={formData.personal_information.bank_details_account_number}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                        />
                                        {errors.bank_details_account_number && <p className="text-red-500">{errors.bank_details_account_number}</p>}
                                    </div>
                                    <div className='form-group'>
                                        <label>Bank Name</label>
                                        <input
                                            type="text"
                                            name="bank_details_bank_name"
                                            value={formData.personal_information.bank_details_bank_name}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                        />
                                        {errors.bank_details_bank_name && <p className="text-red-500">{errors.bank_details_bank_name}</p>}
                                    </div>
                                    <div className='form-group'>
                                        <label>Bank Branch Name</label>
                                        <input
                                            type="text"
                                            name="bank_details_branch_name"
                                            value={formData.personal_information.bank_details_branch_name}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                        />
                                        {errors.bank_details_branch_name && <p className="text-red-500">{errors.bank_details_branch_name}</p>}
                                    </div>
                                    <div className='form-group'>
                                        <label>IFSC Code</label>
                                        <input
                                            type="text"
                                            name="bank_details_ifsc_code"
                                            value={formData.personal_information.bank_details_ifsc_code}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                        />
                                        {errors.bank_details_ifsc_code && <p className="text-red-500">{errors.bank_details_ifsc_code}</p>}
                                    </div>
                                </div>

                                <div className='border rounded-md p-3 mt-3'>
                                    <h3 className='text-center text-xl font-bold pb-2'> Insurance Nomination Details:- (A set of parent either Parents or Parents in Law, 1 child, Spouse Nominee details) </h3>
                                    <div className='grid grid-cols-2 gap-3'>
                                        <div className='form-group'>
                                            <label>Name(s)
                                            </label>
                                            <input
                                                type="text"
                                                name="insurance_details_name"
                                                value={formData.personal_information.insurance_details_name}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Nominee Relationship
                                            </label>
                                            <input
                                                type="text"
                                                name="insurance_details_nominee_relation"
                                                value={formData.personal_information.insurance_details_nominee_relation}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <lalbel>Nominee Date of Birth
                                            </lalbel>
                                            <input
                                                type="date"
                                                name="insurance_details_nominee_dob"
                                                value={formData.personal_information.insurance_details_nominee_dob}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Contact No.
                                            </label>
                                            <input
                                                type="text"
                                                name="insurance_details_contact_number"
                                                value={formData.personal_information.insurance_details_contact_number}
                                                onChange={handleChange}
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <label className='mt-5 block'>Do you want to opt for a Food Coupon?</label>

                                <div className='flex gap-6 mb-4'>
                                    <div className='form-group pt-2 flex gap-2'>
                                        <input
                                            type="radio"
                                            name="food_coupon"
                                            value="Yes"
                                            onChange={handleChange}
                                            className="form-control border rounded p-2"
                                        />
                                        <label>Yes</label>
                                    </div>
                                    <div className='form-group pt-2 flex gap-2'>
                                        <input
                                            type="radio"
                                            name="food_coupon"
                                            value="No"
                                            onChange={handleChange}
                                            className="form-control border rounded p-2"
                                        />
                                        <label>No</label>
                                    </div>
                                </div>
                                {errors.food_coupon && <p className="text-red-500">{errors.food_coupon}</p>}


                                <p className='text-left '>Food coupons are vouchers or digital meal cards given to employees to purchase food and non-alcoholic beverages. Specific amount as per your requirement would get deducted from your Basic Pay. These are tax free, considered as a non-monetary benefit and are exempt from tax up to a specified limit.</p>

                            </>
                        )}


                        {serviceData.length > 0 ? (
                            serviceData.map((service, serviceIndex) => (
                                <div key={serviceIndex} className="border md:p-8 p-2 rounded-md mt-5 ">
                                    <h2 className="text-center py-4 text-xl font-bold mb-3">{service.heading}</h2>
                                    <div className="grid gap-4 grid-cols-2">
                                        {service.inputs.map((input, inputIndex) => (
                                            <div key={inputIndex} className="mb-2">
                                                <label className="block mb-1">
                                                    {input.label}
                                                </label>
                                                {input.type === "input" && (
                                                    <input
                                                        type="text"
                                                        name={input.name} className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "textarea" && (
                                                    <textarea
                                                        name={input.name} cols={1}
                                                        rows={1}
                                                        className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "datepicker" && (
                                                    <input
                                                        type="date"
                                                        name={input.name} className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "number" && (
                                                    <input
                                                        type="number"
                                                        name={input.name} className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "email" && (
                                                    <input
                                                        type="email"
                                                        name={input.name} className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "select" && (
                                                    <select
                                                        name={input.name} className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    >
                                                        {input.options.map((option, optionIndex) => (
                                                            <option key={optionIndex} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                {input.type === "file" && (
                                                    <input
                                                        type="file"
                                                        name={input.name}
                                                        className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) => handleFileChange(service.db_table + '_' + input.name, input.name, e)}
                                                    />

                                                )}

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No services available.</p>
                        )}

                        <h4 className="text-center text-xl my-6 font-bold">Declaration and Authorization</h4>
                        <div className='mb-6  p-4 rounded-md border'>
                            <div className="mb-6">
                                <p>
                                    I hereby authorize GoldQuest Global HR Services Private Limited and its representative to verify information provided in my application for employment and this employee background verification form, and to conduct enquiries as may be necessary, at the company’s discretion. I authorize all persons who may have information relevant to this enquiry to disclose it to GoldQuest Global HR Services Pvt Ltd or its representative. I release all persons from liability on account of such disclosure.
                                    <br /><br />
                                    I confirm that the above information is correct to the best of my knowledge. I agree that in the event of my obtaining employment, my probationary appointment, confirmation as well as continued employment in the services of the company are subject to clearance of medical test and background verification check done by the company.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
                                <div className="form-group">
                                    <label>Attach signature: <span className="text-red-500">*</span></label>
                                    <input
                                        onChange={(e) => handleFileChange("applications_signature", "signature", e)}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx" // Restrict to specific file types

                                        className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                        name="signature"
                                        id="signature"

                                    />
                                    {errors.signature && <p className="text-red-500">{errors.signature}</p>}
                                    <p className="text-gray-500 text-sm mt-2">
                                        Only JPG, PNG, PDF, DOCX, and XLSX files are allowed. Max file size: 2MB.
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label>Name:</label>
                                    <input
                                        onChange={handleChange}
                                        value={formData.name_declaration}
                                        type="text"
                                        className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                        name="name_declaration"

                                    />
                                    {errors.name_declaration && <p className="text-red-500">{errors.name_declaration}</p>}
                                </div>

                                <div className="form-group">
                                    <label>Date:</label>
                                    <input

                                        onChange={handleChange}
                                        value={formData.declaration_date}
                                        type="date"
                                        className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                        name="declaration_date"

                                    />
                                    {errors.declaration_date && <p className="text-red-500">{errors.declaration_date}</p>}
                                </div>
                            </div>
                        </div>

                        <h5 className="text-center text-lg my-6 font-bold">Documents  (Mandatory)</h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4  md:p-4 p-1 rounded-md border">
                            <div className="p-4">
                                <h6 className="flex items-center text-lg font-bold mb-2">
                                    <FaGraduationCap className="mr-3" />
                                    Education
                                </h6>
                                <p>Photocopy of degree certificate and final mark sheet of all examinations.</p>
                            </div>

                            <div className="p-4">
                                <h6 className="flex items-center text-lg font-bold mb-2">
                                    <FaBriefcase className="mr-3" />
                                    Employment
                                </h6>
                                <p>Photocopy of relieving / experience letter for each employer mentioned in the form.</p>
                            </div>

                            <div className="p-4">
                                <h6 className="flex items-center text-lg font-bold mb-2">
                                    <FaIdCard className="mr-3" />
                                    Government ID/ Address Proof
                                </h6>
                                <p>Aadhaar Card / Bank Passbook / Passport Copy / Driving License / Voter ID.</p>
                            </div>
                        </div>


                        <p className='text-center text-sm mt-4'>
                            NOTE: If you experience any issues or difficulties with submitting the form, please take screenshots of all pages, including attachments and error messages, and email them to <a href="mailto:onboarding@goldquestglobal.in">onboarding@goldquestglobal.in</a> . Additionally, you can reach out to us at <a href="mailto:onboarding@goldquestglobal.in">onboarding@goldquestglobal.in</a> .
                        </p>

                        <button type="submit" className='bg-green-500 p-3 w-full mt-5 rounded-md text-white '>Submit</button>
                    </div>
                </form>
            }

            {
                !apiStatus && (
                    <div className="error-box">
                      Application not found
                    </div>
                )
            }


        </>
    );
};

export default BackgroundForm;
