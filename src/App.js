import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Render from './Pages/Render';
import ForgotPassword from './Pages/ForgotPassword';
import CustomerLogin from './CustomerDashboard/CustomerLogin';
import PasswordReset from './Pages/PasswordReset';
import SetNewPassword from './Pages/SetNewPassword';
import Login from './Dashboard/Login';
import CustomerDashboard from './CustomerDashboard/CustomerDashboard';
import ExelTrackerData from './Pages/ExelTrackerData';
import { PaginationProvider } from './Pages/PaginationContext';
import Admin from './Middleware/Admin';
import Customer from './Middleware/Customer';
import { PackageProvider } from './Pages/PackageContext';
import { ServiceProvider } from './Pages/ServiceContext';
import { LoaderProvider } from './LoaderContext';
import { ClientProvider } from './Pages/ClientManagementContext';
import { ClientEditProvider } from './Pages/ClientEditContext';
import AddClient from './Pages/AddClient';
import { BranchEditProvider } from './Pages/BranchEditContext';
import { DropBoxProvider } from './CustomerDashboard/DropBoxContext'
import { RefreshProvider } from './RefreshContext';
import { DataProvider } from './Pages/DataContext';
import { ApiProvider } from './ApiContext'
import { TabProvider } from './Pages/TabContext';
import { BranchProviderExel } from './Pages/BranchContextExel';
import CandidateMain from './Pages/Candidate/CandidateMain';
import GenerateReportProvider from './Pages/GenerateReportContext';
const App = () => {
  return (
    <GenerateReportProvider>
    <BranchProviderExel>
    <TabProvider>
      <ApiProvider>
          <DataProvider>
            <RefreshProvider>
                <ClientEditProvider>
                  <BranchEditProvider>
                    <LoaderProvider>
                      <PaginationProvider>
                        <ClientProvider>
                        <DropBoxProvider>
                          <PackageProvider>
                            <ServiceProvider>
                              <Router basename='/demo/Goldquest'>
                                <Routes>
                                  <Route path='/' element={<Admin><Render /></Admin>} />
                                  <Route path='/customer-login' element={<CustomerLogin />} />
                                  <Route path='/admin-login' element={<Login />} />
                                  <Route path='forgotpassword' element={<ForgotPassword />} />
                                  <Route path='forgotpassword/passwordreset' element={<PasswordReset />} />
                                  <Route path='/newpassword' element={<SetNewPassword />} />
                                  <Route path='/customer-dashboard' element={<Customer><CustomerDashboard /></Customer>} />
                                  <Route path='/trackerstatus' element={<Admin><ExelTrackerData /></Admin>} />
                                  <Route path='/addclient' element={<Admin><AddClient /></Admin>} />
                                  <Route path='/candidate' element={<Admin><CandidateMain/></Admin>} />
                                </Routes>
                              </Router>
                            </ServiceProvider>
                          </PackageProvider>
                          </DropBoxProvider>
                        </ClientProvider>
                      </PaginationProvider>
                    </LoaderProvider>
                  </BranchEditProvider>
                </ClientEditProvider>
            </RefreshProvider >
          </DataProvider>
     
      </ApiProvider>
    </TabProvider>
    </BranchProviderExel>
    </GenerateReportProvider>
  );
};

export default App;
