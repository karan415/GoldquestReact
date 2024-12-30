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
    const [branchId, setBranchId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [candidateLoading, setCandidateLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [isEditClient, setIsEditClient] = useState(false);
    const [isEditCandidate, setIsEditCandidate] = useState(false);
    const branchEmail = JSON.parse(localStorage.getItem("branch"))?.email;

    const [clientInput, setClientInput] = useState({
        name: '',
        employee_id: '',
        spoc: '',
        location: '',
        batch_number: '',
        sub_client: '',
        services: [],
        package: [],
        client_application_id: '',
    });
    const [input, setInput] = useState({
        name: "",
        employee_id: "",
        mobile_number: "",
        email: "",
        services: [],
        package: [],
        candidate_application_id: ''
    });


    const handleEditDrop = (selectedDropBox) => {
        const parsedServices = Array.isArray(selectedDropBox.services)
            ? selectedDropBox.services
            : selectedDropBox.services ? selectedDropBox.services.split(',') : [];

        setClientInput({
            name: selectedDropBox.name || "",
            employee_id: selectedDropBox.employee_id || "",
            spoc: selectedDropBox.single_point_of_contact || "",
            location: selectedDropBox.location || "",
            batch_number: selectedDropBox.batch_number || "",
            sub_client: selectedDropBox.sub_client || "",
            services: parsedServices, // Make sure services is always an array
            package: selectedDropBox.package || [],
            client_application_id: selectedDropBox.id || "",
        });
        setIsEditClient(true);

    }
    const handleEditCandidate = (selectedCandidate) => {

        if (selectedCandidate) {
            const parsedServices = Array.isArray(selectedCandidate.services)
                ? selectedCandidate.services
                : selectedCandidate.services ? selectedCandidate.services.split(',') : [];

            setInput({
                name: selectedCandidate.name,
                employee_id: selectedCandidate.employee_id,
                mobile_number: selectedCandidate.mobile_number,
                email: selectedCandidate.email,
                services: parsedServices,
                package: selectedCandidate.packages || [],
                candidate_application_id: selectedCandidate.id || ''
            });
            setIsEditClient(true);
        } else {
            setInput({
                name: "",
                employee_id: "",
                mobile_number: "",
                email: "",
                services: [],
                package: [],
                candidate_application_id: ""
            });
            setIsEditClient(false);
        }
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
            if (data.message && data.message.toLowerCase().includes("invalid") && data.message.toLowerCase().includes("token")) {
                Swal.fire({
                    title: "Session Expired",
                    text: "Your session has expired. Please log in again.",
                    icon: "warning",
                    confirmButtonText: "Ok",
                }).then(() => {
                    // Redirect to admin login page
                    window.open(`/customer-login?email=${encodeURIComponent(branchEmail)}`, '_blank');
                });
            }

            if (!response.ok) {
                Swal.fire('Error!', `An error occurred: ${data.message}`, 'error');
                if (response.message && response.message.toLowerCase().includes("invalid") && response.message.toLowerCase().includes("token")) {
                    Swal.fire({
                        title: "Session Expired",
                        text: "Your session has expired. Please log in again.",
                        icon: "warning",
                        confirmButtonText: "Ok",
                    }).then(() => {
                        // Redirect to admin login page
                        window.open(`/customer-login?email=${encodeURIComponent(branchEmail)}`, '_blank');
                    });
                }
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
            if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
                Swal.fire({
                    title: "Session Expired",
                    text: "Your session has expired. Please log in again.",
                    icon: "warning",
                    confirmButtonText: "Ok",
                }).then(() => {
                    // Redirect to admin login page
                    window.open(`/customer-login?email=${encodeURIComponent(branchEmail)}`, '_blank');
                });
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
                        window.open(`/customer-login?email=${encodeURIComponent(branchEmail)}`, '_blank');
                    });
                }
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
            if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
                Swal.fire({
                    title: "Session Expired",
                    text: "Your session has expired. Please log in again.",
                    icon: "warning",
                    confirmButtonText: "Ok",
                }).then(() => {

                    if (response.message && response.message.toLowerCase().includes("invalid") && response.message.toLowerCase().includes("token")) {
                        Swal.fire({
                            title: "Session Expired",
                            text: "Your session has expired. Please log in again.",
                            icon: "warning",
                            confirmButtonText: "Ok",
                        }).then(() => {
                            // Redirect to admin login page
                            window.open(`/customer-login?email=${encodeURIComponent(branchEmail)}`, '_blank');
                        });
                    }                         // Redirect to admin login page
                    window.open(`/customer-login?email=${encodeURIComponent(branchEmail)}`, '_blank');
                });
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
            setClientInput,
            fetchClient,
            fetchClientDrop,
            uniquePackages,
            handleEditDrop,
            handleEditCandidate,
            setServices,
            listData,
            setListData,
            setUniquePackages,
            fetchServices,
            candidateLoading,
            loading,
            clientInput,
            servicesLoading,
            candidateListData,
            isEditClient, setIsEditClient, input, setInput, isEditCandidate, setIsEditCandidate
        }}>
            {children}
        </DropBoxContext.Provider>
    );
};

export default DropBoxContext;
