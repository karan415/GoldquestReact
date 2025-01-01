import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LoaderContext } from '../LoaderContext';
import Loader from '../Loader'
import { useApi } from '../ApiContext';
import Swal from 'sweetalert2';
const Customer = ({ children }) => {
  const { loading, setLoading } = useContext(LoaderContext);
  const API_URL=useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const branchEmail = JSON.parse(localStorage.getItem("branch"))?.email;
console.log('branchEmail',branchEmail)
  useEffect(() => {
    const checkAuthentication = async () => {
      const storedAdminData = localStorage.getItem("branch");
      const storedToken = localStorage.getItem("branch_token");
  
      if (!storedAdminData || !storedToken) {
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
        const response = await axios.post(`${API_URL}/branch/verify-branch-login`, {
          branch_id: adminData.id,
          _token: storedToken,
        });
  
        if (response.data.status) {
          setLoading(false);
        } else {
          // If the response indicates session is expired, redirect to login
          if (response.data.message && response.data.message.toLowerCase().includes("invalid") && response.data.message.toLowerCase().includes("token")) {
            handleSessionExpired();
          } else {
            localStorage.clear();
            redirectToLogin();
          }
        }
      } catch (error) {
        console.error('Error validating login:', error);
        localStorage.clear();
        redirectToLogin();
      }
    };
  
    const redirectToLogin = () => {
      navigate(`/customer-login?email=${encodeURIComponent(branchEmail)}`);
    };
  
    const handleSessionExpired = () => {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "warning",
        confirmButtonText: "Ok",
      }).then(() => {
        // Redirect to the customer login page with the email address
        window.open(`/customer-login?email=${encodeURIComponent(branchEmail)}`);
      });
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

export default Customer;
