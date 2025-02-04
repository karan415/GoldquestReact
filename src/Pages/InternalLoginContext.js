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
        service_groups: [], // This will store the selected groups in an array

    });
    const [data, setData] = useState([]); // State to store the response data
    const [loading, setLoading] = useState(true); // Loading state
    const [parsedServiceGroups, setParsedServiceGroups] = useState([]);


    const handleEditAdmin = (selectedAdmin) => {
        setEditAdmin(true);
    
        // Safely parse service_groups if it's a stringified array, default to an empty array if invalid
        const parsedServiceGroups = (() => {
            try {
                return selectedAdmin.service_groups ? JSON.parse(selectedAdmin.service_groups) : [];
            } catch (error) {
                console.error("Failed to parse service_groups:", error);
                return [];
            }
        })();
    
        setFormData({
            employee_id: selectedAdmin.emp_id || '',
            name: selectedAdmin.name || '',
            mobile: selectedAdmin.mobile || '',
            email: selectedAdmin.email || '',
            password: selectedAdmin.password || '',
            role: selectedAdmin.role || '',
            id: selectedAdmin.id || '',
            status: selectedAdmin.status || '',
            service_groups: selectedAdmin.role !== "admin" ? parsedServiceGroups : [], // Clear service_groups for "admin" role
        });
    
        console.log('selectedAdmin', selectedAdmin);
    };
    

    const fetchData = async () => {
        const adminData = localStorage.getItem("admin");
        const storedToken = localStorage.getItem("_token");
    
        // If admin data or token is missing, show session expired message and stop execution
        if (!adminData || !storedToken) {
            Swal.fire({
                title: "Session Expired",
                text: "Your session has expired. Please log in again.",
                icon: "warning",
                confirmButtonText: "Ok",
            }).then(() => {
                // Redirect to admin login page
                window.location.href = "/admin-login"; // Replace with your login route
            });
            return; // Exit early if no session
        }
    
        const admin_id = JSON.parse(adminData)?.id;
    
        // If admin ID is missing, log the error and exit
        if (!admin_id) {
            console.error("Admin ID is missing!");
            return;
        }
    
        setLoading(true); // Start loading spinner
    
        try {
            const response = await axios.get("https://api.goldquestglobal.in/admin/list", {
                params: {
                    admin_id,
                    _token: storedToken,
                },
            });
    
            console.log("API Response:", response.data);
    
            // Check for invalid or expired token in the response
            if (response.message && response.message.toLowerCase().includes("invalid") && response.message.toLowerCase().includes("token")) 
                {
                Swal.fire({
                    title: "Session Expired",
                    text: "Your session has expired. Please log in again.",
                    icon: "warning",
                    confirmButtonText: "Ok",
                }).then(() => {
                    // Redirect to admin login page
                    window.location.href = "/admin-login"; // Replace with your login route
                });
                return; // Stop further processing if token is invalid or expired
            }
    
            // Update token if a new one is received in the response
            const newToken = response.data?._token || response.data?.token;
            if (newToken) {
                localStorage.setItem("_token", newToken); // Replace the old token with the new one
            }
    
            // Parse service_groups for each admin
            const parsedGroups = response.data?.admins?.map((admin) =>
                JSON.parse(admin.service_groups || "[]")
            ) || [];
    
            // Set state with the parsed data
            setParsedServiceGroups(parsedGroups);
            setData(response.data?.admins || []); // Set the admin data
        } catch (error) {
            console.error("Error fetching data:", error.message);
            Swal.fire({
                title: "Error!",
                text: error.message || "Something went wrong while fetching data.",
                icon: "error",
                confirmButtonText: "Ok",
            });
        } finally {
            setLoading(false); // Stop the loading spinner
        }
    };
    



    return (
        <LoginContext.Provider value={{
            data, loading, formData, fetchData, setFormData,setEditAdmin, handleEditAdmin, editAdmin, parsedServiceGroups
        }}>
            {children}
        </LoginContext.Provider>
    );
};

export default LoginContext;
