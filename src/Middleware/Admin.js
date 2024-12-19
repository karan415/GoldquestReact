import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LoaderContext } from '../LoaderContext';
import Loader from '../Loader'
import { useApi } from '../ApiContext';
import Swal from 'sweetalert2';
const Admin = ({ children }) => {


  const { loading, setLoading } = useContext(LoaderContext);
  const API_URL = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      const storedAdminData = localStorage.getItem("admin");
      const storedToken = localStorage.getItem("_token");
  
      if (!storedAdminData || !storedToken) {
        localStorage.clear();
        redirectToLogin();
        return;
      }
  
      let adminData;
      try {
        adminData = JSON.parse(storedAdminData);
      } catch (error) {
        console.error('Error parsing JSON from localStorage:', error);
        Swal.fire({
          title: 'Authentication Error',
          text: 'Error parsing admin data from localStorage.',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        redirectToLogin();
        return;
      }
  
      try {
        const response = await axios.post(`${API_URL}/admin/verify-admin-login`, {
          admin_id: adminData.id,
          _token: storedToken,
        });
  
        if (response.data.status) {
          setLoading(false);
        } else {
          console.error('Login verification failed:', response.data.message || 'Unknown error');
          Swal.fire({
            title: 'Login Verification Failed',
            text: response.data.message || 'An unknown error occurred during verification.',
            icon: 'error',
            confirmButtonText: 'Ok'
          });
          localStorage.clear();
          redirectToLogin(response.data.message);
        }
      } catch (error) {
        console.error('Error validating login:', error.response?.data?.message || error.message);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Error validating login',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        localStorage.clear();
        redirectToLogin(error.response?.data?.message || 'Error validating login');
      }
    };
  
    const redirectToLogin = (errorMessage) => {
      localStorage.clear();
      navigate('/admin-login', { state: { from: location, errorMessage }, replace: true });
    };
  
    checkAuthentication();
  }, [navigate, setLoading, location]);
  

  if (loading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return children;
};

export default Admin;
