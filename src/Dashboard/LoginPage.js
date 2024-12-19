import React from "react";
import logo from '../Images/Logo.png'
import bg_img from '../Images/login-bg-img.png'
const LoginPage = () => {

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
          <form className="mt-8"> 
            <div className="mb-6">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-4 border-l-[6px] bg-[#f9f9f9] border-[#24245a] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-10">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-4 border-l-[6px]  bg-[#f9f9f9]  border-[#24245a] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 " />
                Remember me
              </label>
              <a href="#" className="text-red-500 hover:underline text-sm">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-[#24245a] hover:bg-[#24245a] xxl:py-5 text-white font-semibold py-2 md:py-3 px-4 signinbtn rounded-full text-xl tracking-widest"
            >
              SIGN IN
            </button>
            
          </form>
        </div>
      </div>
    </div>
    </div>
    </>
  );
};

export default LoginPage;
