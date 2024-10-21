import React, { useEffect, useState, useContext, useCallback } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import Multiselect from 'multiselect-react-dropdown';
import { useClient } from './ClientManagementContext';
import { useApi } from '../ApiContext';


const ClientManagementData = () => {
    const [selectedServices, setSelectedServices] = useState({});
    const [, setSelectedData] = useState([]);
    const API_URL = useApi();
    const { setClientData, validationsErrors, setValidationsErrors } = useClient();
    const [service, setService] = useState([]);
    const [packageList, setPackageList] = useState([]);
    const [paginated, setPaginated] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPackages, setSelectedPackages] = useState({});
    const [priceData, setPriceData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    const totalPages = Math.ceil(paginated.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = paginated.slice(indexOfFirstItem, indexOfLastItem);


    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showPrev = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const showNext = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const admin_id = JSON.parse(localStorage.getItem("admin"))?.id || '';
            const storedToken = localStorage.getItem("_token") || '';
            const res = await fetch(`${API_URL}/service/list?admin_id=${admin_id}&_token=${storedToken}`);

            if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);

            const result = await res.json();
            if (!result || !Array.isArray(result.services)) throw new Error('Invalid response format');

            const processedServices = result.services.map(item => ({
                ...item,
                service_id: item.id,
                service_title: item.title,
                price: '',
                selectedPackages: []
            }));
            setService(processedServices);
        } catch (error) {
            console.error("Error fetching services:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const fetchPackage = useCallback(async () => {
        setError(null);
        try {
            const admin_id = JSON.parse(localStorage.getItem("admin"))?.id || '';
            const storedToken = localStorage.getItem("_token");
            if (!storedToken) throw new Error('No token found in local storage');

            const res = await fetch(`${API_URL}/package/list?admin_id=${admin_id}&_token=${storedToken}`);

            if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);

            const result = await res.json();
            const processedPackages = result.packages.map(item => ({
                ...item,
                service_id: item.id,
            }));
            setPackageList(processedPackages);
        } catch (error) {
            console.error("Error fetching packages:", error);
            setError(error.message);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchServices();
        fetchPackage();
    }, [fetchServices, fetchPackage]);

    const validateServices = () => {
        const errors = {};
        service.forEach((item) => {
            const selectedPackageCount = (selectedPackages[item.service_id] || []).length;
            const enteredPrice = priceData[item.service_id]?.price;

            if (selectedPackageCount > 0 && !enteredPrice) {
                errors[item.service_id] = { price: 'Please enter a price if a package is selected' };
            } else if (enteredPrice && selectedPackageCount === 0) {
                errors[item.service_id] = { packages: 'Please select at least one package if a price is entered' };
            }
        });
        setValidationsErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        const updatedServiceData = service.map((item) => {

            const packageObject = (selectedPackages[item.service_id] || []).reduce((acc, pkgId) => {
                const pkg = packageList.find(p => p.id === pkgId);
                if (pkg) {
                    acc[pkg.id] = pkg.title;
                }
                return acc;
            }, {});

            return {
                serviceId: item.service_id,
                serviceTitle: item.service_title,
                price: priceData[item.service_id]?.price || '',
                packages: packageObject,
            };
        });
        const filteredSelectedData = updatedServiceData.filter(item => selectedServices[item.serviceId]);

        console.log('filteredSelectedData', filteredSelectedData);
        console.log('updatedServiceData', updatedServiceData)
        setClientData(filteredSelectedData);
        setSelectedData(updatedServiceData);

        if (validateServices()) {
            setPaginated(updatedServiceData);
        }
    }, [service, selectedPackages, priceData, selectedServices, setClientData, packageList]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const handlePackageChange = (selectedList, serviceId) => {
        const updatedPackages = selectedList.map(item => item.id);
        setSelectedPackages(prev => ({
            ...prev,
            [serviceId]: updatedPackages,
        }));
    };

    const handleChange = (e, serviceId) => {
        const { name, value } = e.target;
        setPriceData(prev => ({
            ...prev,
            [serviceId]: { [name]: value }
        }));
    };

    const handleCheckboxChange = (serviceId) => {
        setSelectedServices(prev => ({
            ...prev,
            [serviceId]: !prev[serviceId]
        }));
    };

    return (
        <div className="overflow-x-auto py-6 px-0 bg-white mt-10 m-auto">
            <table className="min-w-full">
                <thead>
                    <tr className='bg-green-500'>
                        <th className="py-2 md:py-3 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Service Name</th>
                        <th className="py-2 md:py-3 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Price</th>
                        <th className="py-2 md:py-3 px-4 text-white border-r border-b text-left uppercase whitespace-nowrap">Select Package</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item) => (
                        <tr key={item.serviceId}>
                            <td className="py-2 md:py-3 px-4 border-l border-r border-b whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    className='me-2'
                                    checked={!!selectedServices[item.serviceId]}
                                    onChange={() => handleCheckboxChange(item.serviceId)}
                                /> {item.serviceTitle}
                            </td>
                            <td className="py-2 md:py-3 px-4 border-r border-b whitespace-nowrap">
                                <input
                                    type="number"
                                    name="price"
                                    value={priceData[item.serviceId]?.price || ''}
                                    onChange={(e) => handleChange(e, item.serviceId)}
                                    className='outline-none'
                                />
                                {validationsErrors[item.serviceId]?.price && <span className="text-red-500">{validationsErrors[item.serviceId].price}</span>}
                            </td>
                            <td className="py-2 md:py-3 px-4 border-r border-b whitespace-nowrap uppercase text-left">
                                <Multiselect
                                    options={packageList.map(pkg => ({ name: pkg.title, id: pkg.id }))}
                                    selectedValues={packageList.filter(pkg => (selectedPackages[item.serviceId] || []).includes(pkg.id)).map(pkg => ({ name: pkg.title, id: pkg.id }))}
                                    onSelect={(selectedList) => handlePackageChange(selectedList, item.serviceId)}
                                    onRemove={(selectedList) => handlePackageChange(selectedList, item.serviceId)}
                                    displayValue="name"
                                    className='text-left'
                                />
                                {validationsErrors[item.serviceId]?.packages && <span className="text-red-500">{validationsErrors[item.serviceId].packages}</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex items-center justify-end  rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
                <button
                    type='button'
                    onClick={showPrev}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    aria-label="Previous page"
                >
                    <MdArrowBackIosNew />
                </button>
                <div className="flex items-center">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            type='button'
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={` px-3 py-1 rounded-0 ${currentPage === index + 1 ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                <button
                    type='button'
                    onClick={showNext}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    aria-label="Next page"
                >
                    <MdArrowForwardIos />
                </button>
            </div>
        </div>
    );
};

export default ClientManagementData;
