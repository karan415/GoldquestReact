import React from "react";
import Logout from "./Logout";
const Header = () => {
  const admin = JSON.parse(localStorage.getItem("admin"))?.name;
  return (
    <header className="p-4 md:p-6 flex flex-wrap flex-col-reverse md:flex-row items-center justify-between bg-white shadow-lg ">
      
      <p className=" whitespace-nowrap font-bold capitalize ">Hi,  {admin}</p>
      <Logout/>
   
    </header>
  );
};

export default Header;
