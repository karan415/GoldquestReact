import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaGraduationCap, FaBriefcase, FaIdCard } from 'react-icons/fa';
const BackgroundForm = () => {
    const [serviceData, setServiceData] = useState([]);
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
            social_security_number: '',
            nationality: '',
            marital_status: '',
            signature: '',
            name_declaration: '',
            declaration_date: ''
        },
    });

    const [isValidApplication, setIsValidApplication] = useState(true);
    const location = useLocation();
    const currentURL = location.pathname + location.search;

    function getValuesFromUrl(currentURL) {
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

        function isValidBase64(str) {
            const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
            return base64Pattern.test(str) && (str.length % 4 === 0);
        }

        function decodeKeyValuePairs(obj) {
            return Object.entries(obj).reduce((acc, [key, value]) => {
                const decodedKey = isValidBase64(key) ? atob(key) : key;
                const decodedValue = value && isValidBase64(value) ? atob(value) : null;
                acc[decodedKey] = decodedValue;
                return acc;
            }, {});
        }

        return decodeKeyValuePairs(result);
    }

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
 

    const isApplicationExists = useCallback(() => {
        if (isValidApplication && decodedValues.app_id && decodedValues.branch_id && decodedValues.customer_id) {
            fetch(`https://goldquestreact.onrender.com/branch/candidate-application/backgroud-verification/is-application-exist?app_id=${decodedValues.app_id}&branch_id=${decodedValues.branch_id}&customer_id=${decodedValues.customer_id}`)
                .then(res => res.json())
                .then(result => {
                    if (!result.status) {
                        setIsValidApplication(false);
                        Swal.fire({
                            title: 'Error',
                            text:result.message,
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                        const form = document.getElementById('bg-form');
                        if (form) form.remove();
                    }
                })
                .catch(err => {
                    Swal.fire({
                        title: 'Error',
                        text: err.message,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        }
    }, [isValidApplication, decodedValues]);

    const fetchData = useCallback(() => {
        const serviceStr = '4,5,6';
        const serviceArr = serviceStr.split(',').map(Number);

        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        const fetchPromises = serviceArr.map(serviceId =>
            fetch(`https://goldquestreact.onrender.com/branch/candidate-application/backgroud-verification/service-form-json?service_id=${serviceId}`, requestOptions)
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
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        isApplicationExists();
    }, [isValidApplication, decodedValues]);

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const submittedData = {}; 
    
        serviceData.forEach((service) => {
            const serviceKey = service.db_table;
            submittedData[serviceKey] = {};
    
            service.rows.forEach((row) => {
                row.inputs.forEach((input) => {
                    submittedData[serviceKey][input.name] =
                        input.type === 'checkbox' ? input.checked : input.value || '';
                });
            });
        });
    
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        const raw = JSON.stringify({
            "branch_id": decodedValues.branch_id,
            "customer_id": decodedValues.customer_id,
            "application_id": decodedValues.app_id,
            ...formData,
            "annexure": submittedData, 
        });
    
        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };
    
        fetch("https://goldquestreact.onrender.com/branch/candidate-application/backgroud-verification/submit", requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // Assuming the server returns JSON
            })
            .then((result) => {
                 console.log(result);
            })
            .catch((error) => console.error('Error:', error));
    
    };
    


    const handleServiceChange = (e, serviceIndex, rowIndex, inputIndex) => {
        const { name, type, value, checked } = e.target;

        setServiceData(prevData => {
            const newData = [...prevData];
            const inputValue = type === 'checkbox' ? checked : value;

            newData[serviceIndex].rows[rowIndex].inputs[inputIndex].value = inputValue;
            return newData;
        });
    };


    return (
        <form action="" className='py-6' onSubmit={handleSubmit} id='bg-form'>
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
                            onChange={handleChange}

                        />
                    </div>

                    <div className="form-group col-span-2">
                        <label>Attach Govt. ID Proof: <span className="text-red-500">*</span></label>
                        <input
                            type="file"
                            className="form-control border rounded w-full bg-white p-3 mt-2"
                            name="govt_id"
                            onChange={handleChange}
                            multiple
                        />
                    </div>
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
                                onChange={handleChange}
                                value={formData.signature}
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
                {serviceData.map((service, serviceIndex) => (
                    <div key={serviceIndex} className='border md:p-8 p-2 rounded-md mt-5 bg-slate-100'>
                        <h2 className='text-center py-4 text-2xl'>{service.heading}</h2>
                        {service.rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="mb-4">
                                {row.heading && <h3 className='md:text-xl font-semibold mb-2'>{row.heading}</h3>}
                                <div className="md:flex flex-wrap gap-4">
                                    {row.inputs.map((input, inputIndex) => (
                                        <div key={inputIndex} className="mb-2 md:flex-1 md:min-w-[30%] max-w-full">
                                            <div className='flex items-center justify-start'>
                                                {input.type === 'checkbox' && (
                                                    <input
                                                        type="checkbox"
                                                        name={input.name}
                                                        checked={input.value || false}
                                                        onChange={(e) => handleServiceChange(e, serviceIndex, rowIndex, inputIndex)}
                                                        className="form-checkbox w-auto me-3"
                                                    />
                                                )}
                                                <label className="block text-slate-700 font-semibold mb-1 ">{input.label}</label>
                                            </div>
                                            {input.type !== 'checkbox' && (
                                                <input
                                                    type={input.type}
                                                    name={input.name}
                                                    required={input.required}
                                                    value={input.value || ''}
                                                    onChange={(e) => handleServiceChange(e, serviceIndex, rowIndex, inputIndex)}
                                                    className="mt-1 block p-2 border w-full border-slate-300 rounded-md focus:outline-none"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                <p className='text-center text-sm mt-4'>
                    NOTE: If you experience any issues or difficulties with submitting the form, please take screenshots of all pages, including attachments and error messages, and email them to <a href="mailto:onboarding@goldquestglobal.in">onboarding@goldquestglobal.in</a> . Additionally, you can reach out to us at <a href="mailto:onboarding@goldquestglobal.in">onboarding@goldquestglobal.in</a> .
                </p>

                <button type="submit" className='bg-green-500 p-3 w-full mt-5 rounded-md text-white '>Submit</button>
            </div>
        </form>
    );
};

export default BackgroundForm;
