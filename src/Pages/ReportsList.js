import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import PulseLoader from 'react-spinners/PulseLoader';
const ReportsList = () => {
  const [expandedRows, setExpandedRows] = useState({}); // State to track expanded rows
  const [filters, setFilters] = useState({
    reportgenerateby: "",  // Updated key for report generator
    date: "",
    month: "",
    qc_status: "",
  });
  const [filteredData, setFilteredData] = useState([]); // Data after applying filters

  const [loading, setLoading] = useState(false)
  const [itemsPerPage, setItemPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());


  const [error, setError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setStartDate(date);
    setFilters((prev) => ({
      ...prev,
      date: date ? date.toISOString().split("T")[0] : "",
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs if needed
    let validationErrors = {};
    if (!filters.reportgenerateby) {
      validationErrors.reportgenerateby = "Please select a report generator.";
    }
    if (!filters.date) {
      validationErrors.date = "Please select a date.";
    }
    if (!filters.month) {
      validationErrors.month = "Please select a month.";
    }
    if (!filters.qc_status) {
      validationErrors.qc_status = "Please select a QC status.";
    }

    setError(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Filter data based on the selected filters
    const filtered = data.filter((item) => {
      const reportMonth = new Date(item.date).toLocaleString("default", {
        month: "short",
      });

      return (
        (!filters.reportgenerateby || item.reportGenerateBy === filters.reportgenerateby) &&
        (!filters.date || item.date === filters.date) &&
        (!filters.month || reportMonth === filters.month) &&
        (!filters.qc_status || item.qcStatus === filters.qc_status)
      );
    });

    setFilteredData(filtered);
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle the expanded state of the row
    }));
  };

  useEffect(() => {
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id || "";
    const storedToken = localStorage.getItem("_token") || "";
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    setLoading(true); // Start loading before the fetch request

    fetch(`https://goldquestreact.onrender.com/report-summary/report-tracker?admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          // Handle HTTP errors
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
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
          setData(flattenedReports); // Set the flattened data
        } else {
          setData([]); // Handle cases with no data
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to fetch data. Please try again later.",
          footer: `<small>${error.message}</small>`,
        });
      })
      .finally(() => {
        setLoading(false); // Stop loading after fetch completes
      });
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

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



  return (
    <>
      <div className="overflow-x-auto py-4 px-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-3 p-3 border mb-4 rounded-md">
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
                <option key={curElm.applicantName} value={curElm.applicantName}>
                  {curElm.applicantName}
                </option>
              ))}
            </select>
            {error.reportgenerateby && <p className="text-red-500">{error.reportgenerateby}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block">
              Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              name="date"
              className="border w-full rounded-md p-2 mt-2"
            />
            {error.date && <p className="text-red-500">{error.date}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="ReportGeneratedMonth">REPORT GENERATED BY MONTH</label>
            <select
              name="month"
              id="ReportGeneratedMonth"
              className="outline-none pe-14 ps-2 text-left rounded-md w-full border p-2 mt-2"
              onChange={handleChange}
              value={filters.month}
            >
              <option value="">Select a month</option>
              <option value="Jan">Jan</option>
              <option value="Feb">Feb</option>
              <option value="Mar">Mar</option>
              <option value="Apr">Apr</option>
              <option value="May">May</option>
              <option value="Jun">Jun</option>
              <option value="Jul">Jul</option>
            </select>
            {error.month && <p className="text-red-500">{error.month}</p>}
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
            {error.qc_status && <p className="text-red-500">{error.qc_status}</p>}
          </div>
          <div className="mb-4 flex items-end">
            <button className="bg-green-500 text-white w-full rounded-md p-3" type="submit">
              Submit
            </button>
          </div>
        </form>

        {loading ? (
          <div className='flex justify-center items-center py-6 h-full'>
            <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="Loading Spinner" />

          </div>
        ) : currentItems.length > 0 ? (
          <table className="min-w-full">
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