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
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const branch = JSON.parse(localStorage.getItem('branch'));
        setBranchId(branch?.id);
        setToken(localStorage.getItem('branch_token'));
    }, []);

    const handleEditDrop = (pkg) => {
        setSelectedDropBox(pkg);
    };

    const fetchServices = useCallback(async () => {
        setLoading(true);
        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const customer_id = JSON.parse(localStorage.getItem("branch"))?.customer_id;
        const _token = localStorage.getItem("branch_token");
        if (!branch_id || !_token) {
            setLoading(false);
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

            if (data.customers.length > 0) {
                const customer = data.customers[0];
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
                Swal.fire('No customers found');
            }

        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    }, [API_URL, branchId, token]);

    const fetchClient = useCallback(async () => {
        setLoading(true);
        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const _token = localStorage.getItem("branch_token");
        if (!branch_id || !_token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/branch/candidate-application/list?branch_id=${branch_id}&_token=${_token}`, {
                method: "GET",
                redirect: "follow"
            });

            const data = await response.json();

            const newToken = data?._token || data?.token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
                setToken(newToken);
            }

            if (!response.ok) {
                Swal.fire('Error!', `An error occurred: ${data.message}`, 'error');
                return;
            }

            setListData(data.candidateApplications || []);

        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    }, [API_URL, branchId, token]);

    const fetchClientDrop = useCallback(async () => {
        setLoading(true);
        const branch_id = JSON.parse(localStorage.getItem("branch"))?.id;
        const _token = localStorage.getItem("branch_token");
        if (!branch_id || !_token) {
            setLoading(false);

            return;
        }

        try {
            const response = await fetch(`${API_URL}/branch/client-application/list?branch_id=${branch_id}&_token=${_token}`, {
                method: "GET",
                redirect: "follow"
            });

            const data = await response.json();

            const newToken = data?._token || data?.branch_token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
                setToken(newToken);
            }

            if (!response.ok) {
                Swal.fire('Error!', `An error occurred: ${data.message}`, 'error');
                return;
            }

            setListData(data.clientApplications || []);

        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    }, [API_URL, branchId, token]);

    useEffect(() => {
        const initializeFetch = () => {
            fetchServices();
            fetchClient();
            fetchClientDrop();
        };

        window.onload = initializeFetch; // Trigger fetches on window load

        return () => window.onload = null; // Cleanup on unmount
    }, [fetchServices, fetchClient, fetchClientDrop]);

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
            fetchServices,
            loading
        }}>
            {children}
        </DropBoxContext.Provider>
    );
};

export default DropBoxContext;
