import React, { useState } from 'react';
import { useSidebar } from './SidebarContext';
import { BiSolidPackage } from "react-icons/bi";
import { HomeIcon, UserIcon } from "@heroicons/react/24/outline";
import { IoMdPersonAdd } from "react-icons/io";
import { RiLockPasswordFill, RiCustomerServiceFill } from "react-icons/ri";
import { FaFileInvoiceDollar, FaEye, FaEyeSlash } from "react-icons/fa";
import { TiCloudStorage } from "react-icons/ti";
import { TbReportSearch } from "react-icons/tb";
import { VscLinkExternal } from "react-icons/vsc";
import { MdOutlineTrackChanges, MdTrackChanges, MdEmail } from "react-icons/md";
import { IoNotificationsCircle } from "react-icons/io5";
import { GrServices } from "react-icons/gr";
import classNames from 'classnames';
import Logout from '../Dashboard/Logout';

const tabNames = {
  dashboard: (<><HomeIcon className="h-6 w-6 mr-3 text-gray-600" />DashBoard</>),
  profile: {
    icon: (<><UserIcon className="h-6 w-6 mr-3 text-gray-600" />Client Management</>),
    subItems: [
      { id: 'add_clients', name: 'Add New Client', icon: <IoMdPersonAdd className="h-5 w-5 mr-2 text-gray-500" /> },
      { id: 'active_clients', name: 'Active Clients', icon: <FaEye className="h-5 w-5 mr-2 text-gray-500" /> },
      { id: 'inactive_clients', name: 'Inactive Clients', icon: <FaEyeSlash className="h-5 w-5 mr-2 text-gray-500" /> }
    ]
  },
  package_management: (<><BiSolidPackage className="h-6 w-6 mr-3 text-gray-600" />Package Management</>),
  service_management: (<><GrServices className="h-6 w-6 mr-3 text-gray-600" />Service Management</>),

  generate_invoice: (<><FaFileInvoiceDollar className="h-6 w-6 mr-3 text-gray-600" />Create invoice</>),

  internal_login: (<><TiCloudStorage className="h-6 w-6 mr-3 text-gray-600" />Internal Login</>),
  report: (<><TbReportSearch className="h-6 w-6 mr-3 text-gray-600" />Reports Summary</>),
  external: (<><VscLinkExternal className="h-6 w-6 mr-3 text-gray-600" />External Login Credentials</>),
  client_master: (<><MdOutlineTrackChanges className="h-6 w-6 mr-3 text-gray-600" />Client Master Tracker</>),
  exel_tracker: (<><MdTrackChanges className="h-6 w-6 mr-3 text-gray-600" />Exel Tracker</>),
  tat_delay: (<><IoNotificationsCircle className="h-6 w-6 mr-3 text-gray-600" />Tat Delay Notification</>),
  Acknowledgement: (<><MdEmail className="h-6 w-6 mr-3 text-gray-600" />Acknowledgement Email</>),
  update_password: (<><RiLockPasswordFill className="h-6 w-6 mr-3 text-gray-600" />Update Password</>),
  invoice: (<><FaFileInvoiceDollar className="h-6 w-6 mr-3 text-gray-600" />Invoice</>),
  email_temp: (<><FaFileInvoiceDollar className="h-6 w-6 mr-3 text-gray-600" />Email Template</>),
  tracker_status: (<><FaFileInvoiceDollar className="h-6 w-6 mr-3 text-gray-600" />Tracker Status</>),

};

const Sidebar = () => {
  const [toggle, setToggle] = useState(false);
  const [expandedTab, setExpandedTab] = useState(null);
  const { activeTab, handleTabChange } = useSidebar();

  const handleToggle = () => {
    setToggle(!toggle);
  };

  const onTabChange = (tab) => {
    handleTabChange(tab);
    setToggle(!toggle);
  };

  const handleExpand = (tab) => {
    setExpandedTab(expandedTab === tab ? null : tab);
  };

  return (
    <div className="w-full md:w-1/5 flex flex-col bg-white">
      <div className="px-3">
        <div className="flex flex-col px-3 md:py-8 p-2">
          <h2 className="w-full text-green-600 md:text-5xl text-2xl text-left font-bold md:pb-6 pb-2 font-poppins">GoldQuest.</h2>
          <p className="text-gray-400 text-lg md:mb-7 mb-2 text-left w-full">Background Verification Tracking System.</p>
          <div className='md:hidden sm:block'>
            <div className='flex items-center justify-between border-b p-3'>
              <div>Menu</div>
              <div className='md:hidden sm:block' onClick={handleToggle} aria-label="Toggle Sidebar">
                <span className='border-b-4 border-black w-8 block text-black mb-1'></span>
                <span className='border-b-4 border-black w-8 block text-black mb-1'></span>
                <span className='border-b-4 border-black w-8 block text-black mb-1'></span>
              </div>
            </div>
          </div>
          {
            toggle && (
              <ul className='md:hidden mb-2'>
                {Object.keys(tabNames).map((tab) => {
                  const tabContent = tabNames[tab];
                  return (
                    <React.Fragment key={tab}>
                      <li
                        className={classNames(
                          'w-full flex items-center p-3 cursor-pointer rounded-md my-2',
                          { 'bg-green-200': activeTab === tab, 'hover:bg-green-200': activeTab !== tab }
                        )}
                        onClick={() => {
                          if (tabContent.subItems) {
                            handleExpand(tab);
                          } else {
                            onTabChange(tab);
                          }
                        }}
                      >
                        {tabContent.icon || tabContent}
                      </li>
                      {expandedTab === tab && tabContent.subItems && (
                        <ul className="pl-6">
                          {tabContent.subItems.map((subItem) => (
                            <li
                              key={subItem.id}
                              className={classNames(
                                'w-full flex items-center p-3 cursor-pointer rounded-md my-2',
                                { 'bg-green-100': activeTab === subItem.id, 'hover:bg-green-100': activeTab !== subItem.id }
                              )}
                              onClick={() => {
                                onTabChange(subItem.id);
                                setToggle(false); // Optionally close the menu after selecting a sub-item
                              }}
                            >
                              {subItem.icon}
                              {subItem.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </React.Fragment>
                  );
                })}
              </ul>
            )
          }
          <ul className='hidden md:block'>
            {Object.keys(tabNames).map((tab) => {
              const tabContent = tabNames[tab];
              return (
                <React.Fragment key={tab}>
                  <li
                    className={classNames(
                      'w-full flex items-center p-3 cursor-pointer rounded-md my-2',
                      { 'bg-green-200': activeTab === tab, 'hover:bg-green-200': activeTab !== tab }
                    )}
                    onClick={() => {
                      if (tabContent.subItems) {
                        handleExpand(tab);
                      } else {
                        onTabChange(tab);
                      }
                    }}
                  >
                    {tabContent.icon || tabContent}
                  </li>
                  {expandedTab === tab && tabContent.subItems && (
                    <ul className="pl-6">
                      {tabContent.subItems.map((subItem) => (
                        <li
                          key={subItem.id}
                          className={classNames(
                            'w-full flex items-center p-3 cursor-pointer rounded-md my-2',
                            { 'bg-green-100': activeTab === subItem.id, 'hover:bg-green-100': activeTab !== subItem.id }
                          )}
                          onClick={() => {
                            onTabChange(subItem.id);
                            setToggle(false);
                          }}
                        >
                          {subItem.icon}
                          {subItem.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
          <Logout />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
