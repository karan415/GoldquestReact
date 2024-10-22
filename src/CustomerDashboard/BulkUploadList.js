import React, { useContext, useEffect, useState, useMemo } from 'react';
import PaginationContext from '../Pages/PaginationContext';
import Pagination from '../Pages/Pagination';

const BulkUploadList = () => {
  const { currentItem, showPerPage, setTotalResults } = useContext(PaginationContext);

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

  const [paginated, setPaginated] = useState([]);

  useEffect(() => {
    setTotalResults(bulkList.length);
    const startIndex = (currentItem - 1) * showPerPage;
    const endIndex = startIndex + showPerPage;
    setPaginated(bulkList.slice(startIndex, endIndex));
  }, [currentItem, setTotalResults, bulkList, showPerPage]);

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
            {paginated.length > 0 ? (
              paginated.map((item, index) => (
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
      <Pagination />
    </>
  );
};

export default BulkUploadList;
