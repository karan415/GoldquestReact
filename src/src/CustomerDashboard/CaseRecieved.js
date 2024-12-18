import React from 'react';

const CaseReceived = () => {
  const caseData = [
    {
      no: 1,
      app_id: "GHN23",
      emp_code: "GHF22",
      emp_name: "Manjunath",
    },
  ];

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="font-bold text-2xl pb-6 w-full text-center uppercase">
        Case Received
      </h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className='bg-green-500'>
            <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase" scope="col">No</th>
            <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase" scope="col">Application ID</th>
            <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase" scope="col">Employee Code</th>
            <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase" scope="col">Employee Name</th>
          </tr>
        </thead>
        <tbody>
          {caseData.map((item) => (
            <tr key={item.app_id}>
              <td className="py-3 px-4 border-b text-green-600 whitespace-nowrap">{item.no}</td>
              <td className="py-3 px-4 border-b whitespace-nowrap">{item.app_id}</td>
              <td className="py-3 px-4 border-b whitespace-nowrap">{item.emp_code}</td>
              <td className="py-3 px-4 border-b whitespace-nowrap">{item.emp_name.trim()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaseReceived;
