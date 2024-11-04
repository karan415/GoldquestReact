import React, {  useMemo } from 'react';
const CreateSubUserList = () => {

    const userList=useMemo(()=>[
        {
         sl:1,
         Username:"info@rightpick.co.in"
        },
    ],[]);
   

    return (
        <>
       
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className='bg-green-500'>
                        <th className="py-3 px-4 border-b  border-r-2 text-white  text-left uppercase whitespace-nowrap">Sl No.</th>
                        <th className="py-3 px-4 border-b text-white  border-r-2 text-left uppercase whitespace-nowrap">username</th>
                        <th className="py-3 px-4 border-b  text-white  text-left uppercase whitespace-nowrap">action</th>

                    </tr>
                </thead>
                <tbody>
                    {userList.map((item, index) => (
                        <tr key={index}>
                            <td className="py-2 px-4 border-b text-center border-r-2 whitespace-nowrap">{item.sl}</td>
                            <td className="py-2 px-4 border-b whitespace-nowrap  border-r-2">{item.Username}</td>
                            <td className="py-2 px-4 border-b text-center whitespace-nowrap"><button className='bg-green-500 rounded-md p-3 text-white'>Edit</button></td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    )
}

export default CreateSubUserList