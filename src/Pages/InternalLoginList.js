import React, { useContext, useEffect, useMemo, useState } from 'react';

const InternalLoginList = () => {
    const LoginData =useMemo(()=>
        [
            { SL: "01", employeeid: "NA_2423", e_name: "lShruti M ",e_number:'8050410136',email:"support@goldquestglobal.in",role:"	Super_user",status:"Active" },
            { SL: "02", employeeid: "NA_2423", e_name: "lShruti M ",e_number:'8050410136',email:"support@goldquestglobal.in",role:"	Super_user",status:"Active" },
        ],[]
    ) ;
 
  return (
    <>
    <div className="overflow-x-auto py-4 px-4">
    <table className="min-w-full">
        <thead>
            <tr className='bg-green-500'>
                <th className="py-2 px-4 border-b text-left text-white border-r uppercase whitespace-nowrap">SL</th>
                <th className="py-2 px-4 border-b text-left text-white border-r uppercase whitespace-nowrap">Employee ID</th>
                <th className="py-2 px-4 border-b text-left text-white border-r uppercase whitespace-nowrap">Employee Name</th>
                <th className="py-2 px-4 border-b text-left text-white border-r uppercase whitespace-nowrap">Employee Mobile</th>
                <th className="py-2 px-4 border-b text-left text-white border-r uppercase whitespace-nowrap">Email</th>
                <th className="py-2 px-4 border-b text-left text-white border-r uppercase whitespace-nowrap">Role</th>
                <th className="py-2 px-4 border-b text-left text-white border-r uppercase whitespace-nowrap">Status</th>
                <th className="py-2 px-4 border-b text-left text-white border-r uppercase whitespace-nowrap">Action</th>
            </tr>
        </thead>
        <tbody>
            { LoginData.map((item, index) => (
                <tr key={index}>
                    <td className="py-2 px-4 border-b border-r border-l text-center whitespace-nowrap">{item.SL}</td>
                    <td className="py-2 px-4 border-b border-r text-center whitespace-nowrap">{item.employeeid}</td>
                    <td className="py-2 px-4 border-b border-r text-center  whitespace-nowrap">{item.e_name}</td>
                    <td className="py-2 px-4 border-b border-r text-center  whitespace-nowrap">{item.e_number}</td>
                    <td className="py-2 px-4 border-b border-r text-center  whitespace-nowrap">{item.email}</td>
                    <td className="py-2 px-4 border-b border-r text-center  whitespace-nowrap">{item.role}</td>
                    <td className="py-2 px-4 border-b border-r text-center  whitespace-nowrap">{item.status}</td>
                    <td className="py-2 px-4 border-b border-r text-center  whitespace-nowrap"><button className='bg-green-500 hover:bg-green-200 rounded-md p-2 text-white'>Edit</button> <button className='bg-red-600 rounded-md p-2 text-white'>Delete</button> </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
    </>
  )
}

export default InternalLoginList
