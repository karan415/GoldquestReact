import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';
import logo from '../Images/Logo.png'
import bg_img from '../Images/login-bg-img.png';

const LoginForm = () => {
  const [input, setInput] = useState({
    username: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false); // State for OTP modal
  const [isOtpLoading, setIsOtpLoading] = useState(false); // State for OTP button
  const API_URL = useApi();
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const location = useLocation();


  const handleChange = (event) => {
    const { name, value } = event.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const validateError = () => {
    const newErrors = {};
    if (!input.username) newErrors.username = 'This is Required';
    if (!input.password) newErrors.password = 'This is Required';
    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = validateError();
  
    if (Object.keys(errors).length === 0) {
      setLoading(true); // Show loading indicator
  
      const loginData = {
        username: input.username,
        password: input.password,
      };
  
      const swalInstance = Swal.fire({
        title: 'Processing...',
        text: 'Please wait while we have Loged you in',
        didOpen: () => {
            Swal.showLoading(); // This starts the loading spinner
        },
        allowOutsideClick: false, // Prevent closing Swal while processing
        showConfirmButton: false, // Hide the confirm button
    });
  
      axios
        .post(`${API_URL}/admin/login`, loginData)
        .then((response) => {
          const result = response.data;
  
          // Handle the API message
          if (!result.status) {
            Swal.fire({
              title: "Error!",
              text: result.message || "An error occurred",
              icon: "error",
              confirmButtonText: "Ok",
            });
          } else {
            // Handle success cases
            if (result.message === "OTP sent successfully.") {
              Swal.fire({
                title: "OTP Sent!",
                text: "Please check your email for the OTP to proceed with the login.",
                icon: "info",
                confirmButtonText: "Ok",
              }).then(() => {
                setShowOtpModal(true); // Show OTP modal
              });
            } else {
              handleLoginSuccess(result);
            }
          }
  
          // Handle token storage
          const newToken = result._token || result.token;
          if (newToken) {
            localStorage.setItem("_token", newToken);
          }
  
          // Handle session expiration
          if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
            Swal.fire({
              title: "Session Expired",
              text: "Your session has expired. Please log in again.",
              icon: "warning",
              confirmButtonText: "Ok",
            }).then(() => {
              // Redirect to admin login page
              window.location.href = "/admin-login"; // Replace with your login route
            });
          }
        })
        .catch((error) => {
          // Display API or Network error message
          const errorMessage =
            error.response?.data?.message || error.message || "An unexpected error occurred";
          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "Ok",
          });
        })
        .finally(() => {
          swalInstance.close();
          setLoading(false); // Stop loading indicator
        });
    } else {
      setError(errors); // Display validation errors
    }
  };
  


  const handleLoginSuccess = (result) => {
    const adminData = result.adminData;
    const _token = result.token;

    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('_token', _token);

    Swal.fire({
      title: 'Success',
      text: 'Login Successful',
      icon: 'success',
      confirmButtonText: 'Ok',
    });

    navigate('', { state: { from: location }, replace: true });
  };

  const handleOtpSubmit = () => {
    setIsOtpLoading(true);

    axios
      .post(`${API_URL}/admin/verify-two-factor`, {
        username: input.username,
        otp,
      })
      .then((response) => {
        const result = response.data;
        if (!result.status) {
          Swal.fire({
            title: 'Error!',
            text: result.message,
            icon: 'error',
            confirmButtonText: 'Ok',
          });
        } else {
          setShowOtpModal(false); // Hide OTP modal
          handleLoginSuccess(result); // Handle success response
        }
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error!',
          text: `Error: ${error.response?.data?.message || error.message}`,
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      })
      .finally(() => {
        setIsOtpLoading(false);
      });
  };

  const goToForgotPassword = () => {
    navigate('/ForgotPassword');
  };

  return (
    <>

      <div className="md:bg-[#f9f9f9] h-screen flex items-end justify-center">
        <div className="md:flex  bg-white w-10/12 m-auto rounded-md">
          <div className="md:w-7/12 w-full">
            <img
              src={bg_img}
              alt="Logo"
              className=""
            />
          </div>

          <div className="md:w-5/12 flex  justify-center  md:mt-0 mt-10">
            <div className="w-full max-w-xl md:p-8">

              <div className="flex flex-col items-center mb-3 md:mb-12">
                <img
                  src={logo}
                  alt="Logo"
                  className="mb-4 lg:h-[150px] md:h-[160px] w-6/12 m-auto md:w-auto logo_img"
                />
                <h2 className="text-[18px] text-center font-bold text-[#24245a]">
                  Building Trust - One Check At A Time
                </h2>
              </div>

              <h2 className="text-xl font-semibold text-center text-[#24245a] mb-6 md:text-2xl">
                Login Account
              </h2>
              <form className="mt-8" onSubmit={handleSubmit}>
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full px-4 py-4 border-l-[6px] bg-[#f9f9f9] border-[#24245a] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="username"
                    onChange={handleChange}
                    value={input.username}
                    name="username"
                  />
                  {error.username && <p className="text-red-500">{error.username}</p>}
                </div>
                <div className="mb-10">
                  <input
                    className="w-full px-4 py-4 border-l-[6px]  bg-[#f9f9f9]  border-[#24245a] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="password"
                    type="password"
                    name="password"
                    value={input.password}
                    onChange={handleChange}
                    placeholder="Password"
                  />
                  {error.password && <p className="text-red-500">{error.password}</p>}
                </div>
                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 " />
                    Remember me
                  </label>
                  <div onClick={goToForgotPassword}>
                    <a href="#" className="text-red-500 hover:underline text-sm">
                      Forgot Password?
                    </a>
                  </div>
                </div>
                <button
                  type={showOtpModal ? "button" : "submit"}
                  className="w-full bg-[#24245a] hover:bg-[#24245a] xxl:py-5 text-white font-semibold py-2 md:py-3 px-4 signinbtn rounded-full text-xl tracking-widest"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
                {showOtpModal && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-96">
                      <h3 className="text-xl font-bold mb-4">Enter OTP</h3>
                      <input
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button
                        type='submit'
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${isOtpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleOtpSubmit}
                        disabled={isOtpLoading}
                      >
                        {isOtpLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>
      </div>

    </>

  );
};

export default LoginForm;
