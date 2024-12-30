import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import LoginContext from './InternalLoginContext';

const InternalLoginForm = () => {
    const { formData, fetchData, setFormData, editAdmin } = useContext(LoginContext)

    const [error, setError] = useState({});
    const [roles, setRoles] = useState([]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev, [name]: value,
        }));
    };
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");
    useEffect(() => {
        const fetchAdminOptions = async () => {
            try {
                const response = await axios.get(
                    `https://octopus-app-www87.ondigitalocean.app/admin/permission/roles`,
                    {
                        params: {
                            admin_id: admin_id,
                            _token: storedToken,
                        },
                    }
                );

                console.log(response.data);
                const adminRoles = response.data
                setRoles(adminRoles.roles)
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'An error occurred while fetching data.',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                });
            }
        };

        fetchAdminOptions();
    }, []); // Empty dependency array to run once on mount



    const Validate = () => {
        const errors = {};
        if (!formData.employee_id) errors.employee_id = 'This field is required';
        if (!formData.name) errors.name = 'This field is required';
        if (!formData.mobile) errors.mobile = 'This field is required';
        else if (formData.mobile.length !== 10) errors.mobile = 'mobile must be 10 characters';
        if (!formData.email) errors.email = 'This field is required';
        if (!formData.password) errors.password = 'This field is required';
        if (!formData.role) errors.role = 'This field is required';
        return errors;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Perform validation
        const validateError = Validate();

        if (Object.keys(validateError).length === 0) {
            setError({});

            const requestformData = {
                "admin_id": admin_id,
                "_token": storedToken,
                ...formData,
                "send_mail": 1,
                ...(editAdmin && {

                    id: formData.id,
                    status: formData.status
                })
            };


            Swal.fire({
                title: 'Processing...',
                text: 'Please wait while we create the admin.',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await axios({
                    method: editAdmin ? 'PUT' : 'POST', // Dynamically set the HTTP method
                    url: editAdmin
                        ? 'https://octopus-app-www87.ondigitalocean.app/admin/update'
                        : 'https://octopus-app-www87.ondigitalocean.app/admin/create',
                    data: requestformData, // Pass request data here
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                // Handle the response
                const result = response.data; // Corrected to access data from the response

                const newToken = result._token || result.token;
                if (newToken) {
                    localStorage.setItem("branch_token", newToken);
                }
                if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
                    Swal.fire({
                        title: "Session Expired",
                        text: "Your session has expired. Please log in again.",
                        icon: "warning",
                        confirmButtonText: "Ok",
                    }).then(() => {
                        // Redirect to admin login page
                        window.location.href = "/admin-login"; // Replace with your login route
                    });
                }
                if (result.status) {
                    Swal.fire({
                        title: 'Success!',
                        text: result.message || 'Admin created successfully.',
                        icon: 'success',
                        confirmButtonText: 'Ok',
                    });
                    setFormData({
                        employee_id: '',
                        name: '',
                        mobile: '',
                        email: '',
                        password: '',
                        role: '',
                        id: '',
                        status: ''
                    });
                    fetchData(); // Call to fetch data after success
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: result.message || 'Failed to create admin.',
                        icon: 'error',
                        confirmButtonText: 'Ok',
                    });
                }
            } catch (error) {
                // Handle API or network errors
                Swal.fire({
                    title: 'Error!',
                    text: `Error: ${error.response?.data?.message || error.message}`,
                    icon: 'error',
                    confirmButtonText: 'Ok',
                });
            }
        } else {
            setError(validateError); // Show validation errors
        }
    };



    return (
        <>
            <form action="" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="employee_id">Employee ID: *</label>
                    <input
                        type="text"
                        name="employee_id"
                        id="employee_id"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={formData.employee_id}
                    />
                    {error.employee_id && <p className='text-red-500'>{error.employee_id}</p>}
                </div>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="Employee-name">Employee Name: *</label>
                    <input
                        type="text"
                        name="name"
                        id="Employee-name"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={formData.name}
                    />
                    {error.name && <p className='text-red-500'>{error.name}</p>}
                </div>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="mobile-mobile">Employee Mobile: *</label>
                    <input
                        type="mobile"
                        name="mobile"
                        id="mobile-mobile"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={formData.mobile}
                    />
                    {error.mobile && <p className='text-red-500'>{error.mobile}</p>}
                </div>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="emailid">Email: *</label>
                    <input
                        type="email"
                        name="email"
                        id="emailid"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={formData.email}
                    />
                    {error.email && <p className='text-red-500'>{error.email}</p>}
                </div>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="password">Password: *</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={formData.password}
                    />
                    {error.password && <p className='text-red-500'>{error.password}</p>}
                </div>
                {editAdmin && (
                    <div className="mb-4">
                        <label className="text-gray-500">Status: *</label>
                        <div className="flex items-center space-x-4 mt-3">
                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    id="active"
                                    name="status"
                                    value="1"
                                    checked={formData.status === 1}
                                    onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                                    className="mr-2"
                                />
                                <label htmlFor="active" className="text-sm">Active</label>
                            </div>

                            {/* Inactive Status */}
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    id="inactive"
                                    name="status"
                                    value="0"
                                    checked={formData.status === 0}
                                    onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                                    className="mr-2"
                                />
                                <label htmlFor="inactive" className="text-sm">Inactive</label>
                            </div>
                        </div>
                    </div>
                )}


                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="role">Role: *</label>
                    <select
                        name="role"
                        id="role"
                        className="w-full border p-2 rounded-md mt-2"
                        onChange={handleChange}
                        value={formData.role}
                    >
                        <option value="">Select a role</option>

                        {roles.map((item) => {
                            return (
                                <>
                                    <option value={item.role}>{item.role}</option>
                                </>
                            )
                        })}
                    </select>
                    {error.role && <p className='text-red-500'>{error.role}</p>}
                </div>
                <button type="submit" className='bg-green-400 hover:bg-green-200 text-white p-3 rounded-md w-full'>Send</button>
            </form>
        </>
    );
}

export default InternalLoginForm;
