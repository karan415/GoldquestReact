import React, { useEffect, useState } from 'react';
import { useData } from './DataContext';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css'
const CreateInvoice = () => {
  const { listData, fetchData } = useData();
  const [clientCode, setClientCode] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');


  const options = listData.map(client => ({
    name: client.name +  `(${client.client_unique_id})`, 
    value: client.id,
  }));
  console.log('listData',listData)

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      clientCode,
      invoiceNumber,
      invoiceDate,
      month,
      year,
    };
    console.log('Form Data:', formData);
   
  };

  return (
    <div className="bg-[#F7F6FB] p-12">
      <div className="bg-white p-12 rounded-md w-full mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Generate Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clrefin" className="block mb-2">Client Code:</label>
            <SelectSearch
              options={options}
              value={clientCode}
              name="language"
              placeholder="Choose your language"
              onChange={(value) => setClientCode(value)}
              search
            />
          </div>
          <div>
            <label htmlFor="invnum" className="block mb-2">Invoice Number:</label>
            <input
              type="text"
              name="invnum"
              id="invnum"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="invoice_date" className="block mb-2">Invoice Date:</label>
            <input
              type="date"
              name="invoice_date"
              id="invoice_date"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="moinv" className="block mb-2">Month:</label>
            <select
              id="inmnth"
              name="inmnth"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">--Select Month--</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              id="inyer"
              name="inyer"
              required
              className="w-full p-3 bg-[#F7F6FB] mb-[20px] border border-gray-300 rounded-md"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">--Select Year--</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div className="text-left">
            <button type="submit" className="p-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-blue-400">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
