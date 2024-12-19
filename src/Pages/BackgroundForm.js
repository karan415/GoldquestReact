import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import PulseLoader from 'react-spinners/PulseLoader'; // Import the PulseLoader

import { FaGraduationCap, FaBriefcase, FaIdCard } from 'react-icons/fa';
const BackgroundForm = () => {

    const [files, setFiles] = useState({});
    const [serviceData, setServiceData] = useState([]);
    const [status, setStatus] = useState([]);
    const [annexureData, setAnnexureData] = useState({});
    const [serviceIds, setServiceIds] = useState(''); // Expecting a comma-separated string
    const [formData, setFormData] = useState({
        personal_information: {
            resume_file: '',
            govt_id: '',
            full_name: '',
            former_name: '',
            mb_no: '',
            father_name: '',
            husband_name: '',
            dob: '',
            gender: '',
            pan: '',
            aadhar: '',
            full_address:'',
            pin_code: '',
            curren_address_stay_from: '',
            curren_address_landline_number: '',
            current_address_state: '',
            current_prominent_landmark: '',
            current_address_stay_to: '', nearest_police_station: '',
            social_security_number: '',
            nationality: '',
            marital_status: '',
            signature: '',
            name_declaration: '',
            declaration_date: '',
            blood_group: '',
            pan_card_name: '',
            aadhar_card_name: '',
            food_cuppon: '',
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

        },
    });
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


    const handleServiceChange = (serviceKey, inputName, value) => {
        setAnnexureData((prevData) => ({
            ...prevData,
            [serviceKey]: {
                ...prevData[serviceKey],
                [inputName]: value,
            },
        }));


    };

    useEffect(() => {
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
                    } else {
                        // Application does not exist or other error: Hide the form and show an alert
                        const form = document.getElementById('bg-form');
                        if (form) {
                            form.remove();
                            console.log("Form removed"); // Debugging log
                        } else {
                            console.log("Form not found"); // Debugging log
                        }

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

        fetchApplicationStatus();
    }, [decodedValues]); // Run this effect only when decodedValues change


    const fetchData = useCallback(() => {
        if (!serviceIds) return; // No service IDs to fetch

        const serviceArr = serviceIds.split(',').map(Number);
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        const fetchPromises = serviceArr.map(serviceId =>
            fetch(`https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/service-form-json?service_id=${serviceId}`, requestOptions)
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
        fetchData();
    }, [fetchData, serviceIds]); // Trigger when serviceIds updates


    const uploadCustomerLogo = async (cef_id) => {
        const fileCount = Object.keys(files).length;
        console.log(`files - `, files);


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
                await axios.post(`https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/upload`, customerLogoFormData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } catch (err) {
                Swal.fire('Error!', `An error occurred while uploading logo: ${err.message}`, 'error');
            }
        }
    };

    const handleFileChange = (dbTable, fileName, e) => {

        const selectedFiles = Array.from(e.target.files);

        setFiles((prevFiles) => ({
            ...prevFiles,
            [dbTable]: { selectedFiles, fileName },
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const fileCount = Object.keys(files).length;

        const raw = JSON.stringify({
            branch_id: decodedValues.branch_id,
            customer_id: decodedValues.customer_id,
            application_id: decodedValues.app_id,
            ...formData,
            annexure: annexureData,
            send_mail: fileCount === 0 ? 1 : 0, // Send mail if no files
        });

        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        setLoading(true); // Set loading to true when the request starts

        fetch(
            "https://octopus-app-www87.ondigitalocean.app/branch/candidate-application/backgroud-verification/submit",
            requestOptions
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((result) => {
                setLoading(false); // Set loading to false when the request finishes
                // Show the API response message
                if (fileCount === 0) {
                    Swal.fire({
                        title: "Success",
                        text: `CEF Application Created Successfully.`,
                        icon: "success",
                        confirmButtonText: "Ok",
                    });
                }

                if (fileCount > 0) {
                    // Proceed to upload files if files exist
                    uploadCustomerLogo(result.cef_id);
                    Swal.fire({
                        title: "Success",
                        text: `CEF Application Created Successfully and files uploaded.`,
                        icon: "success",
                        confirmButtonText: "Ok",
                    });
                }
            })
            .catch((error) => {
                setLoading(false); // Set loading to false in case of an error
                console.error("Error:", error);
                Swal.fire("Error!", `An error occurred: ${error.message}`, "error");
            });
    };


    return (
        <>
            {
                loading ? (
                    <div className='flex justify-center items-center py-6 ' >
                        <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />

                    </div >
                ) : <form action="" className='py-6' onSubmit={handleSubmit} id='bg-form'>
                    <h4 className="text-green-600 text-2xl mb-6 text-center font-bold">Background Verification Form</h4>
                    <div className="p-6 rounded md:w-8/12 m-auto ">
                        <div className="mb-6 bg-slate-100 p-4 rounded-md">
                            <h5 className="text-lg font-bold">Company name: <span className="text-lg font-normal">Shetty Legacy LLP</span></h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-100 p-4 rounded-md">
                            <div className="form-group col-span-2">
                                <label>Applicant’s CV: <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    className="form-control border rounded w-full bg-white p-3 mt-2"
                                    name="resume_file"
                                    id="resume_file"
                                    onChange={(e) => handleFileChange("applications_resume_file", "resume_file", e)}

                                />
                            </div>
                            {status === 0 && (
                                <div className="form-group col-span-2">
                                    <label>Attach Govt. ID Proof: <span className="text-red-500">*</span></label>
                                    <input
                                        type="file"
                                        className="form-control border rounded w-full bg-white p-3 mt-2"
                                        name="govt_id"
                                        onChange={(e) => handleFileChange("applications_govt_id", "govt_id", e)}
                                        multiple
                                    />
                                </div>
                            )}
                            {status === 1 && (
                                <>

                                    <div className="form-group col-span-2">
                                        <label>Passport size photograph  - (mandatory with white Background) <span className="text-red-500">*</span></label>
                                        <input
                                            type="file"
                                            className="form-control border rounded w-full bg-white p-3 mt-2"
                                            name="passport_photo"
                                            onChange={(e) => handleFileChange("applications_passport_photo", "passport_photo", e)}
                                            multiple
                                        />
                                    </div>

                                </>
                            )}

                        </div>

                        <h4 className="text-center text-2xl my-6 font-bold ">Personal Information</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-100 p-4 rounded-md">
                            <div className="form-group">
                                <label htmlFor="full_name">Full Name as per Govt ID Proof (first, middle, last): <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.full_name}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="full_name"
                                    name="full_name"

                                />
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

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Address <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.curren_address_stay_from}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="curren_address_stay_from"
                                    name="curren_address_stay_from"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Pin Code <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.pin_code}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="pin_code"
                                    name="pin_code"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Landline Number <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.curren_address_landline_number}
                                    type="number"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="curren_address_landline_number"
                                    name="curren_address_landline_number"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current State <span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.current_address_state}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_address_state"
                                    name="current_address_state"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Landmark<span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.current_prominent_landmark}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_prominent_landmark"
                                    name="current_prominent_landmark"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Address Stay No.<span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.current_address_stay_to}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_address_stay_to"
                                    name="current_address_stay_to"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Nearest Police Station.<span className="text-red-500">*</span></label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.nearest_police_station}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="nearest_police_station"
                                    name="nearest_police_station"

                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="former_name">Former Name/ Maiden Name (if applicable):</label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.former_name}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="former_name"
                                    name="former_name"
                                />
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

                                />
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

                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="husband_name">Spouse's Name:</label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.husband_name}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="husband_name"
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

                                />
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

                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="pan_no">PAN card No:</label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.pan}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="pan_no"
                                    name="pan"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="aadhar_no">Aadhar No:</label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.aadhar}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="aadhar_no"
                                    name="aadhar"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="ssn">Social Security Number (if applicable):</label>
                                <input
                                    onChange={handleChange}
                                    value={formData.personal_information.ssn}
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="social_security_number"
                                    id="ssn"
                                />
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

                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="marital_status">Marital Status: <span className="text-red-500">*</span></label>
                                <select
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
                            </div>
                            {status === 1 && (
                                <>

                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="blood_group"
                                            value={formData.personal_information.blood_group}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Blood Group"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="pan_card_name"
                                            value={formData.personal_information.pan_card_name}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Name as per Pan Card"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="pan_card_image"
                                            value={formData.personal_information.pan_card_image}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Pan Card Image"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="aadhar"
                                            value={formData.personal_information.aadhar}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Aadhar"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="aadhar_card_name"
                                            value={formData.personal_information.aadhar_card_name}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Aadhar Card Name"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="aadhar_card_image"
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Aadhar Card Image"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="social_security_number"
                                            value={formData.personal_information.social_security_number}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Social Security Number"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="date"
                                            name="declaration_date"
                                            value={formData.personal_information.declaration_date}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Declaration Date"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="food_cuppon"
                                            value={formData.personal_information.food_cuppon}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Food Coupon"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="emergency_details_name"
                                            value={formData.personal_information.emergency_details_name}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Emergency Contact Name"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="emergency_details_relation"
                                            value={formData.personal_information.emergency_details_relation}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Emergency Contact Relation"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="emergency_details_contact_number"
                                            value={formData.personal_information.emergency_details_contact_number}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Emergency Contact Number"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="pf_details_pf_number"
                                            value={formData.personal_information.pf_details_pf_number}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="PF Number"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="pf_details_pf_type"
                                            value={formData.personal_information.pf_details_pf_type}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="PF Type"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="pf_details_pg_nominee"
                                            value={formData.personal_information.pf_details_pg_nominee}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="PF Nominee"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="nps_details_details_pran_number"
                                            value={formData.personal_information.nps_details_details_pran_number}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="NPS PRAN Number"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="nps_details_details_nominee_details"
                                            value={formData.personal_information.nps_details_details_nominee_details}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="NPS Nominee Details"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="nps_details_details_nps_contribution"
                                            value={formData.personal_information.nps_details_details_nps_contribution}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="NPS Contribution"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="bank_details_account_number"
                                            value={formData.personal_information.bank_details_account_number}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Bank Account Number"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="bank_details_bank_name"
                                            value={formData.personal_information.bank_details_bank_name}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Bank Name"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="bank_details_branch_name"
                                            value={formData.personal_information.bank_details_branch_name}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Bank Branch Name"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="bank_details_ifsc_code"
                                            value={formData.personal_information.bank_details_ifsc_code}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="IFSC Code"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="insurance_details_name"
                                            value={formData.personal_information.insurance_details_name}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Insurance Name"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="insurance_details_nominee_relation"
                                            value={formData.personal_information.insurance_details_nominee_relation}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Insurance Nominee Relation"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="date"
                                            name="insurance_details_nominee_dob"
                                            value={formData.personal_information.insurance_details_nominee_dob}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Insurance Nominee DOB"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <input
                                            type="text"
                                            name="insurance_details_contact_number"
                                            value={formData.personal_information.insurance_details_contact_number}
                                            onChange={handleChange}
                                            className="form-control border rounded w-full p-2 mt-2"
                                            placeholder="Insurance Contact Number"
                                        />
                                    </div>

                                </>
                            )}





                        </div>

                        <h4 className="text-center text-xl my-6">Declaration and Authorization</h4>
                        <div className='mb-6 bg-slate-100 p-4 rounded-md'>
                            <div className="mb-6">
                                <p>
                                    I hereby authorize GoldQuest Global HR Services Private Limited and its representative to verify information provided in my application for employment and this employee background verification form, and to conduct enquiries as may be necessary, at the company’s discretion. I authorize all persons who may have information relevant to this enquiry to disclose it to GoldQuest Global HR Services Pvt Ltd or its representative. I release all persons from liability on account of such disclosure.
                                    <br /><br />
                                    I confirm that the above information is correct to the best of my knowledge. I agree that in the event of my obtaining employment, my probationary appointment, confirmation as well as continued employment in the services of the company are subject to clearance of medical test and background verification check done by the company.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
                                <div className="form-group">
                                    <label>Attach Signature: <span className="text-red-500">*</span></label>
                                    <input
                                        onChange={(e) => handleFileChange("applications_signature", "signature", e)}
                                        type="file"
                                        className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                        name="signature"
                                        id="signature"

                                    />
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
                                </div>
                            </div>
                        </div>

                        <h5 className="text-center text-lg my-6">Documents  (Mandatory)</h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 bg-slate-100 md:p-4 p-1 rounded-md">
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
                        {serviceData.length > 0 ? (
                            serviceData.map((service, serviceIndex) => (
                                <div key={serviceIndex} className="border md:p-8 p-2 rounded-md mt-5 bg-slate-100">
                                    <h2 className="text-center py-4 text-2xl">{service.heading}</h2>
                                    <div className="grid gap-4">
                                        {service.inputs.map((input, inputIndex) => (
                                            <div key={inputIndex} className="mb-2">
                                                <label className="block text-slate-700 font-semibold mb-1">
                                                    {input.label}
                                                </label>
                                                {input.type === "input" && (
                                                    <input
                                                        type="text"
                                                        name={input.name}
                                                        required={input.required}
                                                        className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "textarea" && (
                                                    <textarea
                                                        name={input.name}
                                                        required={input.required}
                                                        className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "datepicker" && (
                                                    <input
                                                        type="date"
                                                        name={input.name}
                                                        required={input.required}
                                                        className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "number" && (
                                                    <input
                                                        type="number"
                                                        name={input.name}
                                                        required={input.required}
                                                        className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "email" && (
                                                    <input
                                                        type="email"
                                                        name={input.name}
                                                        required={input.required}
                                                        className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                        onChange={(e) =>
                                                            handleServiceChange(service.db_table, input.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                                {input.type === "select" && (
                                                    <select
                                                        name={input.name}
                                                        required={input.required}
                                                        className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
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
                                                        required={input.required}
                                                        className="mt-1 block w-full focus:outline-none"
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

                        <p className='text-center text-sm mt-4'>
                            NOTE: If you experience any issues or difficulties with submitting the form, please take screenshots of all pages, including attachments and error messages, and email them to <a href="mailto:onboarding@goldquestglobal.in">onboarding@goldquestglobal.in</a> . Additionally, you can reach out to us at <a href="mailto:onboarding@goldquestglobal.in">onboarding@goldquestglobal.in</a> .
                        </p>

                        <button type="submit" className='bg-green-500 p-3 w-full mt-5 rounded-md text-white '>Submit</button>
                    </div>
                </form>
            }

        </>
    );
};

export default BackgroundForm;
