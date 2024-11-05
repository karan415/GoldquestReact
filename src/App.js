import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import GenerateReportProvider from './Pages/GenerateReportContext';
import BackgroundForm from './Pages/BackgroundForm';
import DigitalAddressVerification from './Pages/DigitalAddressVerification';
import 'react-select-search/style.css'
import UpdatePassword from './Pages/UpdatePassword';
import CustomerForgotPassword from './CustomerDashboard/CustomerForgotPassword';
import CustomerResetPassword from './CustomerDashboard/CustomerResetPassword';
import { HolidayManagementProvider } from './Pages/HolidayManagementContext';
import DashboardProvider from './CustomerDashboard/DashboardContext';

const App = () => {
  return (
    <GenerateReportProvider>
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
                                  <Router basename='/'>
                                    <Routes>
                                      <Route path='/' element={<Admin><Render /></Admin>} />
                                      <Route path='/customer-login' element={<CustomerLogin />} />
                                      <Route path='/admin-login' element={<Login />} />
                                      <Route path='/forgotpassword' element={<ForgotPassword />} />
                                      <Route path='/customer-forgotpassword' element={<CustomerForgotPassword />} />
                                      <Route path='/reset-password' element={<SetNewPassword />} />
                                      <Route path='/customer-reset-password' element={<CustomerResetPassword />} />
                                      <Route path='/customer-dashboard' element={<Customer><CustomerDashboard /></Customer>} />
                                      <Route path='/update-password' element={<Admin><UpdatePassword /></Admin>} />
                                      <Route path='/customer-update-password' element={<CustomerLogin><UpdatePassword /></CustomerLogin>} />
                                      <Route path='/trackerstatus' element={<Admin><ExelTrackerData /></Admin>} />
                                      <Route path='/candidate' element={<Admin><CandidateMain /></Admin>} />
                                      <Route path='/background_form' element={<BackgroundForm />} />
                                      <Route path='/digital_form' element={<DigitalAddressVerification />} />
                                    </Routes>
                                  </Router>
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
    </GenerateReportProvider>
  );
};

export default App;
