import React from 'react';
import { BrowserRouter as Router, useLocation, Routes, Route } from 'react-router-dom';
import './App.css';
import Render from './Pages/Render';
import ForgotPassword from './Pages/ForgotPassword';
import CustomerLogin from './CustomerDashboard/CustomerLogin';
import SetNewPassword from './Pages/SetNewPassword';
import Login from './Dashboard/Login';
import CustomerDashboard from './CustomerDashboard/CustomerDashboard';
import ExelTrackerData from './Pages/ExelTrackerData';
import Admin from './Middleware/Admin';
import Customer from './Middleware/Customer';
import { PackageProvider } from './Pages/PackageContext';
import { ServiceProvider } from './Pages/ServiceContext';
import { LoaderProvider } from './LoaderContext';
import { ClientProvider } from './Pages/ClientManagementContext';
import { ClientEditProvider } from './Pages/ClientEditContext';
import { BranchEditProvider } from './Pages/BranchEditContext';
import { DropBoxProvider } from './CustomerDashboard/DropBoxContext'
import { DataProvider } from './Pages/DataContext';
import { ApiProvider } from './ApiContext'
import { CustomFunctionsProvider } from './CustomFunctionsContext'
import { TabProvider } from './Pages/TabContext';
import { BranchProviderExel } from './Pages/BranchContextExel';
import CandidateMain from './Pages/Candidate/CandidateMain';
import CandidateBGV from './Pages/CandidateBGV';


import CandidateGenerateReport from './Pages/Candidate/CandidateGenerateReport';


import BackgroundForm from './Pages/BackgroundForm';
import DigitalAddressVerification from './Pages/DigitalAddressVerification';
import 'react-select-search/style.css'
import UpdatePassword from './Pages/UpdatePassword';
import CustomerForgotPassword from './CustomerDashboard/CustomerForgotPassword';
import CustomerResetPassword from './CustomerDashboard/CustomerResetPassword';
import { HolidayManagementProvider } from './Pages/HolidayManagementContext';
import DashboardProvider from './CustomerDashboard/DashboardContext';
import LoginPage from './Dashboard/LoginPage';
import ClientBulkUpload from './CustomerDashboard/ClientBulkUpload';
import CandidiateDav from './Pages/CandidateDAV';
import { LoginProvider } from './Pages/InternalLoginContext';




const App = () => {
  return (
    <BranchProviderExel>
      <TabProvider>
        <ApiProvider>
          <DataProvider>
            <ClientEditProvider>
              <BranchEditProvider>
                <LoaderProvider>
                  <ClientProvider>
                    <DropBoxProvider>
                      <PackageProvider>
                        <ServiceProvider>
                          <CustomFunctionsProvider>
                            <HolidayManagementProvider>
                              <DashboardProvider>
                                <LoginProvider>
                                  {/* Setting the basename='/' globally */}
                                  <Router basename="/">
                                    <Routes>
                                      {/* Main Route */}
                                      <Route path="/" element={<Admin><Render /></Admin>} />

                                      {/* Customer Routes */}
                                      <Route path="/customer-login" element={<CustomerLogin />} />
                                      <Route path="/customer-dashboard" element={<Customer><CustomerDashboard /></Customer>} />
                                      
                                      {/* Admin Routes */}
                                      <Route path="/admin-login" element={<Login />} />
                                      <Route path="/forgotpassword" element={<ForgotPassword />} />
                                      <Route path="/reset-password" element={<SetNewPassword />} />
                                      <Route path="/update-password" element={<Admin><UpdatePassword /></Admin>} />
                                      <Route path="/trackerstatus" element={<Admin><ExelTrackerData /></Admin>} />
                                      <Route path="/candidate" element={<Admin><CandidateMain /></Admin>} />
                                      <Route path="/candidate-bgv" element={<Admin><CandidateBGV /></Admin>} />
                                      <Route path="/candidate_genrate_Report" element={<Admin><CandidateGenerateReport /></Admin>} />
                                      <Route path="/candidate-dav" element={<Admin><CandidiateDav /></Admin>} />

                                      {/* Other Routes */}
                                      <Route path="/background-form" element={<BackgroundForm />} />
                                      <Route path="/digital-form" element={<DigitalAddressVerification />} />
                                      <Route path="/loginpage" element={<LoginPage />} />

                                      {/* Client Bulk Upload */}
                                      <Route path="/ClientBulkUpload" element={<ClientBulkUpload />} />
                                    </Routes>
                                  </Router>
                                </LoginProvider>
                              </DashboardProvider>
                            </HolidayManagementProvider>
                          </CustomFunctionsProvider>
                        </ServiceProvider>
                      </PackageProvider>
                    </DropBoxProvider>
                  </ClientProvider>
                </LoaderProvider>
              </BranchEditProvider>
            </ClientEditProvider>
          </DataProvider>
        </ApiProvider>
      </TabProvider>
    </BranchProviderExel>
  );
};


export default App;
