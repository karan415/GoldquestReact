import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';

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
  const [message] = useState('');
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
      setLoading(true);

      const loginData = {
        username: input.username,
        password: input.password,
      };

      axios.post(`${API_URL}/admin/login`, loginData)
        .then((response) => {
          const result = response.data;
          if (!result.status) {
            Swal.fire({
              title: 'Error!',
              text: `An error occurred: ${result.message}`,
              icon: 'error',
              confirmButtonText: 'Ok',
            });
          } else {
            if (result.message === 'OTP sent successfully.') {
              setShowOtpModal(true); // Show OTP modal
            } else {
              handleLoginSuccess(result);
            }
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
          setLoading(false);
        });
    } else {
      setError(errors);
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

    navigate('/', { state: { from: location }, replace: true });
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
    <div className="bg-transparent md:p-8 p-3 rounded-md shadow-md w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
            onChange={handleChange}
            value={input.username}
            name="username"
          />
          {error.username && <p className="text-red-500">{error.username}</p>}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            name="password"
            value={input.password}
            onChange={handleChange}
            placeholder="******************"
          />
          {error.password && <p className="text-red-500">{error.password}</p>}
        </div>
        <button
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* OTP Modal */}
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
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${isOtpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleOtpSubmit}
              disabled={isOtpLoading}
            >
              {isOtpLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
