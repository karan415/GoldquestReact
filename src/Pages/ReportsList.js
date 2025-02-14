import React, { useEffect, useRef, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import PulseLoader from 'react-spinners/PulseLoader';
import { useApiCall } from '../ApiCallContext';

const ReportsList = () => {
      const { isApiLoading, setIsApiLoading } = useApiCall();
  
  const [expandedRows, setExpandedRows] = useState({}); // State to track expanded rows
  const [filters, setFilters] = useState({
    reportgenerateby: "", // Updated key for report generator
    date: "",
    month: "",
    qc_status: "",
  });
  const [uniqueQcStatuses, setUniqueQcStatuses] = useState([]);
  const [uniqueGeneratedBy, setUniqueGeneratedBy] = useState([]);


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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id || "";
    const storedToken = localStorage.getItem("_token") || "";

    console.log("Admin ID:", admin_id); // Log admin_id
    console.log("Stored Token:", storedToken); // Log stored token

    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    setIsApiLoading(true);
    setLoading(true); // Start loading before the fetch request
    console.log("Fetching data...");

    fetch(
      `https://api.goldquestglobal.in/report-summary/report-tracker?admin_id=${admin_id}&_token=${storedToken}`,
      requestOptions
    )
      .then((response) => response.json().then(result => {
        // Handle token expiration check
        const newToken = result._token || result.token;
        if (newToken) {
          localStorage.setItem("_token", newToken); // Update token in localStorage
        }

        if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
          Swal.fire({
            title: "Session Expired",
            text: "Your session has expired. Please log in again.",
            icon: "warning",
            confirmButtonText: "Ok",
          }).then(() => {
            window.location.href = "/admin-login"; // Redirect to login page on token expiration
          });
          return; // Stop further processing if token expired
        }

        if (!response.ok) {
          Swal.fire({
            title: 'Error!',
            text: `An error occurred: ${result.message}`,
            icon: 'error',
            confirmButtonText: 'Ok'
          });
          throw new Error('Network response was not ok');
        }

        return result; // Return the successful result if no errors
      }))
      .then((result) => {
        console.log("Parsed result:", result); // Log parsed response data

        // Handle new token if it exists in the response
        const newToken = result._token || result.token;
        if (newToken) {
          console.log("New token found:", newToken); // Log new token
          localStorage.setItem("_token", newToken); // Update the token in localStorage
        }

        // Check for "Invalid token provided" message
        if (result.message && result.message.toLowerCase().includes("invalid token provided")) {
          console.log("Invalid token detected, showing session expired alert"); // Log session expired detection
          // Show session expired message and redirect to login
          Swal.fire({
            title: "Session Expired",
            text: "Your session has expired. Please log in again.",
            icon: "warning",
            confirmButtonText: "Ok",
          }).then(() => {
            window.location.href = "/admin-login"; // Redirect to login page
          });
          throw new Error("Session expired"); // Stop further processing after session expired message
        }

        // If response is valid, proceed with further processing
        if (result.status) {
          console.log("Result status is OK, processing data..."); // Log if status is OK
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

          console.log("Flattened reports:", flattenedReports); // Log the flattened reports

          setData(flattenedReports); // Set the fetched data

          // Extract unique QC Status and Report Generated By
          const qcStatuses = new Set(flattenedReports.map((report) => report.qcStatus));
          const generatedBy = new Set(flattenedReports.map((report) => report.generatedBy));

          setUniqueQcStatuses([...qcStatuses]); // Convert Set to Array
          setUniqueGeneratedBy([...generatedBy]); // Convert Set to Array
          console.log("Unique QC Statuses:", [...qcStatuses]); // Log unique QC statuses
          console.log("Unique Generated By:", [...generatedBy]); // Log unique generated by statuses
        } else {
          console.log("Result status is not OK, handling error..."); // Log when result status is not OK
          setData([]); // Clear data if status is not okay
          Swal.fire({
            title: "Error!",
            text: result.message || "Failed to fetch data.",
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error); // Log network or fetch error
        
      })
      .finally(() => {
        setLoading(false);
        setIsApiLoading(false); // Stop loading after fetch completes
        console.log("Fetch complete, loading stopped."); // Log when loading is stopped
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
            <label className="text-sm" htmlFor="reportGeneratedby">REPORT GENERATED BY</label>
            <select
              name="reportgenerateby" // Updated name
              id="reportGeneratedby"
              className="outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2"
              onChange={handleChange}
              value={filters.reportgenerateby}
            >
              <option value="">Select an option</option>
              {uniqueGeneratedBy.map((curElm) => (
                <option key={curElm} value={curElm}>
                  {curElm}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-sm block" htmlFor="date">
              Date
            </label>
            <input type='date' name='date' value={filters.date} onChange={handleChange} id='date' className="outline-none pe-2 ps-2 text-left rounded-md w-full border p-2 mt-2"
            />
          </div>
          <div className="mb-4">
            <label className="text-sm" htmlFor="ReportGeneratedMonth">REPORT GENERATED BY MONTH</label>
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
            <label className="text-sm block" htmlFor="QCStatus" >
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
              {uniqueQcStatuses.map((itemOption) => {
                return (
                  <>
                    <option key={itemOption} value={itemOption}>
                      {itemOption}
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
          <div className="overflow-x-auto bg-white shadow-md rounded-md p-3"  >
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
                {currentItems.map((report, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td className="py-2 px-4 text-sm text-center border-l border-b border-r whitespace-nowrap">{report.num}</td>
                      <td className="py-2 px-4 text-sm text-center border-b border-r whitespace-nowrap">
                        {(() => {
                          const date = new Date(report.date);
                          const day = date.getDate();
                          const month = date.getMonth() + 1; // Months are zero-indexed
                          const year = date.getFullYear();
                          return `${day}-${month}-${year}`;
                        })()}
                      </td>
                      <td className="py-2 px-4 text-sm text-center border-b border-r whitespace-nowrap">{report.applicationId}</td>
                      <td className="py-2 px-4 text-sm text-left border-b border-r whitespace-nowrap">{report.applicantName}</td>
                      <td className="py-2 px-4 text-sm text-center border-b border-r whitespace-nowrap">{report.status}</td>
                      <td className="py-2 px-4 text-sm text-center border-b border-r whitespace-nowrap">{report.generatedBy}</td>
                      <td className="py-2 px-4 text-sm text-center border-b border-r whitespace-nowrap">
                        <button className="bg-green-600 text-white py-2 px-10 rounded-md hover:bg-green-200">{report.qcStatus}</button>
                      </td>
                      <td className="py-2 px-4 text-sm text-center border-b border-r whitespace-nowrap">
                        <button
                          className="bg-green-600 text-white py-2 px-4 text-sm rounded-md hover:bg-blue-200"
                          onClick={() => toggleRow(index)}
                        >
                          {expandedRows[index] ? "Hide Services" : "View More"}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[index] && (
                      <tr>
                        <td colSpan={8} className="py-2 px-4 text-sm text-left border-b border-r whitespace-nowrap bg-gray-100">
                          <table className="w-full">
                            <thead>
                              <tr >
                                {Object.entries(report.services).map(([service, status], i) => (

                                  <th className="py-2 px-4 text-sm">{service}</th>

                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr >
                                {Object.entries(report.services).map(([service, status], i) => (

                                  <td className="py-2 px-4 text-sm">{status}</td>

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
        <div className="flex items-center justify-end  rounded-md px-4 py-3 sm:px-6 md:m-4 mt-2">
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