import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import PulseLoader from 'react-spinners/PulseLoader'; // Import the PulseLoader
import LogoBgv from '../Images/LogoBgv.jpg'
import { FaGraduationCap, FaBriefcase, FaIdCard } from 'react-icons/fa';
const CandidateBGV = () => {
    const admin = JSON.parse(localStorage.getItem("admin"))?.name;
    const [error, setError] = useState(null);
    const [customBgv, setCustomBgv] = useState('');
    const [cefData, setCefData] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [serviceData, setServiceData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [serviceValueData, setServiceValueData] = useState([]);


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
            curren_address_stay_from: '',
            curren_address_landline_number: '',
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
    const location = useLocation();
    const currentURL = location.pathname + location.search;

    const queryParams = new URLSearchParams(location.search);

    // Extract the branch_id and applicationId
    const branchId = queryParams.get('branch_id');
    const applicationId = queryParams.get('applicationId');
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

    const fetchData = useCallback(() => {
        setLoading(true);  // Set loading to true before making the fetch request.
        
        const MyToken = localStorage.getItem('_token');
        const adminData = JSON.parse(localStorage.getItem('admin'));
        const admin_id = adminData?.id;
    
        const requestOptions = {
            method: "GET",
            redirect: "follow",
        };
    
        fetch(
            `https://octopus-app-www87.ondigitalocean.app/candidate-master-tracker/bgv-application-by-id?application_id=${applicationId}&branch_id=${branchId}&admin_id=${admin_id}&_token=${MyToken}`,
            requestOptions
        )
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error fetching data: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                setCompanyName(data.application.customer_name);
                setCefData(data.CEFData);
                const serviceDataa = data.serviceData;
                const jsonDataArray = Object.values(serviceDataa)?.map(item => item.jsonData);
                const serviceValueDataArray = Object.values(serviceDataa)?.map(item => item.data);
                setServiceData(jsonDataArray);
                setServiceValueData(serviceValueDataArray);
                setCustomBgv(data.customerInfo?.is_custom_bgv || '');
            })
            .catch(err => {
                setError(err.message);  // Set the error message in case of failure
            })
            .finally(() => {
                setLoading(false);  // Set loading to false after the fetch completes (whether successful or not)
            });
    }, []);
    

    useEffect(() => {

        fetchData();
    }, [fetchData]);
    const getFileExtension = (url) => {
        const ext = url.split('.').pop().toLowerCase();
        return ext;
    };
    const FileViewer = ({ fileUrl }) => {
        if (!fileUrl) {
            return <p>No file provided</p>; // Handle undefined fileUrl
        }

        const getFileExtension = (url) => url.split('.').pop().toLowerCase();

        const renderIframe = (url) => (
            <iframe
                src={`https://docs.google.com/gview?url=${url}&embedded=true`}
                width="100%"
                height="100%"
                title="File Viewer"
            />
        );

        const fileExtension = getFileExtension(fileUrl);

        // Determine the type of file and render accordingly
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(fileExtension)) {
            return <img src={fileUrl} alt="Image File" style={{}} />;
        }

        if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(fileExtension)) {
            return renderIframe(fileUrl);
        }

        return <p>Unsupported file type</p>;
    };
    console.log('cefData', cefData)
    return (
        <>
            {
                loading ? (
                    <div className='flex justify-center items-center py-6 ' >
                        <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />
                    </div >
                ) : <form action="" className='py-6' id='bg-form'>

                    <h4 className="text-green-600 text-xl mb-6 text-center font-bold">Candidate Background Verification Form</h4>

                    <div className="p-6 rounded md:w-8/12 m-auto ">
                        <div className="mb-6  p-4 rounded-md">
                            <h5 className="text-lg font-bold">Company name: <span className="text-lg font-normal"> {companyName} </span></h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6 border rounded-md  p-4">
                            <div className="form-group col-span-2 flex flex-col items-start">
                                <label className="text-sm font-medium text-gray-700">
                                    Applicant’s CV: <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2 w-1/3">

                                    <FileViewer fileUrl={cefData?.resume_file} className="w-full max-w-xs" />


                                </div>
                            </div>

                            {customBgv === 1 && (
                                <>

                                    <div className='border p-4 my-4 rounded-md gap-4 grid grid-cols-2'>
                                        <div className='form-group'>
                                            <label>Name as per Aadhar card</label>
                                            <input
                                                type="text"
                                                name="aadhar_card_name"
                                                value={cefData?.aadhar_card_name}
                                                readOnly
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group '>
                                            <label>Aadhar Card Image</label>
                                            <div className='max-w-20'>
                                                <FileViewer fileUrl={cefData?.aadhar_card_image} className="w-full max-w-20 " />
                                            </div>

                                        </div>
                                        <div className='form-group'>
                                            <label>Name as per Pan Card</label>
                                            <input
                                                type="text"
                                                name="pan_card_name"
                                                value={cefData?.pan_card_name}
                                                readOnly
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Pan Card Image</label>

                                            <div className='max-w-20'>
                                                <FileViewer fileUrl={cefData?.pan_card_image} className="w-full max-w-20 " />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group col-span-2">
                                        <label>Passport size photograph  - (mandatory with white Background) <span className="text-red-500">*</span></label>

                                        <div className='max-w-20'>
                                            <FileViewer fileUrl={cefData?.passport_photo} className="w-full max-w-20 " />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <h4 className="text-center text-xl my-6 font-bold ">Personal Information</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border  p-4 rounded-md">
                            <div className="form-group">
                                <label htmlFor="full_name">Full Name as per Govt ID Proof (first, middle, last): <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.full_name}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="full_name"
                                    name="full_name"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Full Address<span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.full_address}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="full_address"
                                    name="full_address"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Address <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.current_address}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="curren_address_stay_from"
                                    name="curren_address_stay_from"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Pin Code <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.pin_code}
                                    readOnly
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="pin_code"
                                    name="pin_code"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Landline Number <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.curren_address_landline_number}
                                    readOnly
                                    type="number"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="curren_address_landline_number"
                                    name="curren_address_landline_number"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current State <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.current_address_state}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_address_state"
                                    name="current_address_state"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Landmark<span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.current_prominent_landmark}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_prominent_landmark"
                                    name="current_prominent_landmark"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Current Address Stay No.<span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.current_address_stay_to}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="current_address_stay_to"
                                    name="current_address_stay_to"

                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="full_name">Nearest Police Station.<span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.nearest_police_station}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="nearest_police_station"
                                    name="nearest_police_station"

                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="former_name">Former Name/ Maiden Name (if applicable):</label>
                                <input
                                    value={cefData?.former_name}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="former_name"
                                    name="former_name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="mob_no">Mobile Number: <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.mb_no}
                                    readOnly
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
                                    value={cefData?.father_name}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="father_name"
                                    name="father_name"

                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="husband_name">Spouse's Name:</label>
                                <input
                                    value={cefData?.husband_name}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    id="husband_name"
                                    name="husband_name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dob">DOB: <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.dob}
                                    readOnly
                                    type="date"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="dob"
                                    id="dob"

                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">Gender: <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.gender}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="gender"
                                    id="gender"

                                />
                            </div>



                            <div className="form-group">
                                <label htmlFor="nationality">Nationality: <span className="text-red-500">*</span></label>
                                <input
                                    value={cefData?.nationality}
                                    readOnly
                                    type="text"
                                    className="form-control border rounded w-full p-2 mt-2"
                                    name="nationality"
                                    id="nationality"

                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="marital_status">Marital Status: <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="blood_group"
                                    value={cefData?.marital_status}
                                    readOnly
                                    className="form-control border rounded w-full p-2 mt-2"
                                />
                            </div>
                        </div>
                        {customBgv === 1 && (
                            <>

                                <label>Blood Group</label>
                                <div className='form-group'>
                                    <input
                                        type="text"
                                        name="blood_group"
                                        value={cefData?.blood_group}
                                        readOnly
                                        className="form-control border rounded w-full p-2 mt-2"
                                    />
                                </div>




                                <div className='form-group'>
                                    <label>Declaration Date:</label>
                                    <input
                                        type="date"
                                        name="declaration_date"
                                        value={cefData?.declaration_date}
                                        readOnly
                                        className="form-control border rounded w-full p-2 mt-2"
                                    />
                                </div>

                                <div className='border rounded-md p-3 mt-3'>
                                    <h3 className='text-center text-xl font-bold pb-4'>Add Emergency Contact Details</h3>
                                    <div className='grid grid-cols-3 gap-3'>
                                        <div className='form-group'>
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                name="emergency_details_name"
                                                value={cefData?.emergency_details_name}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Relation</label>
                                            <input
                                                type="text"
                                                name="emergency_details_relation"
                                                value={cefData?.emergency_details_relation}
                                                readOnly
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Contact Number</label>
                                            <input
                                                type="text"
                                                name="emergency_details_contact_number"
                                                value={cefData?.emergency_details_contact_number}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
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
                                                value={cefData?.pf_details_pf_number}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>PF Type</label>
                                            <input
                                                type="text"
                                                name="pf_details_pf_type"
                                                value={cefData?.pf_details_pf_type}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>PF Nominee</label>
                                            <input
                                                type="text"
                                                name="pf_details_pg_nominee"
                                                value={cefData?.pf_details_pg_nominee}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='border rounded-md p-3 mt-3'>
                                    <h3 className='text-center text-xl font-bold pb-4'>Do you have an NPS Account? If yes</h3>
                                    <div className='grid grid-cols-3 gap-3'>
                                        <div className='form-group '>
                                            <label>PRAN (Permanent Retirement Account Number). </label>
                                            <input
                                                type="text"
                                                name="nps_details_details_pran_number"
                                                value={cefData?.nps_details_details_pran_number}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Enter Nominee Details of NPS. </label>
                                            <input
                                                type="text"
                                                name="nps_details_details_nominee_details"
                                                value={cefData?.nps_details_details_nominee_details}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Enter your contribution details of NPS</label>
                                            <input
                                                type="text"
                                                name="nps_details_details_nps_contribution"
                                                value={cefData?.nps_details_details_nps_contribution}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <label className='mt-5 block'>Do you have an ICICI Bank A/c</label>

                                <div className='flex gap-6 mb-4'>
                                    <div className='form-group pt-2 flex  gap-2'>

                                        <input
                                            type="text"
                                            name="icc_bank_acc"
                                            value={cefData?.icc_bank_acc}
                                            readOnly
                                            className="form-control border rounded p-2 "
                                        />
                                    </div>

                                </div>
                                <div className='border rounded-md p-3 mt-3'>
                                    <h3 className='text-center text-xl font-bold pb-2'>Banking Details: </h3>
                                    <span className='text-sm text-center block'> Note: If you have an ICICI Bank account, please provide those details. If not, feel free to share your banking information from any other bank.</span>
                                    <div className='form-group mt-4'>
                                        <label>Bank Account Number</label>
                                        <input
                                            type="text"
                                            name="bank_details_account_number"
                                            value={cefData?.icc_bank_acc}
                                            readOnly

                                            className="form-control border rounded w-full p-2 mt-2"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label>Bank Name</label>
                                        <input
                                            type="text"
                                            name="bank_details_bank_name"
                                            value={cefData?.icc_bank_acc}
                                            readOnly

                                            className="form-control border rounded w-full p-2 mt-2"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label>Bank Branch Name</label>
                                        <input
                                            type="text"
                                            name="bank_details_branch_name"
                                            value={cefData?.bank_details_branch_name}
                                            readOnly

                                            className="form-control border rounded w-full p-2 mt-2"
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label>IFSC Code</label>
                                        <input
                                            type="text"
                                            name="bank_details_ifsc_code"
                                            value={cefData?.bank_details_ifsc_code}
                                            readOnly

                                            className="form-control border rounded w-full p-2 mt-2"
                                        />
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
                                                value={cefData?.insurance_details_name}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Nominee Relationship
                                            </label>
                                            <input
                                                type="text"
                                                name="insurance_details_nominee_relation"
                                                value={cefData?.insurance_details_nominee_relation}
                                                readOnly

                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <lalbel>Nominee Date of Birth
                                            </lalbel>
                                            <input
                                                type="date"
                                                name="insurance_details_nominee_dob"
                                                value={cefData?.insurance_details_nominee_dob}
                                                readOnly
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label>Contact No.
                                            </label>
                                            <input
                                                type="text"
                                                name="insurance_details_contact_number"
                                                value={cefData?.insurance_details_contact_number}
                                                readOnly
                                                className="form-control border rounded w-full p-2 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <label className='mt-5 block'>Do you want to opt for a Food Coupon?</label>

                                <div className='flex gap-6 mb-4'>
                                    <div className='form-group pt-2 flex gap-2'>
                                        <input
                                            type="text"
                                            name="food_coupon"
                                            value={cefData?.food_coupon}
                                            readOnly
                                            className="form-control border rounded p-2"
                                        />
                                    </div>
                                </div>

                                <p className='text-left '>Food coupons are vouchers or digital meal cards given to employees to purchase food and non-alcoholic beverages. Specific amount as per your requirement would get deducted from your Basic Pay. These are tax free, considered as a non-monetary benefit and are exempt from tax up to a specified limit.</p>

                            </>
                        )}
                        {
                            serviceData?.length > 0 ? (
                                serviceData.map((service, serviceIndex) => (
                                    <div key={serviceIndex} className="border border-gray-300 p-6 rounded-md mt-5 hover:transition-shadow duration-300">
                                        <h2 className="text-center py-4 text-2xl font-bold mb-6 text-green-600">{service.heading}</h2>
                                        <div className="space-y-6">
                                            {service.rows.map((row, rowIndex) => (
                                                <div key={rowIndex}>
                                                    {row.row_heading && (
                                                        <h3 className="text-lg font-semibold mb-4">{row.row_heading}</h3>
                                                    )}

                                                    {row.inputs && row.inputs.length > 0 ? (
                                                        <div className="space-y-4">
                                                            <div className={`grid grid-cols-${row.inputs.length === 1 ? '1' : row.inputs.length === 2 ? '2' : '3'} gap-3`}>
                                                                {row.inputs.map((input, inputIndex) => {
                                                                    // Check if the input name exists in serviceValueData and prefill accordingly
                                                                    const prefilledValue = serviceValueData?.find(item => item[input.name]);

                                                                    return (
                                                                        <div
                                                                            key={inputIndex}
                                                                            className={`flex flex-col space-y-2 ${row.inputs.length === 1 ? 'col-span-1' : row.inputs.length === 2 ? 'col-span-1' : ''}`}
                                                                        >
                                                                            <label className="block text-sm font-medium mb-2 text-gray-700 capitalize">
                                                                                {input.label.replace(/[\/\\]/g, '')}
                                                                            </label>

                                                                            {input.type === 'input' && (
                                                                                <input
                                                                                    readOnly
                                                                                    type="text"
                                                                                    name={input.name}
                                                                                    value={prefilledValue[input.name]}
                                                                                    defaultValue={prefilledValue ? prefilledValue[input.name] : ''}
                                                                                    className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                />
                                                                            )}
                                                                            {input.type === 'textarea' && (
                                                                                <textarea
                                                                                    readOnly
                                                                                    name={input.name}
                                                                                    rows={1}
                                                                                    defaultValue={prefilledValue ? prefilledValue[input.name] : ''}
                                                                                    className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                />
                                                                            )}
                                                                            {input.type === 'datepicker' && (
                                                                                <input
                                                                                    readOnly
                                                                                    type="date"
                                                                                    name={input.name}
                                                                                    defaultValue={prefilledValue ? prefilledValue[input.name] : ''}
                                                                                    className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                />
                                                                            )}
                                                                            {input.type === 'number' && (
                                                                                <input
                                                                                    readOnly
                                                                                    type="number"
                                                                                    name={input.name}
                                                                                    defaultValue={prefilledValue ? prefilledValue[input.name] : ''}
                                                                                    className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                />
                                                                            )}
                                                                            {input.type === 'email' && (
                                                                                <input
                                                                                    readOnly
                                                                                    type="email"
                                                                                    name={input.name}
                                                                                    defaultValue={prefilledValue ? prefilledValue[input.name] : ''}
                                                                                    className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                />
                                                                            )}
                                                                            {input.type === 'select' && (
                                                                                <input
                                                                                readOnly
                                                                                type="text"
                                                                                name={input.name}
                                                                                defaultValue={prefilledValue ? prefilledValue[input.name] : ''}
                                                                                className="mt-1 p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                            )}
                                                                            {input.type === 'file' && (
                                                                                <>
                                                                                    <FileViewer fileUrl={input.name} className="w-full max-w-xs" />

                                                                                </>
                                                                            )}

                                                                            {/* Handling Checkbox Inputs */}
                                                                            {input.type === 'checkbox' && (
                                                                                <div className="flex items-center space-x-3">
                                                                                    <input
                                                                                      disabled  
                                                                                        type="checkbox"
                                                                                        name={input.name}
                                                                                        defaultChecked={prefilledValue ? prefilledValue[input.name] === 'on' : false}
                                                                                        className="h-5 w-5 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-xl text-gray-500">No services available.</p>
                            )
                        }


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
                                    <label>Attach Signature: <span className="text-red-500">*</span></label>
                                    <FileViewer fileUrl={cefData?.signature} className="w-full max-w-20 " />
                                </div>

                                <div className="form-group">
                                    <label>Name:</label>
                                    <input

                                        value={cefData?.name_declaration}
                                        readOnly
                                        type="text"
                                        className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                        name="name_declaration"

                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date:</label>
                                    <input

                                        value={cefData?.declaration_date}
                                        readOnly
                                        type="date"
                                        className="form-control border rounded w-full p-2 mt-2 bg-white mb-0"
                                        name="declaration_date"

                                    />
                                </div>
                            </div>
                        </div>

                        <h5 className="text-center text-lg my-6 font-bold">Documents(Mandatory)</h5>

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


                    </div>
                </form>
            }

        </>
    );
};

export default CandidateBGV;
