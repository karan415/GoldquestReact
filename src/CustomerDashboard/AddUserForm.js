import { React, useState } from 'react'

const AddUserForm = () => {
    const [newPass, setNewPass] = useState({
        email: '',
        pass: '',
        c_pass: '',
    });
    const [passError, sePassError] = useState({});
    const handleChange = (event) => {
        const { name, value } = event.target;
        setNewPass((prev) => ({
            ...prev, [name]: value,
        }));

    };

    const validate = () => {
        const NewErr = {};
        if (!newPass.email) { NewErr.email = 'This is Required' }
        if (!newPass.pass) { NewErr.pass = 'This is Required' }
        if (!newPass.c_pass) { NewErr.c_pass = 'This is Required' }
        else if (newPass.c_pass !== newPass.pass) { NewErr.c_pass = 'Password does not match' }
        return NewErr;

    }
    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length === 0) {
            console.log(newPass);
            sePassError({});
        }
        else {
            sePassError(errors);
        }

    }
    return (
        <>
            <form action="" className='mt-4' onSubmit={handleSubmit}>
                <div className="mb-6 text-left">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">User Email</label>
                    <input type="email" name="email" className=" appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="AddUserEmail" placeholder='********' onChange={handleChange} value={newPass.email} />
                    {passError.email && <p className='text-red-500'>{passError.email}</p>}
                </div>
                <div className="mb-6 text-left">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                    <input type="password" name="pass" className=" appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="AddUserPassword" placeholder='********' onChange={handleChange} value={newPass.pass} />
                    {passError.pass && <p className='text-red-500'>{passError.pass}</p>}
                </div>
                <div className="mb-6 text-left">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Confirm Password</label>
                    <input type="password" name="c_pass" className=" appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="AddUserConfirmPassword" placeholder='********' onChange={handleChange} value={newPass.c_pass} />
                    {passError.c_pass && <p className='text-red-500'>{passError.c_pass}</p>}
                </div>
                <button type="submit" className='bg-green-400 text-white p-3 rounded-md w-full mb-4 hover:bg-green-200'>Create SubUser</button>

            </form>
        </>
    )
}

export default AddUserForm