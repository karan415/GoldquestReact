import React, { createContext, useContext, useState } from "react";


const ClientManagementContext = createContext();


export const useClient = () => useContext(ClientManagementContext);


export const ClientProvider = ({ children }) => {
  const [clientData, setClientData] = useState([]);
  const [validationsErrors, setValidationsErrors] = useState({});

  return (
    <ClientManagementContext.Provider value={{ clientData, setClientData, validationsErrors, setValidationsErrors }}>
      {children}
    </ClientManagementContext.Provider>
  );
};
