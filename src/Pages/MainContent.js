import React from 'react';
import { useSidebar } from '../Sidebar/SidebarContext'; // Import the custom hook for accessing sidebar context
import Header from '../Dashboard/Header'; // Header component
import DashBoard from '../Dashboard/Dashboard'; // Dashboard component
import ClientManagement from '../Pages/ClientManagement'; // Client Management component
import PackageManagement from '../Pages/PackageManagement'; // Package Management component
import ServiceMangement from '../Pages/ServiceMangement'; // Service Management component
import InternalLogin from '../Pages/InternalLogin'; // Internal Login component
import Reports from '../Pages/Reports'; // Reports component
import ExternalLogin from './ExternalLoginData'; // External Login component
import ClientMasterTracker from '../Pages/ClientMasterTracker'; // Client Master Tracker component
import ExelTracker from '../Pages/ExelTracker'; // Excel Tracker component
import TatDelay from '../Pages/TatDelay'; // TAT Delay component
import Acknowledgement from '../Pages/Acknowledgement'; // Acknowledgement component
import UpdatePassword from '../Pages/UpdatePassword'; // Update Password component
import Invoice from './CreateInvoice'; // Invoice component
import EmailTemplate from "../Pages/EmailTemplate"; // Email Template component
import ClientManagementList from './ClientManagementList'; // Client Management List component
import InactiveClients from './InactiveClients'; // Inactive Clients component
import ExelTrackerStatus from './ExelTrackerStatus'; // Excel Tracker Status component
import CreateInvoice from './CreateInvoice';
import { ClientEditForm } from './ClientEditForm';
import HolidayManagement from './HolidayManagement';
import GenerateReportList from './GenerateReportList';

// Mapping tab keys to their respective components
const tabComponents = {
  dashboard: <DashBoard />,
  profile: <ClientManagement />,
  package_management: <PackageManagement />,
  service_management: <ServiceMangement />,
  internal_login: <InternalLogin />,
  report_summary: <Reports />,
  generate_report:<GenerateReportList/>,
  external: <ExternalLogin />,
  client_master: <ClientMasterTracker />,
  exel_tracker: <ExelTracker />,
  tat_delay: <TatDelay />,
  Acknowledgement: <Acknowledgement />,
  // update_password: <UpdatePassword />,
  // invoice: <Invoice />,
  // email_temp: <EmailTemplate />,
  add_clients: <ClientManagement />,
  active_clients: <ClientManagementList />,
  inactive_clients: <InactiveClients />,
  tracker_status: <ExelTrackerStatus />,
  generate_invoice: <CreateInvoice />,
  edit: <ClientEditForm />,
  holiday_management: <HolidayManagement />
};

const MainContent = () => {
  const { activeTab } = useSidebar();

  return (
    <div className="w-full md:w-4/5 flex flex-col items-stretch">
      <Header />
      {tabComponents[activeTab] || <DashBoard />}
    </div>
  );
};

export default MainContent;