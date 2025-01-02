import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import LoginContext from './InternalLoginContext';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css';
const InternalLoginForm = () => {
    const { formData, fetchData,setEditAdmin, setFormData, editAdmin, } = useContext(LoginContext)

    const [error, setError] = useState({});
    const [roles, setRoles] = useState([]);
    const [group, setGroup] = useState([]);
    const [loading, setLoading] = useState(null);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev, [name]: value,
        }));
    };
    console.log('formData', formData)
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");
    useEffect(() => {
        setLoading(true);
        const fetchAdminOptions = async () => {
            try {
                const response = await axios.get(
                    `http://147.93.29.154:5000/admin/permission/roles`,
                    {
                        params: {
                            admin_id,
                            _token: storedToken,
                        },
                    }
                );

                console.log(response.data);
                const adminRoles = response.data.data;

                setRoles(adminRoles.roles || []); // Ensure roles is an array
                setGroup(adminRoles.groups?.filter(Boolean) || []); // Remove any blank entries
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'An error occurred while fetching data.',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                });
            }
            setLoading(false);
        };

        fetchAdminOptions();
    }, []); // Dependency array ensures this runs only once



    const Validate = () => {
        const errors = {};

        // Validate employee_id: no spaces allowed
        if (!formData.employee_id) {
            errors.employee_id = 'This field is required';
        } else if (/\s/.test(formData.employee_id)) {
            errors.employee_id = 'Employee ID should not contain spaces';
        }

        // Validate mobile: no spaces and exactly 10 digits
        if (!formData.mobile) {
            errors.mobile = 'This field is required';
        } else if (/\s/.test(formData.mobile)) {
            errors.mobile = 'Mobile number should not contain spaces';
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            errors.mobile = 'Mobile number must be exactly 10 digits';
        }

        // Validate other fields
        if (!formData.name) errors.name = 'This field is required';
        if (!formData.email) errors.email = 'This field is required';
        if (!formData.password) errors.password = 'This field is required';
        if (!formData.role) errors.role = 'This field is required';

        return errors;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Perform validation
        let validateError = {};
        if (!editAdmin) {
            validateError = Validate(); // Only perform validation if not editing
        }

        // Check if there are any validation errors
        if (Object.keys(validateError).length === 0) {
            setError({}); // Reset errors

            const requestformData = {
                admin_id: admin_id,
                _token: storedToken,
                ...formData,
                send_mail: 1,
                ...(editAdmin && { id: formData.id, status: formData.status }) // Add ID and status if editing
            };

            // Show processing alert while making the request
            Swal.fire({
                title: 'Processing...',
                text: 'Please wait while we create the admin.',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await axios({
                    method: editAdmin ? 'PUT' : 'POST', // Dynamically set HTTP method based on editAdmin
                    url: editAdmin
                        ? 'http://147.93.29.154:5000/admin/update'
                        : 'http://147.93.29.154:5000/admin/create',
                    data: requestformData, // Pass request data
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Handle the response
                const result = response.data;

                // Handle token refresh
                const newToken = result._token || result.token;
                if (newToken) {
                    localStorage.setItem('branch_token', newToken);
                }

                // Check for invalid token response
                if (
                    result.message &&
                    result.message.toLowerCase().includes('invalid') &&
                    result.message.toLowerCase().includes('token')
                ) {
                    Swal.fire({
                        title: 'Session Expired',
                        text: 'Your session has expired. Please log in again.',
                        icon: 'warning',
                        confirmButtonText: 'Ok',
                    }).then(() => {
                        // Redirect to admin login page
                        window.location.href = '/admin-login'; // Replace with your login route
                    });
                } else if (result.status) {
                    // Success
                    Swal.fire({
                        title: 'Success!',
                        text: result.message || 'Admin created successfully.',
                        icon: 'success',
                        confirmButtonText: 'Ok',
                    });

                    // Reset form data
                    setFormData({
                        employee_id: '',
                        name: '',
                        mobile: '',
                        email: '',
                        password: '',
                        role: '',
                        id: '',
                        status: '',
                        service_groups:[],
                    });

                    fetchData(); // Call to fetch data after success
                } else {
                    // Failure
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
            // Show validation errors if any
            setError(validateError);
        }
    };
    const emptyForm = () => {
        setEditAdmin(false)
        setFormData({
            employee_id: '',
            name: '',
            mobile: '',
            email: '',
            password: '',
            role: '',
            id: '',
            status: '',
            service_groups: [],
        });
    setError({});
    }
    const options = [
        { value: 'select_all', name: 'Select All / Deselect All' }, // Add the "Select All" option
        ...group.map((item) => ({ value: item, name: item })), // Map groups to SelectSearch options
    ];

    const handleServiceGroupChange = (selected) => {
        if (selected.includes('select_all')) {
            // Toggle Select All / Deselect All
            if (formData.service_groups?.length === group.length) {
                // If all selected, deselect all
                setFormData((prev) => ({ ...prev, service_groups: [] }));
            } else {
                // Otherwise, select all
                setFormData((prev) => ({ ...prev, service_groups: group }));
            }
        } else {
            // Update with selected options
            setFormData((prev) => ({ ...prev, service_groups: selected }));
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
                        type="number"
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
                {!editAdmin && (
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
                )}
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
                                    checked={formData.status == 1}
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
                                    checked={formData.status == 0}
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

                    <div className="relative">
                        <select
                            name="role"
                            id="role"
                            className="w-full border p-2 rounded-md mt-2"
                            onChange={handleChange}
                            value={formData.role}
                            disabled={loading}

                        >
                            <option value="">Select a role</option>
                            {roles.map((role, index) => (
                                <option key={index} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                        {loading && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <div className="loader border-t-transparent border-gray-400 border-2 w-5 h-5 rounded-full animate-spin z-50"></div>
                            </div>
                        )}
                    </div>
                    {error.role && <p className='text-red-500'>{error.role}</p>}
                </div>

                {formData.role !== 'admin' && (
                <div className="mb-4 relative">
                    <label htmlFor="service_group" className="block mb-2">Service Group</label>
                    <SelectSearch
                        multiple
                        options={options}
                        value={formData.service_groups}
                        name="service_groups"
                        placeholder="Select Group"
                        onChange={(value) => {
                            handleServiceGroupChange(value);
                        }}
                        search
                        disabled={loading}
                    />
                    {loading && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="loader border-t-transparent border-gray-400 border-2 w-5 h-5 rounded-full z-50 animate-spin"></div>
                        </div>
                    )}
                </div>
            )}
                <button type="submit" className='bg-green-400 hover:bg-green-200 text-white p-3 rounded-md w-full'>Send</button>
                <button type="button" onClick={emptyForm} className='bg-blue-400 hover:bg-blue-800 text-white p-3 mt-5 rounded-md w-full'>Reset Form</button>
            </form>
        </>
    );
}

export default InternalLoginForm;
