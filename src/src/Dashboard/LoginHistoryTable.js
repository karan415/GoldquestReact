import React from 'react';
import { RiLoginCircleFill } from "react-icons/ri";

const LoginHistoryTable = () => {
  const loginHistory = [
    { date: "22-04-2020", email: "manjunath@goldquestglobal.in" },
    { date: "22-04-2020", email: "manjunath@goldquestglobal.in" },
    { date: "22-04-2020", email: "manjunath@goldquestglobal.in" },
    { date: "22-04-2020", email: "manjunath@goldquestglobal.in" },
    { date: "22-04-2020", email: "manjunath@goldquestglobal.in" },
    { date: "22-04-2020", email: "manjunath@goldquestglobal.in" },
  ];

  return (
    <div className="overflow-x-auto py-7 px-2">
      <h2 className='text-sky-600 font-bold text-2xl flex items-center gap-4'>
        <RiLoginCircleFill className='text-4xl' />
        Login History
      </h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-3 px-2 border-b text-left whitespace-nowrap">Date</th>
            <th className="py-3 px-2 border-b text-right whitespace-nowrap">Email</th>
          </tr>
        </thead>
        <tbody>
          {loginHistory.map((login, index) => (
            <tr key={index}>
              <td className="py-3 px-2 border-b whitespace-nowrap">{login.date}</td>
              <td className="py-3 px-2 border-b text-right whitespace-nowrap">{login.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LoginHistoryTable;
