import React from 'react';
import { FaTable } from "react-icons/fa";

const TatDelayTable = () => {
  const tatData = [
    { sl: "01", tatDays: "12", initiationDate: "NA", applicationId: "GQ-NTIPL-667", employeeName: "Mohammed Zeeshanulla", exceedDays: "-201" },
    { sl: "02", tatDays: "12", initiationDate: "NA", applicationId: "GQ-NTIPL-667", employeeName: "Mohammed Zeeshanulla", exceedDays: "-201" },
    { sl: "03", tatDays: "12", initiationDate: "NA", applicationId: "GQ-NTIPL-667", employeeName: "Mohammed Zeeshanulla", exceedDays: "-201" },
    { sl: "04", tatDays: "12", initiationDate: "NA", applicationId: "GQ-NTIPL-667", employeeName: "Mohammed Zeeshanulla", exceedDays: "-201" },
    { sl: "05", tatDays: "12", initiationDate: "NA", applicationId: "GQ-NTIPL-667", employeeName: "Mohammed Zeeshanulla", exceedDays: "-201" },
    { sl: "06", tatDays: "12", initiationDate: "NA", applicationId: "GQ-NTIPL-667", employeeName: "Mohammed Zeeshanulla", exceedDays: "-201" }

  ];

  return (
    <>
      <div className="overflow-x-auto py-6 px-4">
        <h2 className='text-sky-600 font-bold text-2xl pb-5 flex items-center gap-4'>
          <FaTable />
          Tat Delay Table
        </h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">SL</th>
              <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Tat Days</th>
              <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Initiation Date</th>
              <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Application Id</th>
              <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Employee Name</th>
              <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Exceed Days</th>
            </tr>
          </thead>
          <tbody>
            {tatData.map((item, index) => (
              <tr key={index}>
                <td className="py-3 px-4 border-b whitespace-nowrap">{item.sl}</td>
                <td className="py-3 px-4 border-b text-center whitespace-nowrap">{item.tatDays}</td>
                <td className="py-3 px-4 border-b text-center whitespace-nowrap">{item.initiationDate}</td>
                <td className="py-3 px-4 border-b whitespace-nowrap">{item.applicationId}</td>
                <td className="py-3 px-4 border-b whitespace-nowrap">{item.employeeName}</td>
                <td className="py-3 px-4 border-b text-center whitespace-nowrap">{item.exceedDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default TatDelayTable;
