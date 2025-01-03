import { React, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CustomerForgotPassword = () => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
  });



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev, [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email: formData.email,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://147.93.29.154:5000/branch/forgot-password-request", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((result) => {
        Swal.fire({
          title: 'Success',
          text: result.message,
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          // Navigate to the customer login page after clicking OK
          navigate('/customer-login');
        });
      })
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div className="bg-white md:w-5/12 m-auto shadow-md rounded-sm p-5 translate-y-2/4">
      <h2 className='md:text-4xl text-2xl font-bold pb-8 md:pb-4'>Forgot Password?</h2>
      <p>We'll Send You Reset Instructions.</p>
      <form onSubmit={handleSubmit} className='mt-9 mb-9'>
        <div className="mb-4">
          <label htmlFor="email" className='d-block'>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            className='outline-none p-3 border mt-3 w-full rounded-md'
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <button type='submit' className='bg-green-400 text-white hover:bg-green-200 p-3 rounded-md w-full inline-block text-center'>
          Reset Password
        </button>
      </form>
      <span className='flex justify-center items-center gap-4 text-blue-400'>
        <FaArrowLeft />
        <Link to='/customerlogin'>Back to Login</Link>
      </span>
    </div>
  );
};

export default CustomerForgotPassword;
