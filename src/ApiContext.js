import React, { createContext, useContext } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const API_URL = "http://147.93.29.154:5000";


  return (
    <ApiContext.Provider value={API_URL}>
      {children}
    </ApiContext.Provider>
  );
};
export const useApi = () => useContext(ApiContext);
