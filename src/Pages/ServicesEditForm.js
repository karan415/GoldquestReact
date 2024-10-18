import React, { useEffect, useState, useContext, useCallback } from 'react';
import PaginationContext from './PaginationContext';
import Pagination from './Pagination';
import Multiselect from 'multiselect-react-dropdown';
import { useEditClient } from './ClientEditContext';
import { useApi } from '../ApiContext';

const ServiceEditForm = () => {
    const [selectedServices, setSelectedServices] = useState({});
    const [serviceData, setServiceData] = useState([]);
    const [packageList, setPackageList] = useState([]);
    const [paginated, setPaginated] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPackages, setSelectedPackages] = useState({});
    const [priceData, setPriceData] = useState({});
    const { setTotalResults } = useContext(PaginationContext);
    const { clientData, setClientData } = useEditClient();
    const API_URL = useApi();

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const admin_id = JSON.parse(localStorage.getItem("admin"))?.id || '';
            const storedToken = localStorage.getItem("_token") || '';
            const res = await fetch(`${API_URL}/service/list?admin_id=${admin_id}&_token=${storedToken}`);
            const result = await res.json();
            if (result?.services) {
                const processedServices = result.services.map(item => ({
                    service_id: item.id,
                    service_title: item.title,
                    price: '',
                    packages: {},
                }));
                setServiceData(processedServices);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const fetchPackages = useCallback(async () => {
        setError(null);
        try {
            const admin_id = JSON.parse(localStorage.getItem("admin"))?.id || '';
            const storedToken = localStorage.getItem("_token");
            if (!storedToken) throw new Error('No token found in local storage');

            const res = await fetch(`${API_URL}/package/list?admin_id=${admin_id}&_token=${storedToken}`);
            const result = await res.json();
            const processedPackages = result.packages.map(item => ({
                ...item,
                service_id: item.id,
            }));
            setPackageList(processedPackages);
        } catch (error) {
            setError(error.message);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchServices();
        fetchPackages();
    }, [fetchServices, fetchPackages]);
    useEffect(() => {
        let prefilledData = [];
        try {
            if (typeof clientData.services === 'string') {
                prefilledData = JSON.parse(clientData.services) || [];
            } else if (Array.isArray(clientData.services)) {
                prefilledData = clientData.services;
            }
        } catch (error) {
            console.error('Error parsing PrefilledData:', error);
        }
    
        // Ensure prefilledData is an array
        if (!Array.isArray(prefilledData)) {
            prefilledData = [];
        }
    
        const updatedServiceData = serviceData.map(item => {
            const prefilledService = prefilledData.find(service => service.serviceId === item.service_id) || {};
            return {
                ...item,
                price: prefilledService.price || priceData[item.service_id]?.price || '',
                packages: prefilledService.packages || {},
            };
        });
    
        setPaginated(updatedServiceData);
        setTotalResults(updatedServiceData.length);
    
        const initialSelectedServices = updatedServiceData.reduce((acc, item) => {
            if (prefilledData.some(service => service.serviceId === item.service_id)) {
                acc[item.service_id] = true;
            }
            return acc;
        }, {});
        setSelectedServices(initialSelectedServices);


        setClientData(prev => ({ ...prev, services: prefilledData }));
        console.log('serviceData-before-change', updatedServiceData);
    }, [serviceData, clientData.services, priceData, setTotalResults]);
    console.log('selectedServices',selectedServices);


console.log('paginated',paginated);
console.log('selectedPackages',selectedPackages)


   
    const handleCheckboxChange = (serviceId) => {
        console.log("Current Selection Before Change:", selectedServices);
        
        setSelectedServices((prev) => {
            const isCurrentlySelected = !!prev[serviceId];
    
            const updatedSelection = {
                ...prev,
                [serviceId]: !isCurrentlySelected,
            };
    
            console.log("Updated Selection:", updatedSelection);
        
    
            const updatedServices = paginated.map(service => {
                let packages = selectedPackages[service.service_id] || service.packages || {};
    
                if (Array.isArray(packages)) {
                    packages = Object.fromEntries(
                        packages.map(pkgId => {
                            const pkg = packageList.find(p => p.id === pkgId);
                            return [pkgId.toString(), pkg ? pkg.title : pkgId]; 
                        })
                    );
                }
    
                if (updatedSelection[service.service_id]) {
                 
                    return {
                        serviceId: service.service_id,
                        serviceTitle: service.service_title,
                        price: priceData[service.service_id]?.price || service.price || '',
                        packages, 
                    };
                } else {
                    
                    return {
                        serviceId: service.service_id,
                        serviceTitle: service.service_title,
                        price: '',
                        packages: {}, 
                    };
                }
            });
    
        
            const filteredServices = updatedServices.filter(service => updatedSelection[service.serviceId]);
    
            console.log("Filtered Services:", filteredServices);
    
            
            setClientData(prev => ({ ...prev, services: filteredServices }));
    
            
            const serviceDetails = paginated.find(service => service.service_id === serviceId);
            if (serviceDetails) {
                const details = `
                    Service ID: ${serviceDetails.service_id}
                    Service Name: ${serviceDetails.service_title}
                    Price: ${priceData[serviceId]?.price || serviceDetails.price || ''}
                    Packages: ${JSON.stringify(isCurrentlySelected ? selectedPackages[serviceId] || {} : {})}
                `;
               
            }
    
            return updatedSelection; 
        });
    };
    
    
    // const handlePackageChange = (selectedList, serviceId) => {
    //     const updatedPackages = selectedList.map(item => item.id);
    //     console.log("Selected Packages for service:", serviceId, updatedPackages);
    
    //     // Alert the selected packages
    //     alert(`Selected packages for service ${serviceId}: ${updatedPackages.join(', ')}`);
    
    //     // Update the selected packages state
    //     setSelectedPackages((prev) => ({
    //         ...prev,
    //         [serviceId]: updatedPackages, // Update only the packages for the specific service
    //     }));
    
    //     setClientData((prev) => {
    //         const updatedServices = Array.isArray(prev.services) ? prev.services : [];
    //         return updatedServices.map(service => {
    //             if (service.serviceId === serviceId) {
    //                 // Create a packages object based on the selected list
    //                 const packages = selectedList.reduce((acc, item) => {
    //                     acc[item.id] = item.name; // Create a key-value pair
    //                     return acc;
    //                 }, {});
    
    //                 // Return the service with updated packages, keeping price and serviceId intact
    //                 return { ...service, packages }; 
    //             }
    //             return service; // Return the unchanged service for others
    //         });
    //     });
    // };
    
    function updateServicePackages(obj, serviceID, serviceList) {
        // Iterate over the services to find the matching serviceId
        let serviceFound = false;
    
        for (let service of obj.services) {
            if (service.serviceId === serviceID) {
                // Convert serviceList into key-value pairs where id is the key and name is the value
                let newPackages = {};
                serviceList.forEach((item) => {
                    newPackages[item.id] = item.name;
                });
    
                // Update the service packages
                service.packages = {
                    ...service.packages, // Retain existing packages
                    ...newPackages      // Merge new packages
                };
                serviceFound = true;
                break; // Exit loop once service is found and updated
            }
        }
    
        if (!serviceFound) {
            console.log("Service not found.");
        } else {
            console.log("Service updated successfully.");
        }
    
        return obj;
    }



    const handlePackageChange = (selectedList, serviceId) => {
        let updatedObj = updateServicePackages(clientData, serviceId, selectedList);
        setClientData(updatedObj);
    };
    
  
    const handleChange = (e, serviceId) => {
        const { name, value } = e.target;
        console.log(`Changing ${name} for service ${serviceId} to ${value}`);
    
        setPriceData(prev => ({ ...prev, [serviceId]: { [name]: value } }));
    
        setClientData(prev => {
            console.log("Current Client Data Services:", prev.services); // Log current services
    
            const updatedServices = (Array.isArray(prev.services) ? prev.services : []).map(service => {
                if (service.serviceId === serviceId) {
                    return { ...service, price: value };
                }
                return service;
            });
    
            console.log("Updated Client Data Services:", updatedServices);
            return { ...prev, services: updatedServices };
        });
    };
    
  
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

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
                    {paginated.map((item) => (
                        <tr key={item.service_id}>
                            <td className="py-2 md:py-3 px-4 border-l border-r border-b whitespace-nowrap">
                            <input
                            type="checkbox"
                            className='me-2'
                            checked={!!selectedServices[item.service_id]} // Ensure this is derived directly from state
                            onChange={() => handleCheckboxChange(item.service_id)}
                        />
                         {item.service_title}
                            </td>
                            <td className="py-2 md:py-3 px-4 border-r border-b whitespace-nowrap">
                                <input
                                    type="number"
                                    name="price"
                                    value={item.price}
                                    onChange={(e) => handleChange(e, item.service_id)}
                                    className='outline-none'
                                />
                            </td>
                            <td className="py-2 md:py-3 px-4 border-r border-b whitespace-nowrap uppercase text-left">
                                <Multiselect
                                    options={packageList.map(pkg => ({ name: pkg.title, id: pkg.id }))}
                                    selectedValues={Object.entries(item.packages).map(([id, name]) => ({ name, id }))}
                                    onSelect={(selectedList) => handlePackageChange(selectedList, item.service_id)}
                                    onRemove={(selectedList) => handlePackageChange(selectedList, item.service_id)}
                                    displayValue="name"
                                    className='text-left'
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {paginated.length > 0 && <Pagination />}
        </div>
    );
};

export default ServiceEditForm;
