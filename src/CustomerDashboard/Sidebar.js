import React, { useState } from "react";
import { BiSolidPackage } from "react-icons/bi";
import { HomeIcon, UserIcon } from "@heroicons/react/24/outline";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaFileInvoiceDollar, FaDropbox, FaBriefcase } from "react-icons/fa";
import { AiFillDropboxCircle } from "react-icons/ai";
import { MdOutlinePhoneCallback } from "react-icons/md";
import { GrServices } from "react-icons/gr";
import DashBoard from './Dashboard';
import EmployeeManagement from './EmployeeManagement';
import AddUser from './AddUser';
import BulkUpload from './BulkUpload';
import UpdatePassword from '../Pages/UpdatePassword';
import EscalationMatrix from './EscalationMatrix';
import CustomerHeader from './CustomerHeader';
import Logout from './Logout'
import ReportCaseTable from "./ReportCaseTable";
import DropBoxList from "./DropBoxList";
import CandidateList from "./CandidateList";
import CustomerUpdatePassword from "./CustomerUpdatePassword";
// import CaseLog from './CaseLog'
// import Callback from "./Callback";

const tabComponents = {
  dashboard: <DashBoard />,
  employee_management: <EmployeeManagement />,
  add_user: <AddUser />,
  report_case: <ReportCaseTable />,
  dropbox: <DropBoxList />,
  Candidate: <CandidateList />,
  bulkupload: <BulkUpload />,
  update_password: <UpdatePassword />,
  escalation: <EscalationMatrix />,
  update_password: <CustomerUpdatePassword />,
  // case_log: <CaseLog />,
  // callback: <Callback />,
};

const tabNames = {
  dashboard: (<><HomeIcon className="h-6 w-6 mr-3 text-gray-600" />DashBoard</>),
  employee_management: (<><UserIcon className="h-6 w-6 mr-3 text-gray-600" />Client Master Data</>),
  report_case: (<><GrServices className="h-6 w-6 mr-3 text-gray-600" />Report & Case Status</>),
  dropbox: (<><FaDropbox className="h-6 w-6 mr-3 text-gray-600" />Client DropBox</>),
  // callback: (<><MdOutlinePhoneCallback className="h-6 w-6 mr-3 text-gray-600" />Callback</>),
  Candidate: (<><AiFillDropboxCircle className="h-6 w-6 mr-3 text-gray-600" />Candidate DropBox</>),
  update_password: (<><RiLockPasswordFill className="h-6 w-6 mr-3 text-gray-600" />Update Password</>),
  // case_log: (<><FaBriefcase className="h-6 w-6 mr-3 text-gray-600" />Case Logs</>),
};

const Sidebar = () => {
  const [toggle, setToggle] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // Default active tab

  const handleToggle = () => {
    setToggle(!toggle);
  };

  const onTabChange = (tab) => {
    setActiveTab(tab);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <CustomerHeader />
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar */}
        <div
          className={`w-full md:w-1/5 flex flex-col bg-white border-e fixed md:relative top-0 left-0 h-full z-50 transition-transform transform ${
            toggle ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <div className="h-screen">
            <div className="px-3" id="sider_content">
              <div className="flex flex-col px-3 py-8">
               
                <ul>
                  {Object.keys(tabNames).map((tab) => (
                    <li
                      key={tab}
                      className={activeTab === tab ? 'active bg-green-200 rounded-md p-3 flex mb-3' : 'togglelist w-full flex items-center p-3 cursor-pointer hover:bg-green-200 rounded-md my-2'}
                      onClick={() => onTabChange(tab)}
                    >
                      {tabNames[tab]}
                    </li>
                  ))}
                  <Logout />
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-4/5 h-full flex flex-col pl-0 m-4">
          {tabComponents[activeTab]}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
