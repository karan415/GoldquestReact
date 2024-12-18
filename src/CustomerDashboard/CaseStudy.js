import React from 'react';

const CaseStudy = () => {
  const cases = [
    {
      title: "CASE RECEIVED",
      numberofcase: 9,
    },
    {
      title: "INSUFFICIENCY",
      numberofcase: 1,
    },
    {
      title: "REPORTS OUT OF TAT",
      numberofcase: 1,
    },
  ];

  return (
    <div className="grid md:grid-cols-6 grid-cols-2 gap-y-5 gap-x-6">
      {cases.map((curElm) => (
        <div key={curElm.title} className="bg-white text-center shadow-md rounded-lg py-6 p-2">
          <span className='font-bold bg-green-500 p-5 w-8 h-8 flex justify-center items-center mb-3 text-white m-auto rounded-full'>
            {curElm.numberofcase}
          </span>
          <h4 className='text-lg font-semibold pb-4'>{curElm.title}</h4>
        </div>
      ))}
    </div>
  );
};

export default CaseStudy;
