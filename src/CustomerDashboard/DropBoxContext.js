import React, { createContext, useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';

const DropBoxContext = createContext();

export const DropBoxProvider = ({ children }) => {
    const API_URL = useApi();
    const [services, setServices] = useState([]);
    const [uniquePackages, setUniquePackages] = useState([]);
    const [listData, setListData] = useState([]);
    const [selectedDropBox, setSelectedDropBox] = useState(null);
    const [branchId, setBranchId] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [token, setToken] = useState(null);

    // Fetch data from localStorage once and store in state to avoid re-fetching on every render
    useEffect(() => {
        const branch = JSON.parse(localStorage.getItem('branch'));
        setBranchId(branch?.id);
        setCustomerId(branch?.customer_id);
        setToken(localStorage.getItem('branch_token'));
    }, []); // Empty dependency array means this runs once when the component mounts

    const handleEditDrop = (pkg) => {
        setSelectedDropBox(pkg);
    };

    const fetchServices = useCallback(async () => {
        if (!branchId || !customerId || !token) return; // Exit early if data is not ready

        try {
            const response = await fetch(`${API_URL}/branch/customer-info?customer_id=${customerId}&branch_id=${branchId}&branch_token=${token}`, {
                method: "GET",
                redirect: "follow"
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                return;
            }

            const data = await response.json();
            if (data.customers.length > 0) {
                const customer = data.customers[0];
                const customer_code = customer.client_unique_id;
                localStorage.setItem('customer_code', customer_code);

                const parsedServices = customer.services && customer.services !== '""' ? JSON.parse(customer.services) : []; // Check for non-empty services

                setServices(parsedServices);

                const packageSet = new Set();
                const uniquePackagesList = [];

                parsedServices.forEach(service => {
                    if (service.packages) { // Ensure packages exist
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
                Swal.fire('No customers found');
            }


        } catch (error) {
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        }
    }, [API_URL, branchId, customerId, token]);

 


    const fetchClient = useCallback(async () => {
        if (!branchId || !token) return;

        try {
            const response = await fetch(`${API_URL}/branch/candidate-application/list?branch_id=${branchId}&_token=${token}`, {
                method: "GET",
                redirect: "follow"
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                return;
            }

            const data = await response.json();
            const newToken = data?._token || data?.token;
            if (newToken) {
                localStorage.setItem("_token", newToken);
            }
            setListData(data.candidateApplications || []);
        } catch (error) {
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        }
    }, [API_URL, branchId, token]);

    const fetchClientDrop = useCallback(async () => {
        if (!branchId || !token) return;

        try {
            const response = await fetch(`${API_URL}/branch/client-application/list?branch_id=${branchId}&_token=${token}`, {
                method: "GET",
                redirect: "follow"
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                return;
            }

            const data = await response.json();
            const newToken = data?._token || data?.token;
            if (newToken) {
                localStorage.setItem("_token", newToken);
            }
            setListData(data.clientApplications || []);
        } catch (error) {
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        }
    }, [API_URL, branchId, token]);


useEffect(()=>{
    fetchServices();
    fetchClient();
    fetchClientDrop()
},[fetchServices,fetchClient,fetchClientDrop])
  

    return (
        <DropBoxContext.Provider value={{
            services,
            fetchClient,
            fetchClientDrop,
            uniquePackages,
            handleEditDrop,
            setServices,
            listData,
            setListData,
            selectedDropBox,
            setSelectedDropBox,
            setUniquePackages,
            fetchServices
        }}>
            {children}
        </DropBoxContext.Provider>
    );
};

export default DropBoxContext;
