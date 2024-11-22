import React, { useState, useEffect } from 'react';
import { usePackage } from './PackageContext';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';

const PackageForm = ({ onSuccess }) => {
    const API_URL = useApi();

    const { fetchData } = usePackage();
    const { selectedPackage, clearSelectedPackage, packageList, updatePackageList } = usePackage();
    const [packageInput, setPackageInput] = useState({
        name: "",
        message: "",
    });
    const [error, setError] = useState({});
    const [adminId, setAdminId] = useState(null);
    const [, setStoredToken] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formMessage, setFormMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

    useEffect(() => {
        const adminData = JSON.parse(localStorage.getItem("admin"));
        const token = localStorage.getItem("_token");

        if (adminData) setAdminId(adminData.id);
        if (token) setStoredToken(token);
        if (selectedPackage) {
            setPackageInput({
                name: selectedPackage.title || "",
                message: selectedPackage.description || "",
            });
            setIsEditMode(true);
        } else {
            setPackageInput({
                name: "",
                message: "",
            });
            setIsEditMode(false);
        }
    }, [selectedPackage]);

    const validateInputs = () => {
        const errors = {};
        if (!packageInput.name) {
            errors.name = 'This field is required!';
        }
        if (!packageInput.message) {
            errors.message = 'This field is required!';
        }
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPackageInput(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePackageFormSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading

        const adminData = JSON.parse(localStorage.getItem("admin"));
        const token = localStorage.getItem("_token");

        if (adminData) setAdminId(adminData.id);
        if (token) setStoredToken(token);
        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length === 0) {

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                id: selectedPackage?.id || "",
                title: packageInput.name,
                description: packageInput.message,
                admin_id: adminId,
                _token: token,
            });

            const requestOptions = {
                method: isEditMode ? "PUT" : "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const url = isEditMode
                ? `${API_URL}/package/update`
                : `${API_URL}/package/create`;

            fetch(url, requestOptions)
                .then(response => {
                    const result = response.json();
                    const newToken = result._token || result.token;
                    if (newToken) {
                        localStorage.setItem("_token", newToken);
                    }
                    if (!response.ok) {
                        return response.text().then(text => {
                            const errorData = JSON.parse(text);
                            Swal.fire(
                                'Error!',
                                `An error occurred: ${errorData.message}`,
                                'error'
                            );
                            throw new Error(text);
                        });
                    }
                    return result;
                })
                .then(result => {

                    setError({});
                    Swal.fire({
                        title: "Success",
                        text: isEditMode ? 'Package Edited Successfully' : 'Package added successfully',
                        icon: "success",
                        confirmButtonText: "Ok"
                    });
                    if (isEditMode) {
                        const updatedPackages = packageList.map(pkg =>
                            pkg.id === result.id ? result : pkg
                        );
                        updatePackageList(updatedPackages);
                    } else {
                        updatePackageList([...packageList, result]);
                    }

                    setPackageInput({
                        name: "",
                        message: "",
                    });
                    fetchData();
                    setIsEditMode(false);

                    if (typeof clearSelectedPackage === 'function') {
                        clearSelectedPackage();
                    }

                    if (typeof onSuccess === 'function') {
                        onSuccess(result);
                    }

                    setTimeout(() => setFormMessage(""), 5000);
                })
                .catch(error => {
                    console.log(error);
                })
                .finally(() => {
                    setIsLoading(false); // Stop loading after submission
                });
        } else {
            setError(validationErrors);
            setIsLoading(false); // Stop loading if there are validation errors
        }
    };

    return (
        <>
        <form onSubmit={handlePackageFormSubmit}>
            <div className="mb-4">
                <label htmlFor="packagename">Package Name:</label>
                <input
                    type="text"
                    name="name"
                    id="packagename"
                    className="border w-full rounded-md p-2 mt-2 capitalize"
                    onChange={handleChange}
                    value={packageInput.name}
                />
                {error.name && <p className="text-red-500">{error.name}</p>}
            </div>

            <div className="mb-4">
                <label htmlFor="message">Package Description:</label>
                <textarea
                    name="message"
                    id="message"
                    className="w-full border p-3 outline-none rounded-md mt-2 capitalize"
                    rows={5}
                    cols={4}
                    onChange={handleChange}
                    value={packageInput.message}
                ></textarea>
                {error.message && <p className="text-red-500">{error.message}</p>}
            </div>
            <button
                type="submit"
                className='bg-green-400 text-white p-3 rounded-md w-full hover:bg-green-200'
                disabled={isLoading} // Disable button while loading
            >
                {isLoading ? 'Processing...' : isEditMode ? 'Update' : 'Send'}
            </button>

            {formMessage && <p className="mt-4 text-center text-green-600">{formMessage}</p>}
        </form>
        </>
    );
};

export default PackageForm;
