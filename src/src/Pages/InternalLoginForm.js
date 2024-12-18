import React, { useState } from 'react';

const InternalLoginForm = () => {
    const [data, setData] = useState({
        id: "",
        name: "",
        number: "",
        email: "",
        password: "",
        role: "",
    });
    const [error, setError] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;
        setData((prev) => ({
            ...prev, [name]: value,
        }));
    };

    const Validate = () => {
        const errors = {};
        if (!data.id) errors.id = 'This field is required';
        if (!data.name) errors.name = 'This field is required';
        if (!data.number) errors.number = 'This field is required';
        else if (data.number.length !== 10) errors.number = 'Number must be 10 characters';
        if (!data.email) errors.email = 'This field is required';
        if (!data.password) errors.password = 'This field is required';
        else if (data.password.length < 8 || data.password.length > 15) errors.password = 'Password must be 8 to 15 characters';
        if (!data.role) errors.role = 'This field is required';
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validateError = Validate();
        if (Object.keys(validateError).length === 0) {
           
            setError({});
        } else {
            setError(validateError);
        }
    };

    return (
        <>
            <form action="" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="employee_id">Employee ID: *</label>
                    <input
                        type="text"
                        name="id"
                        id="employee_id"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={data.id}
                    />
                    {error.id && <p className='text-red-500'>{error.id}</p>}
                </div>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="Employee-name">Employee Name: *</label>
                    <input
                        type="text"
                        name="name"
                        id="Employee-name"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={data.name}
                    />
                    {error.name && <p className='text-red-500'>{error.name}</p>}
                </div>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="mobile-number">Employee Mobile: *</label>
                    <input
                        type="number"
                        name="number"
                        id="mobile-number"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={data.number}
                    />
                    {error.number && <p className='text-red-500'>{error.number}</p>}
                </div>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="emailid">Email: *</label>
                    <input
                        type="email"
                        name="email"
                        id="emailid"
                        className="border w-full rounded-md p-2 mt-2"
                        onChange={handleChange}
                        value={data.email}
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
                        value={data.password}
                    />
                    {error.password && <p className='text-red-500'>{error.password}</p>}
                </div>
                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="role">Role: *</label>
                    <select
                        name="role"
                        id="role"
                        className="w-full border p-2 rounded-md mt-2"
                        onChange={handleChange}
                        value={data.role}
                    >
                        <option value="">Select a role</option>
                        <option value="Admin">Admin</option>
                        <option value="Super User">Super User</option>
                        <option value="User">User</option>
                    </select>
                    {error.role && <p className='text-red-500'>{error.role}</p>}
                </div>
                <button type="submit" className='bg-green-400 hover:bg-green-200 text-white p-3 rounded-md w-full'>Send</button>
            </form>
        </>
    );
}

export default InternalLoginForm;
