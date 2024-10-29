import React, { useState } from 'react';
import Swal from 'sweetalert2';

const CustomerUpdatePassword = () => {
    const [newPass, setNewPass] = useState({
        newpass: '',
        c_newpass: '',
    });
    const [passError, setPassError] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;
        setNewPass((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (passError[name]) {
            setPassError((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const errors = {};
        if (!newPass.newpass) errors.newpass = 'New password is required';
        if (!newPass.c_newpass) errors.c_newpass = 'Confirmation password is required';
        else if (newPass.c_newpass !== newPass.newpass) errors.c_newpass = 'Passwords do not match';
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validate();

        if (Object.keys(errors).length === 0) {
            const storedBranchData = JSON.parse(localStorage.getItem("branch") || '{}')?.id;
            const branch_token = localStorage.getItem("branch_token");

            if (!storedBranchData || !branch_token) {
                console.error('Branch data or token is missing');
                Swal.fire({
                    title: 'Error',
                    text: 'Branch data or token is missing',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                new_password: newPass.newpass,
                branch_id: storedBranchData,
                _token: branch_token,
            });

            const requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            fetch("https://octopus-app-www87.ondigitalocean.app/branch/update-password", requestOptions)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((result) => {
                    console.log(result);
                    // Clear form and errors on successful update
                    Swal.fire({
                        title: 'Success',
                        text: result.message || 'Password updated successfully',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                    setNewPass({ newpass: '', c_newpass: '' });
                    setPassError({});
                })
                .catch((error) => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error',
                        text: error.message || 'Something went wrong, please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                });
        } else {
            setPassError(errors);
        }
    };

    return (
        <form className='mt-4 w-6/12 m-auto' onSubmit={handleSubmit}>
            <div className="mb-6 text-left">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newpass">New Password</label>
                <input
                    type="password"
                    name="newpass"
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="newpassword"
                    placeholder='********'
                    onChange={handleChange}
                    value={newPass.newpass}
                />
                {passError.newpass && <p className='text-red-500'>{passError.newpass}</p>}
            </div>
            <div className="mb-6 text-left">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="c_newpass">Confirm New Password</label>
                <input
                    type="password"
                    name="c_newpass"
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="confirmnewpassword"
                    placeholder='********'
                    onChange={handleChange}
                    value={newPass.c_newpass}
                />
                {passError.c_newpass && <p className='text-red-500'>{passError.c_newpass}</p>}
            </div>
            <button type="submit" className='bg-green-400 text-white p-3 rounded-md w-full mb-4 hover:bg-green-200'>Update Password</button>
        </form>
    );
};

export default CustomerUpdatePassword;