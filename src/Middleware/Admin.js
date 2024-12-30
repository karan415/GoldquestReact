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
        redirectToLogin("No active session found. Please log in again.");
        return;
      }
  
      let adminData;
      try {
        adminData = JSON.parse(storedAdminData);
      } catch (error) {
        console.error("Error parsing JSON from localStorage:", error);
        Swal.fire({
          title: "Authentication Error",
          text: "Error parsing admin data from localStorage.",
          icon: "error",
          confirmButtonText: "Ok",
        }).then(() => redirectToLogin());
        return;
      }
  
      try {
        const response = await axios.post(`${API_URL}/admin/verify-admin-login`, {
          admin_id: adminData.id,
          _token: storedToken,
        });
  
        const responseData = response.data;
  
        if (responseData.status) {
          setLoading(false);
        } else {

          if (responseData.message && responseData.message.toLowerCase().includes("invalid") && responseData.message.toLowerCase().includes("token")) {
            Swal.fire({
              title: "Session Expired",
              text: "Your session has expired. Please log in again.",
              icon: "warning",
              confirmButtonText: "Ok",
            }).then(() => redirectToLogin("Session expired"));
            return;
          }
          
          Swal.fire({
            title: "Login Verification Failed",
            text: responseData.message || "An unknown error occurred during verification.",
            icon: "error",
            confirmButtonText: "Ok",
          }).then(() => redirectToLogin(responseData.message));
        }
      } catch (error) {
        console.error("Error validating login:", error.response?.data?.message || error.message);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Error validating login.",
          icon: "error",
          confirmButtonText: "Ok",
        }).then(() => redirectToLogin(error.response?.data?.message || "Error validating login."));
      }
    };
  
    const redirectToLogin = (errorMessage = "Please log in again.") => {
      localStorage.clear();
      navigate("/admin-login", { state: { from: location, errorMessage }, replace: true });
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
