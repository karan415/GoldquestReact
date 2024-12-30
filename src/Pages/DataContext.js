
import React, { createContext, useState, useCallback, useContext } from 'react';
import Swal from 'sweetalert2';
import { useApi } from '../ApiContext';
const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const API_URL = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [listData, setListData] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [branches, setBranches] = useState([]);
    const [services, setServices] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
    
        const queryParams = new URLSearchParams({
            admin_id: admin_id || '',
            _token: storedToken || ''
        }).toString();
    
        fetch(`${API_URL}/customer/list?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((response) => {
              if (response.message && response.message.toLowerCase().includes("invalid") && response.message.toLowerCase().includes("token")) {
                      Swal.fire({
                        title: "Session Expired",
                        text: "Your session has expired. Please log in again.",
                        icon: "warning",
                        confirmButtonText: "Ok",
                      }).then(() => {
                        // Redirect to admin login page
                        window.location.href = "/admin-login"; // Replace with your login route
                      });
                    }
            if (!response.ok) {
                return response.json().then((result) => {
                    Swal.fire({
                        title: 'Error!',
                        text: result.message || `An error occurred: ${response.statusText}`,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                    throw new Error(result.message || response.statusText);
                });
            }
            return response.json();
        })
        .then((result) => {
            const newToken = result._token || result.token;
            if (newToken) {
                localStorage.setItem("_token", newToken);
            }
              if (result.message && result.message.toLowerCase().includes("invalid") && result.message.toLowerCase().includes("token")) {
                      Swal.fire({
                        title: "Session Expired",
                        text: "Your session has expired. Please log in again.",
                        icon: "warning",
                        confirmButtonText: "Ok",
                      }).then(() => {
                        // Redirect to admin login page
                        window.location.href = "/admin-login"; // Replace with your login route
                      });
                    }
    
            // Extract customers
            const customers = result?.customers || [];
            setListData(customers);
    
            // Create a mapping of customer ID to their services
            const customerServices = customers.map((customer) => {
                let services = [];
                try {
                    services = JSON.parse(customer.services || '[]');
                } catch (error) {
                    console.error('Failed to parse services JSON for customer:', customer.id, error);
                }
                return { customerId: customer.main_id, services };
            });
    
            setServices(customerServices); // Update services state
            setTotalResults(result?.totalResults || 0);
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            setError('Failed to load data');
        })
        .finally(() => setLoading(false));
    }, []);
    
    
    


    return (
        <DataContext.Provider value={{ loading, error,setError, listData,services, setBranches,totalResults, setLoading, setError, isOpen, setIsOpen, fetchData, branches }}>
            {children}
        </DataContext.Provider>
    );
};
