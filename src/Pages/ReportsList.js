import React, { useEffect, useRef, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import PulseLoader from 'react-spinners/PulseLoader';
const ReportsList = () => {
  const [expandedRows, setExpandedRows] = useState({}); // State to track expanded rows
  const [filters, setFilters] = useState({
    reportgenerateby: "", // Updated key for report generator
    date: "",
    month: "",
    qc_status: "",
  });


  const tableRef = useRef(null); // Ref for the table container

  // Function to reset expanded rows
  const handleOutsideClick = (event) => {
    if (tableRef.current && !tableRef.current.contains(event.target)) {
      setExpandedRows({}); // Reset to empty object instead of null
    }
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);



  const [loading, setLoading] = useState(false);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]); // Original data
  const [filteredData, setFilteredData] = useState([]); // Filtered data

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };




  useEffect(() => {
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id || "";
    const storedToken = localStorage.getItem("_token") || "";
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    setLoading(true); // Start loading before the fetch request

    fetch(
      `https://goldquestreact.onrender.com/report-summary/report-tracker?admin_id=${admin_id}&_token=${storedToken}`,
      requestOptions
    )
      .then((response) => {
        const result = response.json();
        const newToken = result._token || result.token;
        if (newToken) {
          localStorage.setItem("_token", newToken);
        }
        if (!response.ok) {
          return response.text().then(text => {
            const errorData = JSON.parse(text);
            Swal.fire(
              'Error!',
              `An error occurred: ${errorData.message}`,
              'error'
            );
            throw new Error(text);
          });
        }
        return result;
      })
      .then((result) => {
        if (result.status) {
          // Flatten the data to match the table structure
          const flattenedReports = result.result.flatMap((customer) =>
            customer.branches.flatMap((branch) =>
              branch.applications.map((app, index) => ({
                num: index + 1,
                date: new Date(app.report_date).toLocaleDateString(),
                applicationId: app.application_id,
                applicantName: app.application_name,
                status: app.overall_status,
                generatedBy: app.report_generator_name || "N/A",
                qcStatus: app.is_verify,
                services: app.services_status, // Include services_status
              }))
            )
          );
          setData(flattenedReports); // Set the original data
          setFilteredData(flattenedReports); // Initialize filtered data with the original data
        } else {
          setData([]);
          setFilteredData([]); // Handle cases with no data
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || "Failed to fetch data. Please try again later.",
          footer: `<small>${error.message}</small>`,
        });
      })
      .finally(() => {
        setLoading(false); // Stop loading after fetch completes
      });
  }, []);


  const filtered = data.filter((item) => {
    const matchesQcStatus = filters.qc_status
      ? item.qcStatus?.toLowerCase().includes(filters.qc_status.toLowerCase())
      : true; // When no filter is set, always return true

    const matchesReportGenerateBy = filters.reportgenerateby
      ? item.generatedBy?.toLowerCase().includes(filters.reportgenerateby.toLowerCase())
      : true; // When no filter is set, always return true

    const matchesDate = filters.date
      ? new Date(item.date).toLocaleDateString() === new Date(filters.date).toLocaleDateString()
      : true; // When no filter is set, always return true

    return matchesQcStatus && matchesReportGenerateBy && matchesDate;
  });


  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);



  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const showPrev = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const showNext = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };


  const renderPagination = () => {
    const pageNumbers = [];

    // Handle pagination with ellipsis
    if (totalPages <= 5) {
      // If there are 5 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show the first page
      pageNumbers.push(1);

      // Show ellipsis if current page is greater than 3
      if (currentPage > 3) {
        pageNumbers.push('...');
      }

      // Show two pages around the current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pageNumbers.includes(i)) {
          pageNumbers.push(i);
        }
      }

      // Show ellipsis if current page is less than total pages - 2
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }

      // Always show the last page
      if (!pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((number, index) => (
      number === '...' ? (
        <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
      ) : (
        <button
          type="button"
          key={`page-${number}`} // Unique key for page buttons
          onClick={() => handlePageChange(number)}
          className={`px-3 py-1 rounded-0 ${currentPage === number ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
        >
          {number}
        </button>
      )
    ));
  };
  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle the expanded state of the row
    }));
  };



  return (
    <>
      <div className=" py-4 px-4" >
        <form className="grid md:grid-cols-4 grid-cols-1 gap-3 p-3 border mb-4 rounded-md">
          <div className="mb-4">
            <label htmlFor="reportGeneratedby">REPORT GENERATED BY</label>
            <select
              name="reportgenerateby" // Updated name
              id="reportGeneratedby"
              className="outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2"
              onChange={handleChange}
              value={filters.reportgenerateby}
            >
              <option value="">Select an option</option>
              {data.map((curElm) => (
                <option key={curElm.generatedBy} value={curElm.generatedBy}>
                  {curElm.generatedBy}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block">
              Date
            </label>
            <input type='date' name='date' value={filters.date} onChange={handleChange} id='date' className="outline-none pe-2 ps-2 text-left rounded-md w-full border p-2 mt-2"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="ReportGeneratedMonth">REPORT GENERATED BY MONTH</label>
            <select
              name="month"
              id="ReportGeneratedMonth"
              className="outline-none pe-2 ps-2 text-left rounded-md w-full border p-2 mt-2"
              onChange={handleChange}
              value={filters.month}
            >
              <option value="">Select a month</option>
              <option value="Jan">January</option>
              <option value="Feb">February</option>
              <option value="Mar">March</option>
              <option value="Apr">April</option>
              <option value="May">May</option>
              <option value="Jun">June</option>
              <option value="Jul">July</option>
              <option value="Aug">August</option>
              <option value="Sep">September</option>
              <option value="Oct">October</option>
              <option value="Nov">November</option>
              <option value="Dec">December</option>
            </select>

          </div>
          <div className="mb-4">
            <label htmlFor="QCStatus" className="block">
              QC STATUS FETCH
            </label>
            <select
              name="qc_status"
              id="QCStatus"
              className="outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2"
              onChange={handleChange}
              value={filters.qc_status}
            >
              <option value="">CHOOSE QC STATUS</option>
              {data.map((itemOption) => {
                return (
                  <>
                    <option key={itemOption.qcStatus} value={itemOption.qcStatus}>
                      {itemOption.qcStatus}
                    </option>
                  </>
                )
              })}

            </select>
          </div>

        </form>

        {loading ? (
          <div className='flex justify-center items-center py-6 h-full'>
            <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />

          </div>
        ) : currentItems.length > 0 ? (
          <div className="overflow-x-auto "  >
            <table className="min-w-full" ref={tableRef}>
              <thead>
                <tr className="bg-green-500">
                  <th className="py-2 text-center text-white border-r px-4 border-b whitespace-nowrap uppercase">SL</th>
                  <th className="py-2 text-center text-white border-r px-4 border-b whitespace-nowrap uppercase">Report Date</th>
                  <th className="py-2 text-center text-white border-r px-4 border-b whitespace-nowrap uppercase">Application ID</th>
                  <th className="py-2 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Name Of Applicant</th>
                  <th className="py-2 text-center text-white border-r px-4 border-b whitespace-nowrap uppercase">Overall Status</th>
                  <th className="py-2 text-center text-white border-r px-4 border-b whitespace-nowrap uppercase">Report Generated by</th>
                  <th className="py-2 text-center text-white border-r px-4 border-b whitespace-nowrap uppercase">Qc Status</th>
                  <th className="py-2 text-center text-white border-r px-4 border-b whitespace-nowrap uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((report, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td className="py-2 px-4 text-center border-l border-b border-r whitespace-nowrap">{report.num}</td>
                      <td className="py-2 px-4 text-center border-b border-r whitespace-nowrap">{report.date}</td>
                      <td className="py-2 px-4 text-center border-b border-r whitespace-nowrap">{report.applicationId}</td>
                      <td className="py-2 px-4 text-left border-b border-r whitespace-nowrap">{report.applicantName}</td>
                      <td className="py-2 px-4 text-center border-b border-r whitespace-nowrap">{report.status}</td>
                      <td className="py-2 px-4 text-center border-b border-r whitespace-nowrap">{report.generatedBy}</td>
                      <td className="py-2 px-4 text-center border-b border-r whitespace-nowrap">
                        <button className="bg-green-600 text-white py-2 px-10 rounded-md hover:bg-green-200">{report.qcStatus}</button>
                      </td>
                      <td className="py-2 px-4 text-center border-b border-r whitespace-nowrap">
                        <button
                          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-blue-200"
                          onClick={() => toggleRow(index)}
                        >
                          {expandedRows[index] ? "Hide Services" : "View More"}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[index] && (
                      <tr>
                        <td colSpan={8} className="py-2 px-4 text-left border-b border-r whitespace-nowrap bg-gray-100">
                          <table className="w-full">
                            <thead>
                              <tr >
                                {Object.entries(report.services).map(([service, status], i) => (

                                  <th className="py-2 px-4">{service}</th>

                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr >
                                {Object.entries(report.services).map(([service, status], i) => (

                                  <td className="py-2 px-4">{status}</td>

                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}


                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6">
            <p>No Data Found</p>
          </div>
        )}
        <div className="flex items-center justify-end  rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
          <button
            onClick={showPrev}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-label="Previous page"
          >
            <MdArrowBackIosNew />
          </button>
          <div className="flex items-center">
            {renderPagination()}
          </div>
          <button
            onClick={showNext}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-label="Next page"
          >
            <MdArrowForwardIos />
          </button>
        </div>
      </div>
    </>
  )
}

export default ReportsList