import  {React,useEffect} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import active_client from '../Images/Login.jpeg';
import CustomerLoginForm from './CustomerLoginForm';
import loginImg from '../Images/customerlogin.png'
const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {

    const storedAdminData = localStorage.getItem("branch");
    const storedToken = localStorage.getItem("branch_token");
    let preBranchData;

    try {
      preBranchData = JSON.parse(storedAdminData);
    } catch (e) {
      console.error('Error parsing JSON from localStorage:', e);
      preBranchData = null;
    }

    if (preBranchData || storedToken) {

      navigate('/customer-dashboard', { state: { from: location }, replace: true });
      return;
    }
  }, [location, navigate])
  return (
    <>
      <div className="bg-cover md:h-lvh bg-center flex items-center justify-center p-4 md:p-14" style={{ backgroundImage: `url(${active_client})` }}>
        <div className="flex flex-col gap-10 md:flex-row items-center w-full md:w-7/12 bg-slate-50 opacity-90 md:p-6 md:px-16 rounded-lg shadow-lg">
          <div className="w-full md:w-7/10 flex flex-col md:p-4">
            <CustomerLoginForm />
          </div>
          <div className="w-full md:w-3/10 flex items-center justify-center">
            <img src={loginImg} alt="" className='' />
          </div>
        </div>

      </div>
    </>
  )
}

export default CustomerLogin
