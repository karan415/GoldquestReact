import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';
const LoginForm = () => {
  const [input, setInput] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const API_URL = useApi();
  const [message,] = useState('');
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
      setLoading(true); // Start loading

      const loginData = {
        username: input.username,
        password: input.password,
      };

      axios.post(`${API_URL}/admin/login`, loginData)
        .then((response) => {
          if (!response.data.status) {
            Swal.fire({
              title: 'Error!',
              text: `An error occurred: ${response.data.message}`,
              icon: 'error',
              confirmButtonText: 'Ok'
            });
            const newToken = response._token || response.token;
            if (newToken) {
              localStorage.setItem("_token", newToken);
            }
          } else {

            const adminData = response.data.adminData;
            const _token = response.data.token;

            localStorage.setItem('admin', JSON.stringify(adminData));
            localStorage.setItem('_token', _token);
            Swal.fire({
              title: "Success",
              text: 'Login Successfull',
              icon: "success",
              confirmButtonText: "Ok"
            })


            navigate('/', { state: { from: location }, replace: true });
            setError({});
          }
        })
        .catch((error) => {
          Swal.fire({
            title: 'Error!',
            text: `Error: ${error.response?.data?.message || error.message}`,
            icon: 'error',
            confirmButtonText: 'Ok'
          });
          console.error('Login failed:', error); // Log the error details
        })
        .finally(() => {
          setLoading(false); // Stop loading
        });
    } else {
      setError(errors);
    }
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
        <div className="flex items-center justify-between mb-4">
          <label className="block text-gray-700 text-sm font-bold">
            <input className="mr-2 leading-tight" type="checkbox" />
            <span className="text-sm">Remember me</span>
          </label>
          <button
            type="button"
            className="inline-block align-baseline font-bold text-sm text-red-500 hover:text-blue-800"
            onClick={() => alert('Forgot Password functionality is not yet implemented.')}
          >
            Forgot Password?
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
      <div className="text-center my-4">
        <p className="text-sm">
          Don't have an account?
          <button
            type="button"
            className="text-red-500 hover:text-blue-800 font-bold"
            onClick={() => alert('Sign up functionality is not yet implemented.')}
          >
            Sign up
          </button>
        </p>
      </div>
    
     
      {message && <p className="text-red-500 text-center mt-4">{message}</p>}
    </div>
  );
};

export default LoginForm;