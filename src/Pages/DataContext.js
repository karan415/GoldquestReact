
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
    const [openAccordionId, setOpenAccordionId] = useState(null);
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
                if (!response.ok) {
                    Swal.fire({
                        title: 'Error!',
                        text: `An error occurred: ${response.statusText}`,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                const newToken = data._token || data.token;
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
                setListData(data.customers || []);
                setTotalResults(data.totalResults || 0);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, []);

    const toggleAccordion = useCallback((id) => {
        setBranches([]);
        setOpenAccordionId((prevId) => (prevId === id ? null : id));
        setLoading(true);
        setIsOpen(null)
        setError(null);

        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
       
            fetch(`${API_URL}/branch/list-by-customer?customer_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        const newToken = response._token || response.token;
                        if (newToken) {
                            localStorage.setItem("_token", newToken);
                        }
                        Swal.fire({
                            title: 'Error!',
                            text: `An error occurred: ${response.message}`,
                            icon: 'error',
                            confirmButtonText: 'Ok'
                        });
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    const newToken = data._token || data.token;
                    if (newToken) {
                        localStorage.setItem("_token", newToken);
                    }
                    setBranches(data.branches || []);
                    setTotalResults(data.totalResults || 0);

                })
                .catch((error) => {
                    console.error('Fetch error:', error);
                    setError('Failed to load data');
                })
                .finally(() => setLoading(false));
    }, [setBranches, setTotalResults])
    

    return (
        <DataContext.Provider value={{ loading, error, listData, totalResults,setLoading,setError,isOpen,setIsOpen, fetchData,toggleAccordion,branches,openAccordionId }}>
            {children}
        </DataContext.Provider>
    );
};
