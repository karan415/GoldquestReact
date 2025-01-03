import React, { useMemo } from 'react';

const BulkUploadList = () => {

  const bulkList = useMemo(() => [
    {
      sl: "",
      org_name: "",
      spoc_name: "",
      d_t: "",
      folder: "",
      remarks: "",
    },
  ], []);

 
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-green-500">
              <th className="py-3 px-4 border-b border-r-2 text-white text-left uppercase whitespace-nowrap">Sl No.</th>
              <th className="py-3 px-4 border-b border-r-2 text-white text-left uppercase whitespace-nowrap">Organisation Name</th>
              <th className="py-3 px-4 border-b border-r-2 text-white text-left uppercase whitespace-nowrap">Spoc Name</th>
              <th className="py-3 px-4 border-b border-r-2 text-white text-left uppercase whitespace-nowrap">Date & Time</th>
              <th className="py-3 px-4 border-b border-r-2 text-white text-left uppercase whitespace-nowrap">Folder</th>
              <th className="py-3 px-4 border-b border-r-2 text-white text-left uppercase whitespace-nowrap">Remarks</th>
              <th className="py-3 px-4 border-b text-white text-left uppercase whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {bulkList.length > 0 ? (
              bulkList.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b text-center border-r-2 whitespace-nowrap">{item.sl}</td>
                  <td className="py-2 px-4 border-b whitespace-nowrap border-r-2">{item.org_name}</td>
                  <td className="py-2 px-4 border-b text-center whitespace-nowrap">{item.spoc_name}</td>
                  <td className="py-2 px-4 border-b text-center whitespace-nowrap">{item.d_t}</td>
                  <td className="py-2 px-4 border-b text-center whitespace-nowrap">{item.folder}</td>
                  <td className="py-2 px-4 border-b text-center whitespace-nowrap">{item.remarks}</td>
                  <td className="py-2 px-4 border-b text-center whitespace-nowrap"></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-2 px-4 border-b text-center">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BulkUploadList;
