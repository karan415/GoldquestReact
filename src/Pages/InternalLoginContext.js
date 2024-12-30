import React, { createContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [editAdmin, setEditAdmin] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: "",
        name: "",
        mobile: "",
        email: "",
        password: "",
        role: "",
    });
    const [data, setData] = useState([]); // State to store the response data
    const [loading, setLoading] = useState(true); // Loading state
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");


    const handleEditAdmin = (selectedAdmin) => {
        setEditAdmin(true)
        setFormData({
            employee_id: selectedAdmin.emp_id || '',
            name: selectedAdmin.name || '',
            mobile: selectedAdmin.mobile || '',
            email: selectedAdmin.email || '',
            password: selectedAdmin.password || '',
            role: selectedAdmin.role || '',
            id: selectedAdmin.id || '',
            status: selectedAdmin.status || ''
        });

        console.log('selectedAdmin', selectedAdmin)
    }
    const fetchData = async () => {
        setLoading(true); // Start loading

        try {
            const response = await axios.get("https://octopus-app-www87.ondigitalocean.app/admin/list", {
                params: {
                    admin_id: admin_id,
                    _token: storedToken
                }
            });
            console.log('response', response)

            const newToken = response._token || response.token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
            }
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

            setData(response.data.admins || []); // Set the response data in state
        } catch (error) {
            console.error(error.message); // Set error message if the request fails
        } finally {
            setLoading(false); // End loading
        }
    };


    return (
        <LoginContext.Provider value={{
            data, loading, formData, fetchData, setFormData, handleEditAdmin, editAdmin
        }}>
            {children}
        </LoginContext.Provider>
    );
};

export default LoginContext;
