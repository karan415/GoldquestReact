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
    const [loading, setLoading] = useState(null);
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
        setLoading(true); // Set loading to true at the start
    
        if (!branchId || !customerId || !token) {
            setLoading(false); // Reset loading if required data is not available
            return; // Exit early if data is not ready
        }
    
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
    
            // Store new token if available
            const newToken = data?.branch_token || data?.token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
            }
    
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
            console.error('Fetch error:', error); // Log the error for debugging purposes
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(false); // Reset loading state in finally block
        }
    }, [API_URL, branchId, customerId, token]);
    


    const fetchClient = useCallback(async () => {
        setLoading(true); // Set loading to true at the start
    
        if (!branchId || !token) {
            setLoading(false); // Ensure loading is set to false if branchId or token is missing
            return; // Exit early if branchId or token is not available
        }
    
        try {
            const response = await fetch(`${API_URL}/branch/candidate-application/list?branch_id=${branchId}&_token=${token}`, {
                method: "GET",
                redirect: "follow"
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                return; // Exit if there was an error
            }
    
            const data = await response.json();
    
            // Store new token if available
            const newToken = data?.branch_token || data?.token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken); // Store the new token in local storage
            }
    
            setListData(data.candidateApplications || []); // Update state with candidate applications
    
        } catch (error) {
            console.error('Fetch error:', error); // Log the error for debugging purposes
            Swal.fire('Error!', 'An unexpected error occurred.', 'error'); // Show error message to user
        } finally {
            setLoading(false); // Reset loading state in finally block
        }
    }, [API_URL, branchId, token]);
    
    

    const fetchClientDrop = useCallback(async () => {
        setLoading(true);
        if (!branchId || !token) {
            setLoading(false); // Ensure loading is set to false if branchId or token is missing
            return;
        }
    
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
            const { clientApplications = [], branch_token: newToken } = data; // Destructure and provide default value
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
            }
            setListData(clientApplications);
        } catch (error) {
            console.error('Fetch error:', error); // Log the error for debugging purposes
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(false);
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
            fetchServices,loading
        }}>
            {children}
        </DropBoxContext.Provider>
    );
};

export default DropBoxContext;
