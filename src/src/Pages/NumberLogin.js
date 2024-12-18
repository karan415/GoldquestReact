import React, { useState } from 'react'

const NumberLogin = () => {
  const [number, setNumber] = useState({
    number: "",
  });
  const [error, setError] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNumber((prev) => ({
      ...prev, [name]: value,
    }));
  };
  
  const validate=()=>{
    const newError={};
    if(!number.number){ 
       newError.number='This Field is Required';
    }
    else if(number.number.length<=10){
      newError.number='Number must be in 10 characters';

    }
    else{

    }
    return newError;
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length === 0) {
 
      setError({});
    }
    else {
      setError(errors);
    }
  }
  return (
    <>
      <form action="" className='mt-8' onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="number" className='block'>Enter Your Mobile Number:</label>
          <input type="number" name="number" id="MobileNumber" className='border rounded-md w-full outline-0 p-3 mt-2' onChange={handleChange} value={number.number} />
          {error.number && <p className='text-red-500'>{error.number}</p>}
        </div>
        <button className="bg-green-400 w-full text-white rounded-md p-3 hover:bg-green-200">Send OTP</button>
      </form>

    </>
  )
}

export default NumberLogin
