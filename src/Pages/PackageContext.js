import React, { createContext, useState, useContext,useCallback } from 'react';
import Swal from 'sweetalert2';
import PaginationContext from './PaginationContext';
const PackageContext = createContext();

export const usePackage = () => useContext(PackageContext);

export const PackageProvider = ({ children }) => {
    const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
    const [packageList, setPackageList] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [error, setError] = useState(null);
    const { setTotalResults } = useContext(PaginationContext);

    const updatePackageList = (updatedPackages) => {
        setPackageList(updatedPackages);
    };

    const editPackage = (pkg) => {
        setSelectedPackage(pkg);
    };

    const clearSelectedPackage = () => {
        setSelectedPackage(null);
    };
    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null); 

        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        const queryParams = new URLSearchParams({
            admin_id: admin_id || '',
            _token: storedToken || ''
        }).toString();

        fetch(`https://goldquestreact.onrender.com/package/list?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                if (!response.ok) {
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
                const newToken = data._token || data.token; // Use result.token if result._token is not available
                if (newToken) {
                    localStorage.setItem("_token", newToken); // Replace the old token with the new one
                }
                console.log('Fetched data:', data);
                setData(data.packages || []);
                setTotalResults(data.totalResults || 0);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, [setTotalResults]);

    return (
        <PackageContext.Provider
            value={{
                packageList,
                selectedPackage,
                updatePackageList,
                editPackage,
                clearSelectedPackage,
                data,setData,loading,setLoading,fetchData,setError,error
            }}
        >
            {children}
        </PackageContext.Provider>
    );
};
