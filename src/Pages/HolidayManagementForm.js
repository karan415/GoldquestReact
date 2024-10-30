import React, { useEffect, useState } from 'react';
import { useHoliday } from './HolidayManagementContext';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';

const HolidayManagementForm = () => {
    const API_URL = useApi();
    const { selectedService, updateServiceList, fetchData } = useHoliday();
    const [adminId, setAdminId] = useState(null);
    const [storedToken, setStoredToken] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dateInput, setDateInput] = useState({
        name: "",
        date: "",
    });
    const [error, setError] = useState({});


    useEffect(() => {
        const adminData = JSON.parse(localStorage.getItem("admin"));
        const token = localStorage.getItem("_token");
        if (adminData) setAdminId(adminData.id);
        if (token) setStoredToken(token);
        if (selectedService) {
            const initialDate = selectedService.date;
            const formattedDate = initialDate.split("T")[0];
            setDateInput({
                name: selectedService.title || '',
                date: formattedDate || '',
            });
            setIsEdit(true);
        } else {
            setDateInput({
                name: "",
                date: "",
            });
            setIsEdit(false);
        }
    }, [selectedService]);

    const validate = () => {
        const newErrors = {};
        if (!dateInput.name) {
            newErrors.name = 'This Field is Required!';
        }
        if (!dateInput.date) {
            newErrors.date = 'This Field is Required!';
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDateInput((prevInput) => ({
            ...prevInput, [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validateError = validate();

        if (Object.keys(validateError).length === 0) {
            setLoading(true); // Start loading
            const requestOptions = {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: selectedService?.id || '',
                    title: dateInput.name,
                    date: dateInput.date,
                    admin_id: adminId,
                    _token: storedToken,
                }),
            };

            const url = isEdit
                ? `${API_URL}/holiday/update`
                : `${API_URL}/holiday/create`;

            fetch(url, requestOptions)
                .then(response => {
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
                    return response.json();
                })
                .then((result) => {
                    const newToken = result._token || result.token;
                    if (newToken) {
                        localStorage.setItem("_token", newToken);
                    }
                    setError({});
                    Swal.fire({
                        title: "Success",
                        text: isEdit ? 'Service updated successfully' : 'Service added successfully',
                        icon: "success",
                        confirmButtonText: "Ok"
                    });

                    if (isEdit) {
                        updateServiceList(prevList => prevList.map(service => service.id === result.id ? result : service));
                    } else {
                        updateServiceList(prevList => [...prevList, result]);
                    }
                    fetchData();
                    setDateInput({ name: "", date: "" });
                    setIsEdit(false);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false); // Stop loading
                });
        } else {
            setError(validateError);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='border rounded-md p-5'>
            <div className="mb-4">
                <label htmlFor="holidaytitle" className="block">Service Name</label>
                <input
                    type="text"
                    name="name"
                    id="holidaytitle"
                    value={dateInput.name}
                    onChange={handleChange}
                    className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
                {error.name && <p className='text-red-500'>{error.name}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="HoliDayDate" className="block">Service Description</label>
                <input
                    type="date"
                    name="date"
                    id="HoliDayDate"
                    value={dateInput.date}
                    onChange={handleChange}
                    className='outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2 capitalize' />
                {error.date && <p className='text-red-500'>{error.date}</p>}
            </div>
            <button className="bg-green-500 hover:bg-green-200 text-white w-full rounded-md p-3" type='submit' disabled={loading}>
                {loading ? 'Processing...' : isEdit ? 'Update' : 'Add'}
            </button>
        </form>
    );
};

export default HolidayManagementForm;