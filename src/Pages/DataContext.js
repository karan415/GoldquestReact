
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
                    throw new Error('Network response was not ok');
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
                    throw new Error('Network response was not ok');
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

    const toggleAccordion = useCallback((id) => {
        setBranches([]);
        setOpenAccordionId((prevId) => (prevId === id ? null : id));
        setLoading(true);
        setIsOpen(null);
        setError(null);
    
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
    
        fetch(`${API_URL}/branch/list-by-customer?customer_id=${id}&admin_id=${admin_id}&_token=${storedToken}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
          .then((response) => {
            return response.json().then(result => {
              const newToken = result._token || result.token;
              if (newToken) {
                localStorage.setItem("_token", newToken);
              }
              if (!response.ok) {
                Swal.fire({
                  title: 'Error!',
                  text: `An error occurred: ${result.message}`,
                  icon: 'error',
                  confirmButtonText: 'Ok'
                });
                throw new Error('Network response was not ok');
              }
              return result;
            });
          })
          .then((data) => {
            setBranches(data.branches || []);
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            setError('Failed to load data');
          })
          .finally(() => setLoading(false));
      }, [API_URL]);

    return (
        <DataContext.Provider value={{ loading, error, listData, totalResults, setLoading, setError, isOpen, setIsOpen, fetchData, toggleAccordion, branches, openAccordionId }}>
            {children}
        </DataContext.Provider>
    );
};
