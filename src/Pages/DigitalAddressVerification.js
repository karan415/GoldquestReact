import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const DigitalAddressVerification = () => {
    const [formData, setFormData] = useState({
        personal_information: {
            candidateName: 'gfgf',
            mobNo: '657586787',
            emailId: 'shikhawebstep@gmail.com',
            candidateLocation: '45',
            aadhaarNumber: '',
            dob: '',
            fatherName: '',
            husbandName: '',
            gender: '',
            maritalStatus: '',
            pincode: '',
            state: '',
            landmark: '',
            policeStation: '',
            yearsStaying: '',
            fromDate: '',
            toDate: '',
            idType: '',
            idProof:'' ,
            homePhotos:'' ,
            localityProof: '',
        }
    });

    const [mapLocation, setMapLocation] = useState({ latitude: '', longitude: '' });
    const [isValidApplication, setIsValidApplication] = useState(true);
    const location = useLocation();
    const currentURL = location.pathname + location.search;

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapLocation({ latitude, longitude });
                },
                (error) => {
                    Swal.fire({
                        title: 'Error',
                        text: "Unable to retrieve your location.",
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            );
        } else {
            Swal.fire({
                title: 'Error',
                text: "Geolocation is not supported by this browser.",
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

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

        const isValidBase64 = (str) => /^[A-Za-z0-9+/]+={0,2}$/.test(str) && (str.length % 4 === 0);

        const decodeKeyValuePairs = (obj) => Object.entries(obj).reduce((acc, [key, value]) => {
            const decodedKey = isValidBase64(key) ? atob(key) : key;
            const decodedValue = value && isValidBase64(value) ? atob(value) : null;
            acc[decodedKey] = decodedValue;
            return acc;
        }, {});

        return decodeKeyValuePairs(result);
    };

    const decodedValues = getValuesFromUrl(currentURL);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                personal_information: {
                    ...prev.personal_information,
                    [name]: files[0] // Update for file inputs
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                personal_information: {
                    ...prev.personal_information,
                    [name]: value // Update for regular inputs
                }
            }));
        }
    };

    const isApplicationExists = useCallback(() => {
        if (isValidApplication && decodedValues.app_id && decodedValues.branch_id && decodedValues.customer_id) {
            fetch(`https://goldquestreact.onrender.com/branch/candidate-application/digital-address-verification/is-application-exist?app_id=${decodedValues.app_id}&branch_id=${decodedValues.branch_id}&customer_id=${decodedValues.customer_id}`)
                .then(res => res.json())
                .then(result => {
                    if (!result.status) {
                        setIsValidApplication(false);
                        Swal.fire({
                            title: 'Error',
                            text: result.message,
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                    const form = document.getElementById('bg-form');
                        if (form) form.remove();
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

    useEffect(() => {
        isApplicationExists();
    }, [isApplicationExists]);

    

    const handleSubmitForm = async (e) => {
        e.preventDefault();

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
   
        const personal_information=formData.personal_information;
     
        const raw = JSON.stringify({
            branch_id: decodedValues.branch_id,
            customer_id: decodedValues.customer_id,
            application_id: decodedValues.app_id,
            personal_information,
        });

        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch("https://goldquestreact.onrender.com/branch/candidate-application/digital-address-verification/submit", requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.status) {
                    Swal.fire({
                        title: 'Success',
                        text: result.message,
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: result.message,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred during submission.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
    };

    return (
        <>
            <form action="" onSubmit={handleSubmitForm} className='p-4' id='bg-form'>
                <h3 className="text-center py-3 font-bold text-2xl">Digital Address Verification</h3>
                <div className="border md:w-7/12 m-auto p-4 ">
                    <div className="md:grid grid-cols-1 md:grid-cols-3 mb-2 gap-4">
                        <div className=" my-3 form-group">
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name:</label>
                            <input type="text" value="indivisual" className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="company_name" name="company_name" readOnly />
                        </div>

                        <div className=" my-3 form-group">
                            <label htmlFor="candidate_name" className="block text-sm font-medium text-gray-700">Candidate Name:</label>
                            <input type="text" value={formData.candidateName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="candidate_name" name="candidateName" />
                        </div>

                        <div className=" my-3 form-group">
                            <label className="block text-sm font-medium text-gray-700">Employee ID:</label>
                            <input type="text" onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="employee_id" />
                        </div>
                    </div>
                    <div className="md:grid grid-cols-1 md:grid-cols-2 mb-2 gap-4">
                        <div className=" my-3 form-group">
                            <label htmlFor="mob_no" className="block text-sm font-medium text-gray-700">Mobile No:</label>
                            <input type="text" value={formData.personal_information.mobNo} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="mob_no" name="mobNo" />
                        </div>

                        <div className=" my-3 form-group">
                            <label htmlFor="email_id" className="block text-sm font-medium text-gray-700">Email ID:</label>
                            <input type="email" value={formData.personal_information.emailId} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="email_id" name="emailId" />
                        </div>
                    </div>
                    <div className="md:grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className=" my-3 form-group">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="address" name="candidate_address" rows="2"></textarea>
                        </div>

                        <div className=" my-3 form-group">
                            <label htmlFor="candidate_location" className="block text-sm font-medium text-gray-700">Location:</label>
                            <input type="text" value={formData.personal_information.candidateLocation} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="candidate_location" name="candidateLocation" />
                        </div>

                    </div>
                    <div className="md:grid grid-cols-1 md:grid-cols-2 mb-2 gap-4">
                        <div className=" my-3 form-group">
                            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude:</label>
                            <input type="text" value={mapLocation.latitude} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="latitude" name="latitude" />
                        </div>
                        <div className=" my-3 form-group">
                            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude:</label>
                            <input type="text" onChange={handleChange} value={mapLocation.longitude} className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="longitude" name="longitude" />
                        </div>

                    </div>
                    <div className="col-span-2">
                        <button type="button" className="mt-3 bg-green-500 text-white font-bold py-2 px-4 rounded" onClick={getLocation}>Get Geo Coordinates <i className="fa fa-map-marker"></i></button>
                    </div>
                    <div className="col-span-2 mt-5 mb-2">
                        <h4 className="text-center text-lg font-semibold">Personal Information</h4>
                    </div>


                    <div className="md:grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className=" my-3 form-group">
                            <label htmlFor="aadhaar_number" className="block text-sm font-medium text-gray-700">Aadhaar Number:</label>
                            <input type="text" value={formData.personal_information.aadhaarNumber} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="aadhaarNumber" />
                        </div>

                        <div className=" my-3 form-group">
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth:</label>
                            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="dob" id="dob" onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group mb-2">
                        <label htmlFor="father_name" className="block text-sm font-medium text-gray-700">Father's Name:</label>
                        <input type="text" value={formData.personal_information.fatherName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="fatherName" />
                    </div>
                    <div className="form-group mb-2">
                        <label htmlFor="husband_name" className="block text-sm font-medium text-gray-700">Husband's Name:</label>
                        <input type="text" value={formData.personal_information.husbandName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="husbandName" />
                    </div>
                    <div className="md:grid grid-cols-1 md:grid-cols-2 mb-2 gap-4">


                        <div className=" my-3 form-group">
                            <p className="text-sm font-medium text-gray-700 mb-2">Gender:</p>
                            <div className="flex space-x-4 flex-wrap">
                                <label className="flex items-center">
                                    <input type="radio" className="form-radio me-2" name="gender" value="male" onChange={handleChange} /> Male
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" className="form-radio me-2" name="gender" value="female" onChange={handleChange} /> Female
                                </label>
                            </div>
                        </div>

                        <div className=" my-3 form-group">
                            <p className="text-sm font-medium text-gray-700 mb-2">Marital Status:</p>
                            <div className="flex space-x-4 flex-wrap">
                                <label className="flex items-center">
                                    <input type="radio" className="form-radio me-2" name="maritalStatus" value="married" onChange={handleChange} /> Married
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" className="form-radio me-2" name="maritalStatus" value="unmarried" onChange={handleChange} /> Unmarried
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" className="form-radio me-2" name="maritalStatus" value="divorced" onChange={handleChange} /> Divorced
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" className="form-radio me-2" name="maritalStatus" value="widower" onChange={handleChange} /> Widower
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="md:grid grid-cols-1 md:grid-cols-2 mb-2 gap-4">
                        <div className=" my-3 form-group">
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode:</label>
                            <input type="text" value={formData.personal_information.pincode} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="pincode" />
                        </div>

                        <div className=" my-3 form-group">
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State:</label>
                            <input type="text" value={formData.personal_information.state} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="state" />
                        </div>


                    </div>
                    <div className=" my-3 form-group">
                        <label htmlFor="landmark" className="block text-sm font-medium text-gray-700">Prominent Landmark:</label>
                        <input type="text" value={formData.personal_information.landmark} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="landmark" />
                    </div>
                    <div className="md:grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className=" my-3 form-group">
                            <label htmlFor="police_station" className="block text-sm font-medium text-gray-700">Nearest Police Station:</label>
                            <input type="text" value={formData.personal_information.policeStation} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="policeStation" />
                        </div>

                    </div>

                    <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-700">Period of Stay:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>From Date:</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="fromDate" onChange={handleChange} />
                            </div>
                            <div>
                                <label>To Date:</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="toDate" onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className=" my-3 form-group">
                        <label htmlFor="id_type" className="block text-sm font-medium text-gray-700">Type of ID Attached:</label>
                        <input type="text" value={formData.personal_information.idType} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="id_type" name="idType" />
                    </div>

                    <div className="md:grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className=" my-3 form-group">
                            <label htmlFor="id_proof" className="block text-sm font-medium text-gray-700">Upload ID:</label>
                            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="id_proof" name="idProof" onChange={handleChange} multiple />
                        </div>

                        <div className=" my-3 form-group">
                            <label htmlFor="locality_proof" className="block text-sm font-medium text-gray-700">Home Photos:</label>
                            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="locality_proof" name="homePhotos" onChange={handleChange} multiple />
                        </div>
                    </div>
                    <div className="md:grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className=" my-3 form-group">
                            <label htmlFor="locality_proof" className="block text-sm font-medium text-gray-700">Locality Photos:</label>
                            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md border p-2" id="locality_proof" name="localityProof" onChange={handleChange} multiple />
                        </div>
                        <div className="form-group my-3">
                            <label htmlFor="nof_yrs_staying" className="block text-sm font-medium text-gray-700">No of years staying in the address:</label>
                            <input type="text" value={formData.personal_information.yearsStaying} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md border p-2" name="yearsStaying" />
                        </div>
                    </div>
                    <button type="submit" className='bg-green-500 p-3 w-full rounded-md text-white mt-4'>Submit</button>
                </div>



            </form>


        </>
    );
};

export default DigitalAddressVerification;
