import React from 'react';
import { RiLoginCircleFill } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { useApi } from '../ApiContext';
import Swal from 'sweetalert2';
const Logout = () => {

  const API_URL = useApi();
  const navigate = useNavigate();
  const handleLogout = async () => {
    const storedAdminData = localStorage.getItem("admin");
    const storedToken = localStorage.getItem("_token");
    Swal.fire({
      title: 'Processing...',
      text: 'Please wait while we log you out.',
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      const response = await fetch(`${API_URL}/admin/logout?admin_id=${JSON.parse(storedAdminData)?.id}&_token=${storedToken}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      localStorage.removeItem("admin");
      localStorage.removeItem("_token");


      navigate('/admin-login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button onClick={handleLogout} className='flex gap-1 items-center text-white ms-2 mt-3 md:mt-0'>
      <RiLoginCircleFill className="h-6 w-6 mr-1 text-white-600" />
      Logout
    </button>
  );
};

export default Logout;
