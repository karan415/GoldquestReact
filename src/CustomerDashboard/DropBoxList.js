import React, { useContext, useEffect, useState } from 'react';
import PaginationContext from '../Pages/PaginationContext';
import Pagination from '../Pages/Pagination';
import Swal from 'sweetalert2';
import DropBoxContext from './DropBoxContext';
import { useApi } from '../ApiContext';

const DropBoxList = () => {
    const API_URL = useApi();

    const { currentItem, showPerPage, setTotalResults, } = useContext(PaginationContext);
    const [paginated, setPaginated] = useState([]);
    const { handleEditDrop, fetchClientDrop, listData } = useContext(DropBoxContext)
    useEffect(() => {
        fetchClientDrop();
    }, [fetchClientDrop]);

    useEffect(() => {
        setTotalResults(listData.length);
        const startIndex = (currentItem - 1) * showPerPage;
        const endIndex = startIndex + showPerPage;
        setPaginated(listData.slice(startIndex, endIndex));
    }, [currentItem, setTotalResults, listData, showPerPage]);

    const handleEdit = (client) => {
        fetchClientDrop();
        handleEditDrop(client);
    };

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
                    console.error("Admin ID or token is missing.");
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
                        return response.json();
                    })
                    .then(result => {
                        const newToken = result._token || result.token;
                        if (newToken) {
                            localStorage.setItem("branch_token", newToken);
                        }
                        fetchClientDrop();
                        Swal.fire(
                            'Deleted!',
                            'Your service has been deleted.',
                            'success'
                        );
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                    });
            }
        });
    };
    return (
        <>

            <div className="overflow-x-auto py-6 px-4 bg-white shadow-md rounded-md md:m-10 m-3">

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
                            <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Packages</th>
                            <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Spoc Case Name</th>
                            <th className="py-3 text-left text-white border-r px-4 border-b whitespace-nowrap uppercase">Employee Id</th>
                            <th className="py-3 text-center text-white px-4 border-b whitespace-nowrap uppercase">Action</th>
                        </tr>
                    </thead>
                  
                    {paginated.length > 0 ? (
                        <tbody>
                            {paginated.map((report, index) => (
                                <tr key={index} id={report.id}>
                                    <td className="py-3 px-4 border-b border-r text-center border-l whitespace-nowrap">{index + 1}</td>
                                    <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                                        {report.photo ? (
                                            <img
                                                src={`https://octopus-app-www87.ondigitalocean.app/${report.photo}`}
                                                alt={report.photo}
                                                className='h-20 w-20 rounded-full'
                                            />
                                        ) : '----'}
                                    </td>
                                    <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">{report.application_id}</td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.name}</td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.created_at}</td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.location}</td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.batch_number}</td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.sub_client}</td>
                                    <td className="py-3 px-4 border-b border-r text-center whitespace-nowrap">
                                        {report.attach_documents ? (
                                            <img
                                                src={`https://octopus-app-www87.ondigitalocean.app/${report.attach_documents}`}
                                                alt={report.attach_documents}
                                                className='h-20 w-20 rounded-full'
                                            />
                                        ) : '----'}
                                    </td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">
                                        {report.services || 'no data available'}
                                        <button className='block text-blue-600'>{report.more}</button>
                                    </td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.package || 'no data available'}</td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap text-center">{report.spoc}</td>
                                    <td className="py-3 px-4 border-b border-r whitespace-nowrap">{report.employee_id}</td>
                                    <td className="py-3 px-4 border-b whitespace-nowrap border-r">
                                        <button className="bg-green-600 text-white p-3 rounded-md hover:bg-green-200" onClick={() => handleEdit(report)}>Edit</button>
                                        <button className="bg-red-600 text-white p-3 ms-2 rounded-md hover:bg-red-200" onClick={() => handleDelete(report.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ) : (
                        <tr>
                            <td colSpan={13} className='text-center p-5 w-full whitespace-nowrap'>No Data Available</td>
                        </tr>
                    )}
                    
                    
                </table>
            </div>
            <Pagination />
        </>
    )
}

export default DropBoxList