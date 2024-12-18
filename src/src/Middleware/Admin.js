import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LoaderContext } from '../LoaderContext';
import Loader from '../Loader'
import { useApi } from '../ApiContext';
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
          localStorage.clear();
          redirectToLogin();
        }
      } catch (error) {
        console.error('Error validating login:', error);
        localStorage.clear();
        redirectToLogin();
      }
    };

    const redirectToLogin = () => {
      localStorage.clear();
      navigate('/admin-login', { state: { from: location }, replace: true });
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
