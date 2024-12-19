
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
                // Check if response is not OK (i.e., status is not in the 2xx range)
                if (!response.ok) {
                    return response.json().then((result) => {
                        Swal.fire({
                            title: 'Error!',
                            text: result.message || `An error occurred: ${response.statusText}`,
                            icon: 'error',
                            confirmButtonText: 'Ok'
                        });
                        throw new Error(result.message || response.statusText);  // Throw error to skip next processing
                    });
                }
                return response.json(); // Continue processing if response is OK
            })
            .then((result) => {
                // Token handling (if any)
                const newToken = result._token || result.token;
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
    
                // Only update state if successful (result.success or any other condition you need)
                setListData(result?.customers || []);
                setTotalResults(result?.totalResults || 0);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, []);
    


    const fetchInactiveList = useCallback(() => {
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
                const result = response.json();
                const newToken = result._token || result.token;
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
                if (!response.ok) {
                    Swal.fire({
                        title: 'Error!',
                        text: `An error occurred: ${response.statusText}`,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
                return result;
            })
            .then((data) => {
                setListData(data.customers || []);
                setTotalResults(data.totalResults || 0);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, []);

  

    return (
        <DataContext.Provider value={{ loading, error,setError, listData, setBranches,totalResults, setLoading, setError, isOpen, setIsOpen, fetchData, branches }}>
            {children}
        </DataContext.Provider>
    );
};
