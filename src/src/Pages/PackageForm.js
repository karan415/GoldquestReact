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
            };
    
            const url = isEditMode
                ? `${API_URL}/package/update`
                : `${API_URL}/package/create`;
    
            fetch(url, requestOptions)
                .then(async (response) => {
                    const result = await response.json();
    
                    // Save new token if available
                    const newToken = result._token || result.token;
                    if (newToken) {
                        localStorage.setItem("_token", newToken);
                    }
    
                    // Handle API error response
                    if (!response.ok) {
                        const errorMessage = result.message || "An error occurred";
                        Swal.fire({
                            title: "Error!",
                            text: errorMessage,
                            icon: "error",
                            confirmButtonText: "Ok",
                        });
                        throw new Error(errorMessage);
                    }
    
                    // Return result if successful
                    return result;
                })
                .then((result) => {
                    // Display success message
                    Swal.fire({
                        title: "Success!",
                        text: isEditMode
                            ? "Package Edited Successfully"
                            : "Package Added Successfully",
                        icon: "success",
                        confirmButtonText: "Ok",
                    });
    
                    // Update the package list
                    setError({});
                    if (isEditMode) {
                        const updatedPackages = packageList.map((pkg) =>
                            pkg.id === result.id ? result : pkg
                        );
                        updatePackageList(updatedPackages);
                    } else {
                        updatePackageList([...packageList, result]);
                    }
    
                    // Reset form fields
                    setPackageInput({
                        name: "",
                        message: "",
                    });
                    fetchData();
                    setIsEditMode(false);
    
                    // Additional callbacks
                    if (typeof clearSelectedPackage === "function") {
                        clearSelectedPackage();
                    }
                    if (typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                })
                .catch((error) => {
                    console.error("API Error:", error.message);
                    Swal.fire({
                        title: "Error!",
                        text: error.message || "Failed to process the request",
                        icon: "error",
                        confirmButtonText: "Ok",
                    });
                })
                .finally(() => {
                    setIsLoading(false); // Stop loading after submission
                });
        } else {
            // Show validation errors
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
