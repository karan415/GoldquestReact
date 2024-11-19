import React, { createContext, useState, useContext } from 'react';
import Swal from 'sweetalert2';
import { useData } from './DataContext';
import { useApi } from '../ApiContext';
import axios from 'axios';
const ClientEditContext = createContext();


export const ClientEditProvider = ({ children }) => {
    const [files, setFiles] = useState([]);
    const API_URL = useApi();
    const [loading, setLoading] = useState(false);

    const [clientData, setClientData] = useState();


    const uploadCustomerLogo = async (admin_id, storedToken, customerInsertId) => {


        const fileCount = Object.keys(files).length;
        for (const [index, [key, value]] of Object.entries(files).entries()) {
            const customerLogoFormData = new FormData();
            customerLogoFormData.append('admin_id', admin_id);
            customerLogoFormData.append('_token', storedToken);
            customerLogoFormData.append('customer_code', clientData.client_unique_id);
            customerLogoFormData.append('customer_id', customerInsertId);
            for (const file of value) {
                customerLogoFormData.append('images', file);
                customerLogoFormData.append('upload_category', key);
            }
            if (fileCount === (index + 1)) {
                customerLogoFormData.append('company_name', clientData.name);
            }

            try {
                await axios.post(
                    `${API_URL}/customer/upload`,
                    customerLogoFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            } catch (err) {
                Swal.fire('Error!', `An error occurred while uploading logo: ${err.message}`, 'error');
            }
        }
    };

    const handleClientChange = (e, index) => {
        const { name, value, type, files } = e.target;
        setClientData(prevData => ({
            ...prevData,
            [name]: type === 'file' ? files[0] : value,
        }));
    };

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
        setLoading(true); // Start loading
    
        if (!clientData.name || !clientData.client_unique_id) {
            Swal.fire('Error!', 'Missing required fields: Branch ID, Name, Email', 'error');
            setLoading(false); // Stop loading if there's an error
            return;
        }
    
        const raw = JSON.stringify({
            ...clientData,
            admin_id,
            _token: storedToken
        });
    
        const requestOptions = {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: raw,
            redirect: "follow"
        };
    
        try {
            const response = await fetch(`${API_URL}/customer/update`, requestOptions);
            const contentType = response.headers.get("content-type");
    
            if (!response.ok) {
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                } else {
                    const errorText = await response.text();
                    Swal.fire('Error!', `An error occurred: ${errorText}`, 'error');
                }
                return;
            }
    
            const data = contentType.includes("application/json") ? await response.json() : {};
            const customerInsertId = clientData.customer_id;
            const newToken = data._token || data.token;
    
            if (newToken) {
                localStorage.setItem("_token", newToken);
            }
    
            uploadCustomerLogo(admin_id, storedToken, customerInsertId);
            Swal.fire('Success!', 'Branch updated successfully.', 'success');
    
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            Swal.fire('Error!', 'There was a problem with the fetch operation.', 'error');
        } finally {
            setLoading(false); // Stop loading
        }
    };
    


    return (
        <ClientEditContext.Provider value={{ clientData, setClientData, handleClientChange, handleClientSubmit, setFiles, files,loading }}>
            {children}
        </ClientEditContext.Provider>
    );
};


export const useEditClient = () => useContext(ClientEditContext);
