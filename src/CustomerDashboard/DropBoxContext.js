import React, { createContext, useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';

const DropBoxContext = createContext();

export const DropBoxProvider = ({ children }) => {
    const API_URL = useApi();
    const [services, setServices] = useState([]);
    const [uniquePackages, setUniquePackages] = useState([]);
    const [listData, setListData] = useState([]);
    const [candidateListData, setCandidateListData] = useState([]);
    const [selectedDropBox, setSelectedDropBox] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [branchId, setBranchId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [candidateLoading, setCandidateLoading] = useState(false);
    const [token, setToken] = useState(null);



    const handleEditDrop = (pkg) => {
        setSelectedDropBox(pkg);
    };
    const handleEditCandidate = (pkg) => {
        setSelectedCandidate(pkg);
    };

    const fetchServices = useCallback(async () => {
        setServicesLoading(true);
        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const customer_id = JSON.parse(localStorage.getItem("branch"))?.customer_id;
        const _token = localStorage.getItem("branch_token");
        if (!branch_id || !_token) {
            setServicesLoading(false);
            return;

        }

        try {
            const response = await fetch(`${API_URL}/branch/customer-info?customer_id=${customer_id}&branch_id=${branch_id}&branch_token=${_token}`, {
                method: "GET",
                redirect: "follow"
            });

            const data = await response.json();

            // Store new token, even if response was not ok
            const newToken = data?._token || data?.token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
                setToken(newToken);
            }

            if (!response.ok) {
                Swal.fire('Error!', `An error occurred: ${data.message}`, 'error');
                return;
            }

            if (data.customers) {
                const customer = data.customers;
                const customer_code = customer.client_unique_id;
                localStorage.setItem('customer_code', customer_code);
                const parsedServices = customer.services && customer.services !== '""' ? JSON.parse(customer.services) : [];
                setServices(parsedServices);
                const uniquePackagesList = [];
                const packageSet = new Set();
                parsedServices.forEach(service => {
                    if (service.packages) {
                        Object.keys(service.packages).forEach(packageId => {
                            if (!packageSet.has(packageId)) {
                                packageSet.add(packageId);
                                uniquePackagesList.push({ id: packageId, name: service.packages[packageId] });
                            }
                        });
                    }
                });
                setUniquePackages(uniquePackagesList);
            } else {
                Swal.fire('Error!', `An error occurred: ${data.message}`, 'error');
            }

        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        } finally {
            setServicesLoading(false);
        }
    }, [API_URL, branchId, token]);

    const fetchClient = useCallback(async () => {
        setCandidateLoading(true);
        const branchId = JSON.parse(localStorage.getItem("branch"))?.id;
        const customerId = JSON.parse(localStorage.getItem("branch"))?.customer_id;
        const token = localStorage.getItem("branch_token");
    
        if (!branchId || !token) {
            setCandidateLoading(false);
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/branch/candidate-application/list?customer_id=${customerId}&branch_id=${branchId}&_token=${token}`, {
                method: "GET",
                redirect: "follow"
            });
    
            const result = await response.json();
    
            const newToken = result?._token || result?.token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
                setToken(newToken);
            }
    
            if (!response.ok) {
                const errorMessage = result?.message || 'Something went wrong. Please try again later.';
                Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            } else {
                setCandidateListData(result.data?.candidateApplications || []);
                if (result.data?.customerInfo) {
                    const customer = result.data.customerInfo;
                    const customerCode = customer.client_unique_id;
                    localStorage.setItem('customer_code', customerCode);
                    const services = customer.services && customer.services !== '""' ? JSON.parse(customer.services) : [];
                    setServices(services);
    
                    const uniquePackages = [];
                    const packageSet = new Set();
                    services.forEach(service => {
                        if (service.packages) {
                            Object.keys(service.packages).forEach(packageId => {
                                if (!packageSet.has(packageId)) {
                                    packageSet.add(packageId);
                                    uniquePackages.push({ id: packageId, name: service.packages[packageId] });
                                }
                            });
                        }
                    });
                    setUniquePackages(uniquePackages);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        } finally {
            setCandidateLoading(false);
        }
    }, [API_URL, setCandidateLoading, setToken, setCandidateListData, setServices, setUniquePackages]);
    
    


    const fetchClientDrop = useCallback(async () => {
        setLoading(true);
        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const customer_id = JSON.parse(localStorage.getItem("branch"))?.customer_id;
        const _token = localStorage.getItem("branch_token");
        if (!branch_id || !_token) {
            setLoading(false);
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/branch/client-application/list?customer_id=${customer_id}&branch_id=${branch_id}&_token=${_token}`, {
                method: "GET",
                redirect: "follow"
            });
    
            const result = await response.json();
    
            const newToken = result?._token || result?.branch_token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
                setToken(newToken);
            }
    
            if (!response.ok) {
                const errorMessage = result?.message || 'Something went wrong. Please try again.';
                Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                });
                return;
            }
    
            // Set client application data if available
            setListData(result.data.clientApplications || []);
    
            if (result.data.customerInfo) {
                const customer = result.data.customerInfo;
                const customer_code = customer.client_unique_id;
                localStorage.setItem('customer_code', customer_code);
                const parsedServices = customer.services && customer.services !== '""' ? JSON.parse(customer.services) : [];
                setServices(parsedServices);
                const uniquePackagesList = [];
                const packageSet = new Set();
                parsedServices.forEach(service => {
                    if (service.packages) {
                        Object.keys(service.packages).forEach(packageId => {
                            if (!packageSet.has(packageId)) {
                                packageSet.add(packageId);
                                uniquePackagesList.push({ id: packageId, name: service.packages[packageId] });
                            }
                        });
                    }
                });
                setUniquePackages(uniquePackagesList);
            }
    
        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);
    

    return (
        <DropBoxContext.Provider value={{
            services,
            setSelectedCandidate,
            fetchClient,
            fetchClientDrop,
            uniquePackages,
            handleEditDrop,
            handleEditCandidate,
            setServices,
            listData,
            setListData,
            selectedDropBox,
            setSelectedDropBox,
            setUniquePackages,
            fetchServices,
            selectedCandidate,
            setSelectedCandidate,
            candidateLoading,
            loading,
            servicesLoading,
            candidateListData
        }}>
            {children}
        </DropBoxContext.Provider>
    );
};

export default DropBoxContext;
