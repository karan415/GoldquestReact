import React, { useEffect } from 'react';
import active_client from '../Images/Login.jpeg';
import { useNavigate, useLocation } from 'react-router-dom';

import LoginForm from './LoginForm';
import LoginDes from './LoginDes';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {


    const storedAdminData = localStorage.getItem("admin");
    const storedToken = localStorage.getItem("_token");
    let preAdminData;

    try {
      preAdminData = JSON.parse(storedAdminData);
    } catch (e) {
      console.error('Error parsing JSON from localStorage:', e);
      preAdminData = null;
    }

    if (preAdminData || storedToken) {

      navigate('/', { state: { from: location }, replace: true });
      return;
    }
  }, [location, navigate])


  return (
    <div className="bg-cover bg-center flex items-center justify-center md:h-dvh p-4 md:p-14" style={{ backgroundImage: `url(${active_client})` }}>
      <div className="flex flex-col md:flex-row items-center w-full md:w-8/12 bg-slate-50 opacity-90 md:p-6 p-3 rounded-lg shadow-lg">
        <div className="w-full md:w-7/10 flex flex-col p-4">
          <LoginDes />
        </div>
        <div className="w-full md:w-3/10 flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
