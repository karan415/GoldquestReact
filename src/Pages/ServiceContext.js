import React, { createContext, useState, useContext, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';
const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
    const API_URL = useApi();

    const [selectedService, setSelectedService] = useState(null);// Store Service list
    const [ServiceList, setServiceList] = useState([]); // Store package list
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const editService = (pkg) => {
        setSelectedService(pkg);
    };

    const updateServiceList = (newList) => {
        setServiceList(newList);
    };
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
            const storedToken = localStorage.getItem("_token");

            const queryParams = new URLSearchParams({
                admin_id: admin_id || '',
                _token: storedToken || '',
            }).toString();

            const res = await fetch(`${API_URL}/service/list?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await res.json();

            if (!res.ok || !result.status) {
                const errorMessage = result.message || 'An error occurred';
                Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'Ok',
                });
                setError(errorMessage);
                return;
            }

            // Handle new token
            const newToken = result._token || result.token;
            if (newToken) {
                localStorage.setItem('_token', newToken);
            }
            if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
                Swal.fire({
                    title: "Session Expired",
                    text: "Your session has expired. Please log in again.",
                    icon: "warning",
                    confirmButtonText: "Ok",
                }).then(() => {
                    // Redirect to admin login page
                    window.location.href = "admin-login"; // Replace with your login route
                });
            }

            // Process and set data
            const processedData = (result.services || []).map((item, index) => ({
                ...item,
                index: index + 1,
                title: item.title,
                group: item.group,
                description: item.description,
                sac_code: item.sac_code,
                short_code: item.short_code,
                id: item.id,
            }));

            setData(processedData);
        } catch (error) {
            // Show an alert for network or unexpected errors
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to load data',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
            console.error('Fetch error:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);


    return (
        <ServiceContext.Provider value={{ selectedService,setSelectedService, editService, ServiceList, updateServiceList, fetchData, loading, setData, data, error, setError }}>
            {children}
        </ServiceContext.Provider>
    );
};

export const useService = () => useContext(ServiceContext);
