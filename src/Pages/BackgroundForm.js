import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import PulseLoader from 'react-spinners/PulseLoader'; // Import the PulseLoader
import LogoBgv from '../Images/LogoBgv.jpg'
import { FaGraduationCap, FaBriefcase, FaIdCard } from 'react-icons/fa';
const BackgroundForm = () => {
    const [errors, setErrors] = useState({});
    const [checkedCheckboxes, setCheckedCheckboxes] = useState({});
    const [hiddenRows, setHiddenRows] = useState({});
    const [showModal, setShowModal] = useState(false);  // Control modal visibility
    const [progress, setProgress] = useState(0);
    const [files, setFiles] = useState({});
    const [serviceData, setServiceData] = useState([]);
    const [status, setStatus] = useState([]);

    // Handler to toggle row visibility
console.log('errors',errors)
    const [fileNames, setFileNames] = useState([]);
    const [serviceDataImageInputNames, setServiceDataImageInputNames] = useState([]);
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
            aadhar_card_number: '',
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
            ssn_number: "",

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
            "YXBwX2lk", // app_id
            "YnJhbmNoX2lk", // branch_id
            "Y3VzdG9tZXJfaWQ=" // customer_id
        ];


        // Loop through keys to find their values in the URL
        keys.forEach(key => {
            const regex = new RegExp(`${key}=([^&]*)`);
            const match = currentURL.match(regex);
            result[key] = match && match[1] ? match[1] : null;
        });

        // Function to check if the string is a valid base64
        const isValidBase64 = (str) => {
            const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
            return base64Pattern.test(str) && (str.length % 4 === 0);
        };


        // Function to decode key-value pairs
        const decodeKeyValuePairs = (obj) => {
            return Object.entries(obj).reduce((acc, [key, value]) => {
                const decodedKey = isValidBase64(key) ? atob(key) : key;
                const decodedValue = value && isValidBase64(value) ? atob(value) : null;
                acc[decodedKey] = decodedValue;
                return acc;
            }, {});
        };

        // Decoding key-value pairs and returning the result
        const decodedResult = decodeKeyValuePairs(result);
        return decodedResult;
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
            "full_name", "former_name", "mb_no", "father_name", "dob",
            "gender", "full_address", "pin_code", "current_address", "current_address_landline_number",
            "current_address_state", "current_prominent_landmark", "current_address_stay_to",
            "nearest_police_station", "nationality", "marital_status", 
        ];

        if (status === 1) {
            const additionalFields = [
                "name_declaration", "declaration_date",
                "emergency_details_name", "emergency_details_relation", "emergency_details_contact_number","aadhar_card_name", "pan_card_name",
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
            if (errors[fileName] && errors[fileName].length > 0 && !errors[fileName].some(error => error.toLowerCase().includes('is required'))) {
                return errors[fileName];
            } else {
                let file;
                let createdFileName;

                if (["govt_id", "resume_file", "signature", "passport_photo", "aadhar_card_image", "pan_card_image"].includes(fileName)) {
                    createdFileName = `applications_${fileName}`;
                    file = files[createdFileName]?.[fileName];
                } else {
                    const mapping = serviceDataImageInputNames.find(entry => entry[fileName]);
                    createdFileName = mapping ? mapping[fileName] : undefined;
                    file = createdFileName ? files[createdFileName]?.[fileName] : undefined;
                }

                let fileErrors = [];
                if (file) {
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

        const requiredFileInputsRaw = ["govt_id", "resume_file", "signature"];
        const fileInputKeys = serviceDataImageInputNames.flatMap(input => Object.keys(input));
        const requiredFileInputs = [...requiredFileInputsRaw, ...fileInputKeys];

        if (status === 1) {
            const additionalImagesFields = ["passport_photo", "aadhar_card_image", "pan_card_image"];
            requiredFileInputs.push(...additionalImagesFields);
        }

        requiredFileInputs.forEach((field) => {
            const agrUploadErrors = validateFile(field);
            if (agrUploadErrors.length > 0) {
                newErrors[field] = agrUploadErrors;
            }
        });

        // Now handle the required fields validation and service skipping
        requiredFields.forEach((field) => {
            if (
                !formData.personal_information[field] ||
                formData.personal_information[field].trim() === ""
            ) {
                newErrors[field] = "This field is required*";
            }
        });

        // Iterate through the serviceData, skipping any service that should be skipped
        serviceData.forEach((service) => {
            const shouldSkipService = service.rows.some((row) =>
                row.inputs.some(
                    (input) =>
                        input.type === 'checkbox' &&
                        (input.name.startsWith('done_or_not') || input.name.startsWith('has_not_done')) &&
                        checkedCheckboxes[input.name] // If checked, skip the service
                )
            );

            if (shouldSkipService) {
                return; // Skip validation for this service
            }

            // Validate the fields for this service if it's not skipped
            service.rows.forEach((row) => {
                row.inputs.forEach((input) => {
                    // Skip validation for fields if their checkbox is checked
                    if (input.type === 'checkbox' && checkedCheckboxes[input.name]) {
                        return;
                    }

                    // Check if it's a required field
                    if (
                        requiredFields.includes(input.name) &&
                        !formData[input.name] && // Check if the field is empty
                        !checkedCheckboxes[input.name] // Also check if the checkbox is unchecked (if applicable)
                    ) {
                        newErrors[input.name] = "This field is required*";
                    }
                });
            });
        });

        return newErrors;
    };


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


    const handleCheckboxChange = (checkboxName, isChecked) => {
        setCheckedCheckboxes((prevState) => ({
            ...prevState,
            [checkboxName]: isChecked,
        }));
    };

    const toggleRowsVisibility = (serviceIndex, rowIndex, isChecked) => {

        setHiddenRows((prevState) => {
            const newState = { ...prevState };
            const serviceRows = serviceData[serviceIndex].rows;
            const row = serviceRows[rowIndex];


            const fileInputs = row.inputs.filter(input => input.type === 'file');

            if (isChecked) {
                setServiceDataImageInputNames((prevFileInputs) => {

                    return prevFileInputs.filter(fileInput => {
                        const fileInputName = Object.values(fileInput)[0];
                        const isCurrentServiceFile = fileInputName.startsWith(`${serviceData[serviceIndex].db_table}_`);


                        return !(isCurrentServiceFile &&
                            (row.inputs.some(input =>
                                input.type === 'checkbox' &&
                                input.name.startsWith('done_or_not') || input.name.startsWith('has_not_done'))));
                    });
                });

                for (let i = rowIndex + 1; i < serviceRows.length; i++) {
                    const row = serviceRows[i];
                    const hasCheckbox = row.inputs && row.inputs.some(input => input.type === 'checkbox');


                    const isSpecialCheckbox = hasCheckbox && row.inputs.some(input => {
                        if (typeof input.name === 'string') {
                            return input.name.startsWith('done_or_not') || input.name.startsWith('has_not_done');
                        }
                        return false;
                    });

                    if (isSpecialCheckbox) continue;


                    newState[`${serviceIndex}-${i}`] = true;
                }
            } else {
                for (let i = rowIndex + 1; i < serviceRows.length; i++) {
                    const row = serviceRows[i];
                    const hasCheckbox = row.inputs && row.inputs.some(input => input.type === 'checkbox');



                    const isSpecialCheckbox = hasCheckbox && row.inputs.some(input => {
                        if (typeof input.name === 'string') {
                            return input.name.startsWith('done_or_not') || input.name.startsWith('has_not_done');
                        }
                        return false;
                    });

                    if (isSpecialCheckbox) continue;


                    delete newState[`${serviceIndex}-${i}`];
                }
            }


            return newState;
        });
    };


    const fetchData = useCallback(() => {
        if (!serviceIds) return;

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

                const fileInputs = parsedData
                    .flatMap(item =>
                        item.rows.flatMap(row =>
                            row.inputs
                                .filter(input => input.type === "file")
                                .map(input => ({
                                    [input.name]: `${item.db_table}_${input.name}`
                                }))
                        )
                    );

                setServiceDataImageInputNames(fileInputs);
                setServiceData(parsedData);
            })

            .catch(err => console.error('Fetch error:', err));
    }, [serviceIds]);


    useEffect(() => {
        if (serviceIds) {
            fetchData();
        }
    }, [fetchData, serviceIds]);

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
            [dbTable]: { ...prevFiles[dbTable], [fileName]: selectedFiles }, // Update specific file input
        }));

        // Remove any existing errors for this file if valid
        setErrors((prevErrors) => {
            const { [fileName]: removedError, ...restErrors } = prevErrors; // Remove the error for this field if valid
            return restErrors;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Get file count and calculate progress
        const fileCount = Object.keys(files).length;
        const TotalApiCalls = fileCount + 1; // Include the API call for the form data
        const dataToSubmitting = 100 / TotalApiCalls;

        // Validation
        let newErrors = {};
        const validationError = validate();
        Object.keys(validationError).forEach((key) => {
            if (validationError[key]) {
                newErrors[key] = validationError[key];
            }
        });

        // If there are errors, show them and focus on the first error field
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const errorField = Object.keys(newErrors)[0];
            if (refs.current[errorField]) {
                refs.current[errorField].focus();
            }
            return;
        } else {
            setErrors({});
        }


        // Start loading indicator and open progress modal
        setLoading(true);
        setShowModal(true);
        setProgress(0); // Reset progress before starting

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

        try {
            // Send the form data request to the API
            const response = await fetch(
                "https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/submit",
                requestOptions
            );

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Update progress for form submission
            setProgress(dataToSubmitting);

            // Success handling based on file count
            if (fileCount === 0) {
                Swal.fire({
                    title: "Success",
                    text: `CEF Application Created Successfully.`,
                    icon: "success",
                    confirmButtonText: "Ok",
                }).then(() => {

                    fetchApplicationStatus();
                });
            } else {
                // Handle file upload if files exist
                await uploadCustomerLogo(result.cef_id, fileCount, TotalApiCalls); // Upload files
                setProgress(100); // Set progress to 100% after file upload
                Swal.fire({
                    title: "Success",
                    text: `CEF Application Created Successfully and files uploaded.`,
                    icon: "success",
                    confirmButtonText: "Ok",
                }).then(() => {

                    fetchApplicationStatus();
                });
            }

        } catch (error) {
            console.error("Error:", error);
            Swal.fire("Error!", error.message, "error");
        } finally {
            setLoading(false); // Stop loading indicator
            setShowModal(false); // Close modal after processing
        }
    };


    const uploadCustomerLogo = async (cef_id, fileCount) => {
        setLoading(true); // Set loading to true when starting the upload

        let progressIncrement = 100 / fileCount; // Calculate progress increment per file

        for (const [index, [key, value]] of Object.entries(files).entries()) {
            const customerLogoFormData = new FormData();
            customerLogoFormData.append('branch_id', decodedValues.branch_id);
            customerLogoFormData.append('customer_id', decodedValues.customer_id);
            customerLogoFormData.append('candidate_application_id', decodedValues.app_id);

            const dbTableRaw = key;
            const dbColumn = Object.keys(value).map((key) => {
                const firstValue = value[key]?.[0]; // Get the first element of the array in 'value'
                return key; // Return the key
            });

            const dbTable = dbTableRaw.replace("_" + dbColumn, ''); // Removes dbColumn from dbTableRaw
            setFileNames(dbColumn);


            customerLogoFormData.append('db_table', dbTable);
            customerLogoFormData.append('db_column', dbColumn);
            customerLogoFormData.append('cef_id', cef_id);
            console.log('value', value)

            // Get the first value from the object by accessing the first element of each key
            const allValues = Object.keys(value).flatMap((key) => value[key]); // Flatten all arrays into a single array

            for (const file of allValues) {
                customerLogoFormData.append('images', file); // Append each file to the FormData
            }
            if (fileCount === index + 1) {
                customerLogoFormData.append('send_mail', 1);
            }
            try {
                // Make the API request to upload the logo
                await axios.post(
                    `https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/upload`,
                    customerLogoFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                setProgress((prevProgress) => prevProgress + progressIncrement);

            } catch (err) {
                Swal.fire('Error!', `An error occurred while uploading logo: ${err.message}`, 'error');
            }
        }

        setLoading(false); // Set loading to false once the upload is complete
    };


    return (
        <>
            {
                loading ? (
                    <div className='flex justify-center items-center py-6'>
                        {showModal && (
                            <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                                <div className="bg-white p-8 rounded-lg w-5/12  shadow-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-800">Generating Candidate Application</h2>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="text-gray-600 hover:text-gray-900 font-bold text-2xl">&times;</button>
                                    </div>
                                    <p className="mt-4 text-gray-700 text-lg">
                                        Uploading.......<span className=""> {fileNames.join(', ')} {progress >= 90 && ' - Generating final report...'}



                                        </span>
                                    </p>

                                    <div className="mt-6">
                                        <div className="w-full bg-gray-300 rounded-full h-4">
                                            <div
                                                className="bg-blue-500 h-4 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-4 text-center text-xl text-green-600">{Math.round(progress)}%</div>
                                    </div>
                                    <div className="mt-6 flex justify-between">
                                        <button
                                            className="bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors"
                                            onClick={() => setShowModal(false)}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>

                        )}
                    </div>
                ) : (
                    <form className='py-6 bg-[#e5e7eb24]' onSubmit={handleSubmit} id='bg-form'>
                        {status === 1 && (
                            <div className='flex justify-center my-3'>
                                <img src={LogoBgv} className='w-[12%] m-auto' alt="Logo" />
                            </div>
                        )}

                        <h4 className="text-Black text-3xl mb-6 text-center font-bold">Background Verification Form</h4>
                        <div className="p-6 rounded md:w-9/12 m-auto ">
                            <div className="mb-6  p-4 rounded-md">
                                <h5 className="text-lg font-bold">Company name: <span className="text-lg font-normal">{companyName}</span></h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 bg-white shadow-md gap-4 mb-6 border rounded-md  p-4">
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
                                        accept=".jpg,.jpeg,.png" // Restrict to image files
                                        className="form-control border rounded w-full bg-white p-3 mt-2"
                                        name="govt_id"
                                        onChange={(e) => handleFileChange("applications_govt_id", "govt_id", e)}
                                        multiple // Allow multiple file selection
                                        ref={(el) => (refs.current["applications_govt_id"] = el)} // Attach ref here
                                    />
                                    {errors.govt_id && <p className="text-red-500">{errors.govt_id}</p>}
                                    <p className="text-gray-500 text-sm mt-2">
                                        Only JPG, PNG, PDF, DOCX, and XLSX files are allowed. Max file size: 2MB.
                                    </p>
                                </div>


                                {status === 1 && (
                                    <>
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

                            <div className='border bg-white shadow-md  p-4 rounded-md'>
                                <h4 className="text-center text-2xl my-6 font-bold ">Personal Information</h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 ">
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
                                        <label htmlFor="former_name">Former Name/ Maiden Name (if applicable)<span className="text-red-500">*</span></label>
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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
                                        <label htmlFor="husband_name">Spouse's Name</label>
                                        <input
                                            onChange={handleChange}
                                            value={formData.personal_information.husband_name}
                                            type="text"
                                            className="form-control border rounded w-full p-2 mt-2"
                                            id="husband_name"
                                            ref={(el) => (refs.current["husband_name"] = el)} // Attach ref here
                                            name="husband_name"
                                        />
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="form-group">
                                        <label htmlFor="gender">
                                            Gender: <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            onChange={handleChange}
                                            value={formData.personal_information.gender}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            name="gender"
                                            id="gender"
                                            ref={(el) => (refs.current["gender"] = el)} // Attach ref here
                                        >
                                            <option value="" disabled>
                                                Select gender
                                            </option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && <p className="text-red-500">{errors.gender}</p>}
                                    </div>

                                    <div className='form-group'>
                                        <label>Aadhar card No</label>
                                        <input
                                            type="text"
                                            name="aadhar_card_number"
                                            value={formData.personal_information.aadhar_card_number}
                                            onChange={handleChange}

                                            className="form-control border rounded w-full p-2 mt-2"
                                        />

                                    </div>
                                    <div className='form-group'>
                                        <label>Pan card No</label>
                                        <input
                                            type="text"
                                            name="pan_card_number"
                                            value={formData.personal_information.pan_card_number}
                                            onChange={handleChange}

                                            className="form-control border rounded w-full p-2 mt-2"
                                        />

                                    </div>

                                    {status === 1 && (
                                        <>
                                            <div className='form-group'>
                                                <label>Name as per Aadhar card<span className='text-red-500'>*</span></label>
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
                                                <label>Aadhar Card Image<span className='text-red-500'>*</span></label>
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
                                                <label>Name as per Pan Card<span className='text-red-500'>*</span></label>
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
                                        </>
                                    )}

                                    {status == 0 && (
                                        <div className="form-group">
                                            <label>Social Security Number(if applicable):</label>
                                            <input
                                                onChange={handleChange}
                                                value={formData.ssn_number}
                                                type="text"
                                                className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                                name="ssn_number"

                                            />
                                        </div>
                                    )}
                                    {status === 1 && (
                                        <div className='form-group'>
                                            <label>Pan Card Image<span className='text-red-500'>*</span></label>
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
                                    )}
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
                                <div className='border bg-white shadow-md border-gray-300 p-6 rounded-md mt-5 hover:transition-shadow duration-300'>

                                    <h3 className='text-center text-2xl font-bold my-5'>Current Address </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                                    </div>
                                </div>




                            </div>
                            {status === 1 && (
                                <>
                                    <div className='border bg-white shadow-md border-gray-300 p-6 rounded-md mt-5 hover:transition-shadow duration-300'>

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
                                            <label>Declaration Date<span className='text-red-500'>*</span></label>
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

                                        <div className='border rounded-md p-3 my-5 '>
                                            <h3 className='text-center text-xl font-bold pb-4'>Add Emergency Contact Details</h3>
                                            <div className='grid grid-cols-3 gap-3 '>
                                                <div className='form-group'>
                                                    <label>Name<span className='text-red-500'>*</span></label>
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
                                                    <label>Relation<span className='text-red-500'>*</span></label>
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
                                                    <label>Contact Number<span className='text-red-500'>*</span></label>
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
                                        <div className='border rounded-md p-3  my-5'>
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
                                        <div className='border rounded-md p-3   mt-3'>
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
                                        <label className='mt-5 block'>Do you have an ICICI Bank A/c<span className='text-red-500'>*</span></label>

                                        <div className='flex gap-6 mb-4  '>
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

                                        <div className='border rounded-md p-3 my-6  '>
                                            <h3 className='text-center text-xl font-bold pb-2'>Banking Details: </h3>
                                            <span className='text-sm text-center block'> Note: If you have an ICICI Bank account, please provide those details. If not, feel free to share your banking information from any other bank.</span>
                                            <div className='form-group mt-4'>
                                                <label>Bank Account Number<span className='text-red-500'>*</span></label>
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
                                                <label>Bank Name<span className='text-red-500'>*</span></label>
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
                                                <label>Bank Branch Name<span className='text-red-500'>*</span></label>
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
                                                <label>IFSC Code<span className='text-red-500'>*</span></label>
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

                                        <div className='border rounded-md p-3 mt-3  '>
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
                                        <label className='mt-5 block'>Do you want to opt for a Food Coupon?<span className='text-red-500'>*</span></label>

                                        <div className='flex gap-6 mb-4  '>
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
                                    </div>
                                </>
                            )}

                            {serviceData.length > 0 ? (
                                serviceData.map((service, serviceIndex) => {
                                    return (
                                        <div
                                            key={serviceIndex}
                                            className="border bg-white shadow-md border-gray-300 p-6 rounded-md mt-5 hover:transition-shadow duration-300"
                                        >
                                            <h2 className="text-center py-4 text-2xl font-bold mb-6 text-black">
                                                {service.heading}
                                            </h2>
                                            <div className="space-y-6">
                                                {service.rows.map((row, rowIndex) => {
                                                    if (hiddenRows[`${serviceIndex}-${rowIndex}`]) {
                                                        return null;
                                                    }

                                                    return (
                                                        <div key={rowIndex}>
                                                            {row.row_heading && (
                                                                <h3 className="text-lg font-semibold mb-4">{row.row_heading}</h3>
                                                            )}

                                                            {row.inputs && row.inputs.length > 0 ? (
                                                                <div className="space-y-4">
                                                                    <div
                                                                        className={`grid grid-cols-${row.inputs.length === 1 ? '1' : row.inputs.length === 2 ? '2' : '3'} gap-3`}
                                                                    >
                                                                        {row.inputs.map((input, inputIndex) => {
                                                                            const isCheckbox = input.type === 'checkbox';
                                                                            const isDoneCheckbox =
                                                                                isCheckbox &&
                                                                                (input.name.startsWith('done_or_not') || input.name.startsWith('has_not_done'));
                                                                            const isChecked = checkedCheckboxes[input.name];

                                                                            if (isDoneCheckbox && isChecked) {
                                                                                // Hide all rows except the one with the checked checkbox
                                                                                // Hide all rows by setting their visibility to `true` in `hiddenRows` except the one with the checkbox
                                                                                service.rows.forEach((otherRow, otherRowIndex) => {
                                                                                    if (otherRowIndex !== rowIndex) {
                                                                                        hiddenRows[`${serviceIndex}-${otherRowIndex}`] = true; // Hide other rows
                                                                                    }
                                                                                });
                                                                                hiddenRows[`${serviceIndex}-${rowIndex}`] = false; // Ensure current row stays visible
                                                                            }

                                                                            return (
                                                                                <div
                                                                                    key={inputIndex}
                                                                                    className={`flex flex-col space-y-2 ${row.inputs.length === 1 ? 'col-span-1' : row.inputs.length === 2 ? 'col-span-1' : ''}`}
                                                                                >
                                                                                    <label className="block text-sm font-medium mb-2 text-gray-700 capitalize">
                                                                                        {input.label.replace(/[\/\\]/g, '')}
                                                                                    </label>

                                                                                    {/* Input types (text, textarea, datepicker, etc.) */}
                                                                                    {input.type === 'input' && (
                                                                                        <input
                                                                                            type="text"
                                                                                            name={input.name}
                                                                                            className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                            onChange={(e) => handleServiceChange(service.db_table, input.name, e.target.value)}
                                                                                        />
                                                                                    )}
                                                                                    {input.type === 'textarea' && (
                                                                                        <textarea
                                                                                            name={input.name}
                                                                                            rows={1}
                                                                                            className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                            onChange={(e) => handleServiceChange(service.db_table, input.name, e.target.value)}
                                                                                        />
                                                                                    )}
                                                                                    {input.type === 'datepicker' && (
                                                                                        <input
                                                                                            type="date"
                                                                                            name={input.name}
                                                                                            className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                            onChange={(e) => handleServiceChange(service.db_table, input.name, e.target.value)}
                                                                                        />
                                                                                    )}
                                                                                    {input.type === 'number' && (
                                                                                        <input
                                                                                            type="number"
                                                                                            name={input.name}
                                                                                            className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                            onChange={(e) => handleServiceChange(service.db_table, input.name, e.target.value)}
                                                                                        />
                                                                                    )}
                                                                                    {input.type === 'email' && (
                                                                                        <input
                                                                                            type="email"
                                                                                            name={input.name}
                                                                                            className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                            onChange={(e) => handleServiceChange(service.db_table, input.name, e.target.value)}
                                                                                        />
                                                                                    )}
                                                                                    {input.type === 'select' && (
                                                                                        <select
                                                                                            name={input.name}
                                                                                            className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                            onChange={(e) => handleServiceChange(service.db_table, input.name, e.target.value)}
                                                                                        >
                                                                                            {Object.entries(input.options).map(([key, option], optionIndex) => (
                                                                                                <option key={optionIndex} value={key}>
                                                                                                    {option}
                                                                                                </option>
                                                                                            ))}
                                                                                        </select>
                                                                                    )}
                                                                                    {input.type === 'file' && (
                                                                                        <>
                                                                                            <input
                                                                                                type="file"
                                                                                                name={input.name}
                                                                                                multiple
                                                                                                accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx"
                                                                                                className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none"
                                                                                                onChange={(e) =>
                                                                                                    handleFileChange(service.db_table + '_' + input.name, input.name, e)
                                                                                                }
                                                                                            />
                                                                                            {errors[input.name] && <p className="text-red-500">{errors[input.name]}</p>}
                                                                                            <p className="text-gray-500 text-sm mt-2">
                                                                                                Only JPG, PNG, PDF, DOCX, and XLSX files are allowed. Max file size: 2MB.
                                                                                            </p>
                                                                                        </>
                                                                                    )}

                                                                                    {/* Checkbox Input */}
                                                                                    {input.type === 'checkbox' && (
                                                                                        <div className="flex items-center space-x-3">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                name={input.name}
                                                                                                className="h-5 w-5 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                                                                onChange={(e) => {
                                                                                                    handleCheckboxChange(input.name, e.target.checked);
                                                                                                    toggleRowsVisibility(serviceIndex, rowIndex, e.target.checked); // Optional for any additional row toggle logic
                                                                                                }}
                                                                                            />
                                                                                            <span className="text-sm text-gray-700">{input.label}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p>No inputs available for this row.</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-xl text-gray-500">No services available.</p>
                            )}


                            <div className='mb-6  p-4 rounded-md border shadow-md bg-white'>
                                <h4 className="text-center text-xl my-6 font-bold">Declaration and Authorization</h4>

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
                                        <label>Name</label>
                                        <input
                                            onChange={handleChange}
                                            value={formData.name_declaration}
                                            type="text"
                                            className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                            name="name_declaration"

                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>Date</label>
                                        <input

                                            onChange={handleChange}
                                            value={formData.declaration_date}
                                            type="date"
                                            className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                            name="declaration_date"

                                        />
                                    </div>
                                </div>
                            </div>

                            <h5 className="text-center text-lg my-6 font-bold">Documents  (Mandatory)</h5>

                            <div className="grid grid-cols-1 bg-white shadow-md  md:grid-cols-3 gap-4 pt-4  md:p-4 p-1 rounded-md border">
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
                )

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
