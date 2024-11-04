import { createContext, useCallback, useState, useContext } from "react";
import { useApi } from '../ApiContext';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

const DashboardProvider = ({ children }) => {
    const API_URL = useApi();
    const [tableData, setTableData] = useState({ clientApplications: {} });
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        try {
            const branch = JSON.parse(localStorage.getItem("branch"));
            const branch_id = branch?.id;
            const _token = localStorage.getItem("branch_token");

            if (!branch_id || !_token) {
                console.error("Branch ID or token is missing.");
                return;
            }

            const url = `${API_URL}/branch?branch_id=${branch_id}&_token=${_token}`;
            setLoading(true);

            const response = await fetch(url, { method: "GET", redirect: "follow" });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.clientApplications) {
                setTableData(result);
            } else {
                console.error("clientApplications is missing in the response");
            }

            const newToken = result._token || result.token;
            if (newToken) {
                localStorage.setItem("branch_token", newToken);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    return (
        <DashboardContext.Provider value={{ fetchDashboard, tableData, setTableData, loading, setLoading }}>
            {children}
        </DashboardContext.Provider>
    );
};

export default DashboardProvider;
