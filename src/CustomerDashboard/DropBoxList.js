import React, { useContext, useEffect, useState } from 'react'
import Swal from 'sweetalert2';
import DropBoxContext from './DropBoxContext';
import { useApi } from '../ApiContext';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import ClientForm from './ClientForm';
import PulseLoader from 'react-spinners/PulseLoader';

const DropBoxList = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalServices, setModalServices] = React.useState([]);
    const branchEmail = JSON.parse(localStorage.getItem("branch"))?.email;

    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemPerPage] = useState(10)
    const API_URL = useApi();
    const [currentPage, setCurrentPage] = useState(1);
    const { handleEditDrop, fetchClientDrop, listData, loading } = useContext(DropBoxContext);

    useEffect(() => {
        fetchClientDrop();
    }, [fetchClientDrop]);
    const handleViewMore = (services) => {
        setModalServices(services);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalServices([]);
    };

    const filteredItems = listData.filter(item => {
        return (
            item.application_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())

        );
    });


    const handleEdit = (client) => {
        handleEditDrop(client);
    };

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

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

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                if (!pageNumbers.includes(i)) {
                    pageNumbers.push(i);
                }
            }
            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }

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

    const handleSelectChange = (e) => {

        const selectedValue = e.target.value;
        setItemPerPage(selectedValue)

    }



    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        }).then((result) => {
            if (result.isConfirmed) {
                const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
                const _token = localStorage.getItem("branch_token");

                if (!branch_id || !_token) {
                    console.error("Branch ID or token is missing.");
                    return;
                }

                const requestOptions = {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                fetch(`${API_URL}/branch/client-application/delete?id=${id}&branch_id=${branch_id}&_token=${_token}`, requestOptions)
                    .then(response => {
                        const result = response.json();
                        const newToken = result._token || result.token;
                        if (newToken) {
                            localStorage.setItem("branch_token", newToken);
                        }
                        if (!response.ok) {

                            if (response.message && response.message.toLowerCase().includes("invalid") && response.message.toLowerCase().includes("token")) {
                                Swal.fire({
                                    title: "Session Expired",
                                    text: "Your session has expired. Please log in again.",
                                    icon: "warning",
                                    confirmButtonText: "Ok",
                                }).then(() => {
                                    // Redirect to admin login page
                                    window.open(`/customer-login?email=${encodeURIComponent(branchEmail)}`);
                                });
                            }
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
                    .then(result => {
                        const newToken = result._token || result.token;
                        if (newToken) {
                            localStorage.setItem("branch_token", newToken);
                        }

                        // Refresh the client drop data after deletion
                        fetchClientDrop();
                        Swal.fire(
                            'Deleted!',
                            'Your service has been deleted.',
                            'success'
                        );
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                        Swal.fire(
                            'Error!',
                            'An unexpected error occurred while deleting.',
                            'error'
                        );
                    });
            }
        });
    };

    return (
        <>
            <div className=" py-4 md:py-16">
                <h2 className='md:text-4xl text-2xl font-bold pb-8 md:pb-4 text-center'>Client DropBox</h2>
                <div className="m-5">
                    <div>
                        <ClientForm />
                    </div>

                </div>
                <div className="overflow-x-auto py-6 px-4 bg-white shadow-md rounded-md md:m-10 m-3">
                    <div className="md:grid grid-cols-2 justify-between items-center md:my-4 border-b-2 pb-4">
                        <div className="col">
                            <form action="">
                                <div className="flex gap-5 justify-between">
                                    <select name="" id="" onChange={handleSelectChange} className='outline-none border p-3 text-left rounded-md w-6/12'>
                                        <option value="10">10 Rows</option>
                                        <option value="20">20 Rows</option>
                                        <option value="50">50 Rows</option>
                                        <option value="100">100 Rows</option>
                                        <option value="200">200 Rows</option>
                                        <option value="300">300 Rows</option>
                                        <option value="400">400 Rows</option>
                                        <option value="500">500 Rows</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="col md:flex justify-end ">
                            <form action="">
                                <div className="flex md:items-stretch items-center  gap-3">
                                    <input
                                        type="search"
                                        className='outline-none border-2 p-2 text-sm rounded-md w-full my-4 md:my-0'
                                        placeholder='Search by Client Code...'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>

                    </div>
                    <div className="overflow-x-auto py-6 px-4">
                        {loading ? (
                            <div className='flex justify-center items-center py-6 h-full'>
                                <PulseLoader color="#36D7B7" loading={loading} size={15} aria-label="loading Spinner" />

                            </div>
                        ) : currentItems.length > 0 ? (
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-green-500">
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">SL NO.</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Photo</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Application Id	</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Employee Name</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Application Date/time</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Location</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Batch Number</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Sub Client</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Documents</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Services</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Spoc Case Name</th>
                                        <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Employee Id</th>
                                        <th className="py-3 text-center text-white px-4 border-b whitespace-nowrap uppercase">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems.map((report, index) => (
                                        <tr key={index} id={report.id}>
                                            <td className="py-3 px-4 border-b border-r text-center border-l whitespace-nowrap">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                            <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                                                {report.photo ? (
                                                    // Check if the file is an image
                                                    report.photo.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                        <img
                                                            src={`${report.photo}`}
                                                            alt="Image"
                                                            className="h-20 w-20 rounded-full"
                                                        />
                                                    ) : (
                                                        // If it's a document (pdf, doc, etc.), show a button
                                                        <a
                                                            href={`${report.photo}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <button type='button' className="px-4 py-2 bg-green-500 text-white rounded">
                                                                View Document
                                                            </button>
                                                        </a>
                                                    )
                                                ) : (
                                                    '----'
                                                )}
                                            </td>

                                            <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">{report.application_id || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.name || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">
                                                {new Date(report.created_at).getDate()}-
                                                {new Date(report.created_at).getMonth() + 1}-
                                                {new Date(report.created_at).getFullYear()}
                                            </td>


                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.location || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.batch_number || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.sub_client || 'NIL'}</td>

                                            <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                                                {report.attach_documents ? (
                                                    // Check if the file is an image
                                                    report.attach_documents.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                        <img
                                                            src={`${report.attach_documents}`}
                                                            alt="Image"
                                                            className="h-20 w-20 rounded-full"
                                                        />
                                                    ) : (
                                                        // If it's a document (pdf, doc, etc.), show a button
                                                        <a
                                                            href={`${report.attach_documents}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <button type='button' className="px-4 py-2 bg-green-500 text-white rounded">
                                                                View Document
                                                            </button>
                                                        </a>
                                                    )
                                                ) : (
                                                    '----'
                                                )}
                                            </td>
                                            <td className="border  px-4 py-2 text-left">
                                                <div className='flex whitespace-nowrap'>
                                                    {Array.isArray(report.serviceNames) && report.serviceNames.length > 0 ? (
                                                        report.serviceNames.length === 1 ? (
                                                            <span className="px-4 py-2 bg-green-100 border  border-green-500 rounded-lg text-sm">
                                                                {typeof report.serviceNames[0] === "string"
                                                                    ? report.serviceNames[0]
                                                                    : report.serviceNames[0].join(", ")}
                                                            </span>
                                                        ) : (
                                                            <>
                                                                {typeof report.serviceNames[0] === "string" ? (
                                                                    <span className="px-4 py-2 bg-green-100 border   border-green-500 rounded-lg text-sm">
                                                                        {report.serviceNames[0]}
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-4 py-2 bg-green-100 border  border-green-500 rounded-lg text-sm">
                                                                        {report.serviceNames[0].join(", ")}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    className="text-green-500 ml-2"
                                                                    onClick={() => handleViewMore(report.serviceNames)}
                                                                >
                                                                    View More
                                                                </button>
                                                            </>
                                                        )
                                                    ) : (
                                                        <span className="px-4 py-2 bg-red-100 border border-red-500 rounded-lg">
                                                            You have no services
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {isModalOpen && (
                                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                    <div className="bg-white rounded-lg shadow-lg p-4 w-1/3">
                                                        <div className="flex justify-between items-center">
                                                            <h2 className="text-lg font-bold">Services</h2>
                                                            <button
                                                                className="text-red-500 text-2xl"
                                                                onClick={handleCloseModal}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                        <div className="mt-4 flex flex-wrap gap-2 w-full m-auto h-auto overflow-scroll">
                                                            {modalServices.length > 0 ? (
                                                                modalServices.map((service, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-4 py-2 bg-green-100 border  border-green-500 rounded-lg text-sm"
                                                                    >
                                                                        {service}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-500">No service available</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{report.single_point_of_contact || 'NIL'}</td>
                                            <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.employee_id}</td>
                                            <td className="py-3 px-4 border-b whitespace-nowrap border-r">
                                                <button className="bg-green-600 text-white p-3 rounded-md hover:bg-green-200" onClick={() => handleEdit(report)}>Edit</button>
                                                <button className="bg-red-600 text-white p-3 ms-2 rounded-md hover:bg-red-200" onClick={() => handleDelete(report.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>


                            </table>
                        ) : (
                            <div className="text-center py-6">
                                <p>No Data Found</p>
                            </div>
                        )}


                    </div>
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

            </div>

        </>
    )
}

export default DropBoxList