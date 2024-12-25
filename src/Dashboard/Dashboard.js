
import React from "react";
import Main from './Main'
import bg_img from '../Images/login-bg-img.png';

const Dashboard = () => {
  return (
    <>
      {/* <Main/> */}
      <div className=" h-screen flex items-center flex-wrap justify-center">
        <div className=" bg-white w-8/12 m-auto  rounded-md p-7 shadow-lg">
        <h2 className="text-center pb-8 font-bold text-3xl w-full">Welcome To DashBoard</h2>

        <img
              src={bg_img}
              alt="Logo"
              className="w-7/12 m-auto"
            />
            </div>
      </div>
    </>
  )
};

export default Dashboard;
