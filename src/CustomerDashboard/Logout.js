import React from 'react';
import { RiLoginCircleFill } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();


    const handleLogout = async () => {
        const storedBranchData = localStorage.getItem("branch");
        const storedToken = localStorage.getItem("branch_token");

        try {
            const response = await fetch(`https://goldquestreact.onrender.com/branch/logout?branch_id=${JSON.parse(storedBranchData)?.id}&_token=${storedToken}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }


            localStorage.removeItem("admin");
            localStorage.removeItem("_token");


            navigate('/customer-login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <button onClick={handleLogout} className='flex gap-2 items-center ms-2'>
            <RiLoginCircleFill className="h-6 w-6 mr-3 text-gray-600" />
            Logout
        </button>
    );
};

export default Logout;
