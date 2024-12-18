import React from 'react'

const Insufficiency = () => {
  const insufData = [
    {
      no: 1,
      app_id: "GHN23",
      emp_code: "GHF22",
      emp_name: "  Manjunath"
    },
    {
      no: 2,
      app_id: "GHN23",
      emp_code: "GHF22",
      emp_name: "  Manjunath"
    },
    {
      no: 3,
      app_id: "GHN23",
      emp_code: "GHF22",
      emp_name: "  Manjunath"
    },
    {
      no: 4,
      app_id: "GHN23",
      emp_code: "GHF22",
      emp_name: "  Manjunath"
    },
    {
      no: 5,
      app_id: "GHN23",
      emp_code: "GHF22",
      emp_name: "  Manjunath"
    },
    {
      no: 6,
      app_id: "GHN23",
      emp_code: "GHF22",
      emp_name: "  Manjunath"
    },
  ];
  return (
    <>
    <div className="overflow-x-auto  p-4">
    <h2 className="font-bold text-2xl pb-6 w-full text-center uppercase">
      INSUFFICIENCY
    </h2>
    <table className="min-w-full bg-white border">
      <thead>
        <tr className='bg-green-500'>
          <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase">No</th>
          <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase">Application id</th>
          <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase">Employee code</th>
          <th className="py-3 px-4 border-b text-left border-r-2 text-white whitespace-nowrap uppercase">Employee name</th>
        </tr>
      </thead>
      <tbody>
        {insufData.map((item, index) => (
          <tr key={index}>
            <td className="py-3 px-4 border-b text-green-600 whitespace-nowrap">{item.no}</td>
            <td className="py-3 px-4 border-b whitespace-nowrap">{item.app_id}</td>
            <td className="py-3 px-4 border-b whitespace-nowrap">{item.emp_code}</td>
            <td className="py-3 px-4 border-b whitespace-nowrap">{item.emp_name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

    </>
  )
}

export default Insufficiency