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
        const admin_id = adminData ? JSON.parse(adminData)?.id : null;
        const storedToken = localStorage.getItem("_token");

        if (!admin_id || !storedToken) {
            console.error("Admin ID or token is missing!");
            return; // Exit if required data is missing
        }

        setLoading(true);

        try {
            const response = await axios.get("https://api.goldquestglobal.in/admin/list", {
                params: {
                    admin_id: admin_id,
                    _token: storedToken,
                },
            });

            console.log("API Response:", response.data);

            const newToken = response.data?._token || response.data?.token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
            }

            if (response.data?.message?.toLowerCase().includes("invalid token")) {
                Swal.fire({
                    title: "Session Expired",
                    text: "Your session has expired. Please log in again.",
                    icon: "warning",
                    confirmButtonText: "Ok",
                }).then(() => {
                    // Redirect to admin login page
                    window.location.href = "//admin-login"; // Replace with your login route
                });
                return; // Stop further processing
            }

            // Parse service_groups for each admin
            const parsedGroups = response.data?.admins?.map((admin) =>
                JSON.parse(admin.service_groups || "[]")
            ) || [];

            setParsedServiceGroups(parsedGroups);
            setData(response.data?.admins || []);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        } finally {
            setLoading(false);
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
