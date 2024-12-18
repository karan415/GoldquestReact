import {React,useContext} from 'react'
import ScopeOfServices from './ScopeOfServices'
import DropBoxContext from './DropBoxContext';

const EmployeeManagement = () => {

  return (
    <>
    <ScopeOfServices/>
    <div className="text-center p-3 md:px-10">
    <div className="md:flex gap-4 items-center pb-5 md:pb-16">
    <p className='text-center text-lg'>Download General MRL & BGV Forms:</p>
    <button className="bg-green-500 text-white p-3 px-4 md:m-0  m-1 rounded-md">General MRL</button>
    <button className="bg-green-500 text-white p-3 m-1 md:m-0 px-4 rounded-md">BGV Form</button>
    <button className="bg-green-500 text-white p-3 px-4  md:m-0 m-1 rounded-md">BGV Form</button>
    <button className="bg-green-500 text-white p-3 m-1 px-4 rounded-md">BGV Form</button>
    </div>
    </div>
    </>
  )
}

export default EmployeeManagement