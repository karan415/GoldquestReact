import React, { useState, useMemo, useEffect, useCallback } from "react";
import Swal from 'sweetalert2';
import { useClient } from "./ClientManagementContext";
import ClientManagementData from "./ClientManagementData";
import { useApi } from "../ApiContext";
import { State } from 'country-state-city';
import axios from "axios";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
const states = State.getStatesOfCountry('IN');

const options = states.map(state => ({ value: state.isoCode, label: state.name }));

const ClientManagement = () => {
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

  const [insertId, setInsertId] = useState();
  const [files, setFiles] = useState([]);
  const API_URL = useApi();
  const { clientData, setClientData } = useClient();

  const [input, setInput] = useState({
    company_name: "",
    client_code: "",
    address: "",
    state_code: "",
    state: "",
    mobile_number: "",
    name_of_escalation: "",
    client_spoc: "",
    contact_person: "",
    gstin: "",
    tat: "",
    date_agreement: "",
    agreement_period: "",
    client_standard: "",
    additional_login: "no",
    custom_template: "",
    custom_address: "",
    username: "",
  });

  const handleFileChange = (fileName, e) => {
    const selectedFiles = Array.from(e.target.files); // Convert FileList to an array

    // Assuming `file` is the state variable holding the files
    setFiles((prevFiles) => {
      return {
        ...prevFiles,
        [fileName]: selectedFiles,
      };
    });
  };


  const [branchForms, setBranchForms] = useState([{ branch_name: "", branch_email: "" }]);
  const [emails, setEmails] = useState([""]);
  const [errors, setErrors] = useState({});

  const handleChange = (e, index) => {
    const { name, value } = e.target;

    if (name.startsWith("branch_")) {
      const newBranchForms = [...branchForms];
      newBranchForms[index][name] = value;
      setBranchForms(newBranchForms);
    } else if (name.startsWith("email")) {
      const newEmails = [...emails];
      newEmails[index] = value;
      setEmails(newEmails);
    } else {
      setInput(prevInput => ({
        ...prevInput,
        [name]: value,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "company_name", "client_code", "address", "state_code", "state", "mobile_number",
      "name_of_escalation", "client_spoc", "contact_person", "gstin", "tat",
      "date_agreement", "agreement_period", "client_standard",
      "additional_login", "custom_template",
    ];

    requiredFields.forEach(field => {
      if (!input[field]) newErrors[field] = "This field is required*";
    });

    if (input.mobile_number && input.mobile_number.length !== 10) {
      newErrors.mobile_number = "Please enter a valid phone number, containing 10 characters";
    }

    const emailSet = new Set();
    emails.forEach((email, index) => {
      if (!email) {
        newErrors[`email${index}`] = "This field is required*";
      } else if (emailSet.has(email)) {
        newErrors[`email${index}`] = "This email is already used*";
      }

      else {
        emailSet.add(email);
      }
    });

    branchForms.forEach((form, index) => {
      if (!form.branch_name) {
        newErrors[`branch_name_${index}`] = "This field is required*";
      }
      if (!form.branch_email) {
        newErrors[`branch_email_${index}`] = "This field is required*";
      } else if (emailSet.has(form.branch_email)) {
        newErrors[`branch_email_${index}`] = "This email is already used*";
      } else {
        emailSet.add(form.branch_email);
      }
    });

    return newErrors;
  };


  const handleFocusOut = useCallback(debounce((event) => {
    const value = event.target.value;
    const adminData = JSON.parse(localStorage.getItem("admin"))?.id;
    const token = localStorage.getItem("_token");

    if (value) {
      fetch(`${API_URL}/branch/is-email-used?email=${value}&admin_id=${adminData}&_token=${token}`, {
        method: "GET"
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.message || 'An error occurred while checking the email.');
            });
          }
          return response.json();
        })
        .then(data => {
          if (!data.status) {
            event.target.setCustomValidity('The Provided Email is Already Used By Client, please enter a different email!');
          } else {
            event.target.setCustomValidity('');
          }

          const newToken = data._token || data.token;
    
          if (newToken) {
              localStorage.setItem("_token", newToken);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    
  }, 300), []);

  useEffect(() => {
    const inputs = document.querySelectorAll('.emailCheck');
    inputs.forEach(input => input.addEventListener('focusout', handleFocusOut));
    return () => inputs.forEach(input => input.removeEventListener('focusout', handleFocusOut));
  }, [handleFocusOut]);


  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false); // Stop loading if there are validation errors
      return;
    }
  
    try {
      const adminData = JSON.parse(localStorage.getItem("admin"));
      const token = localStorage.getItem("_token");
  
      let requestData;
      const fileCount = Object.keys(files).length;
      if (fileCount === 0) {
        requestData = {
          admin_id: adminData.id,
          ...input,
          _token: token,
          branches: branchForms,
          emails: emails,
          clientData: clientData,
          send_mail: 1,
        };
      } else {
        requestData = {
          admin_id: adminData.id,
          ...input,
          _token: token,
          branches: branchForms,
          emails: emails,
          clientData: clientData,
        };
      }
  
      const response = await fetch(`${API_URL}/customer/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
  

    
      const data = await response.json();
      const newToken = data._token || data.token;
    
      if (newToken) {
          localStorage.setItem("_token", newToken);
      }
      const customerInsertId = data.data.customerId;
      const password = data.password;
      setInsertId(customerInsertId);
  
      Swal.fire({
        title: "Success",
        text: 'Client Created Successfully. Customer ID: ' + customerInsertId,
        icon: "success",
        confirmButtonText: "Ok",
      });
  
      // Resetting input fields
      resetFormFields();
  
      await uploadCustomerLogo(adminData.id, token, customerInsertId, password);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire('Error!', `An error occurred: ${error.message}`, 'error');
    } finally {
      setIsLoading(false); // Stop loading after submission
    }
  };
  

const resetFormFields = () => {
  setInput({
    company_name: "",
    client_code: "",
    address: "",
    state_code: "",
    state: "",
    mobile_number: "",
    name_of_escalation: "",
    client_spoc: "",
    contact_person: "",
    gstin: "",
    tat: "",
    date_agreement: "",
    agreement_period: "",
    client_standard: "",
    additional_login: "no",
    custom_template: "",
    custom_address: "",
    username: "",
  });

  setBranchForms([{ branch_name: "", branch_email: "" }]);
  setEmails([""]);
  setErrors({});
  setClientData({});
};


const uploadCustomerLogo = async (adminId, token, customerInsertId, password) => {


  const fileCount = Object.keys(files).length;
  for (const [index, [key, value]] of Object.entries(files).entries()) {
    const customerLogoFormData = new FormData();
    customerLogoFormData.append('admin_id', adminId);
    customerLogoFormData.append('_token', token);
    customerLogoFormData.append('customer_code', input.client_code);
    customerLogoFormData.append('customer_id', customerInsertId);
    for (const file of value) {
      customerLogoFormData.append('images', file);
      customerLogoFormData.append('upload_category', key);
    }
    if (fileCount === (index + 1)) {
      customerLogoFormData.append('send_mail', 1);
      customerLogoFormData.append('company_name', input.company_name);
      customerLogoFormData.append('password', password);
    }

    try {
      await axios.post(
        `${API_URL}/customer/upload`,
        customerLogoFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (err) {
      Swal.fire('Error!', `An error occurred while uploading logo: ${err.message}`, 'error');
    }
  }
};


const addMoreFields = () => {
  setBranchForms([...branchForms, { branch_name: "", branch_email: "" }]);
};

const addMoreEmails = () => {
  setEmails([...emails, ""]);
};

const deleteField = (index) => {
  setBranchForms(branchForms.filter((_, i) => i !== index));
};

const deleteEmails = (index) => {
  setEmails(emails.filter((_, i) => i !== index));
};

return (
  <>
    <div className="py-4 md:py-16 m-4">
      <h2 className="md:text-4xl text-2xl md:mb-8 font-bold pb-8 md:pb-4 text-center">
        Client Management
      </h2>
      <div className="md:w-9/12 m-auto bg-white shadow-md rounded-md p-3 md:p-10">

        <form onSubmit={handleFormSubmit} >
          <div className="md:flex gap-5">
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="company_name">Company Name: *</label>
              <input
                type="text"
                name="company_name"
                id="company_name"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.company_name}
                onChange={handleChange}
              />
              {errors.company_name && <p className="text-red-500">{errors.company_name}</p>}
            </div>

            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="client_code">Client Code: *</label>
              <input
                type="text"
                name="client_code"
                id="client_code"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.client_code}
                onChange={handleChange}
              />
              {errors.client_code && <p className="text-red-500">{errors.client_code}</p>}
            </div>
          </div>
          <div className="md:flex gap-5">
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="address">Address: *</label>
              <input
                type="text"
                name="address"
                id="address"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.address}
                onChange={handleChange}
              />
              {errors.address && <p className="text-red-500">{errors.address}</p>}
            </div>
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="mobile_number">Mobile: *</label>
              <input
                type="number"
                name="mobile_number"
                id="mobile_number"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.mobile_number}
                onChange={handleChange}
              />
              {errors.mobile_number && <p className="text-red-500">{errors.mobile_number}</p>}
            </div>

          </div>

          <div className="md:flex gap-5">

            <div className="mb-4 md:w-6/12">
              <label htmlFor="contact_person">Contact Person: *</label>
              <input
                type="text"
                name="contact_person"
                id="contact_person"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.contact_person}
                onChange={handleChange}
              />
              {errors.contact_person && <p className="text-red-500">{errors.contact_person}</p>}
            </div>
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="state">State: *</label>
              <select name="state" id="state" className="w-full border p-2 rounded-md mt-2" value={input.state} onChange={handleChange}>
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {errors.state && <p className="text-red-500">{errors.state}</p>}
            </div>
          </div>

          <div className="md:flex gap-5">
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="state_code">State Code: *</label>
              <input
                type="number"
                name="state_code"
                id="state_code"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.state_code}
                onChange={handleChange}
              />
              {errors.state_code && <p className="text-red-500">{errors.state_code}</p>}
            </div>
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="name_of_escalation">Name of the Escalation Point of Contact:*</label>
              <input
                type="text"
                name="name_of_escalation"
                id="name_of_escalation"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.name_of_escalation}
                onChange={handleChange}
              />
              {errors.name_of_escalation && <p className="text-red-500">{errors.name_of_escalation}</p>}
            </div>

          </div>
          <div className="my-8 grid gap-5 grid-cols-2 items-center flex-wrap">
            {emails.map((email, index) => (
              <div key={index} className="mb-4 md:flex items-center gap-3 ">
                <label className="text-gray-500 whitespace-nowrap">Email {index + 1}: *</label>
                <input
                  type="email"
                  name={`email${index}`}
                  value={email}
                  onChange={(e) => handleChange(e, index)}
                  className="border w-full rounded-md p-2 mt-2 outline-none emailCheck"
                />
                {errors[`email${index}`] && <p className="text-red-500 text-sm whitespace-nowrap">{errors[`email${index}`]}</p>}
                {index > 0 && (
                  <button
                    className="bg-red-500 rounded-md p-3  text-white"
                    type="button"
                    onClick={() => deleteEmails(index)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}

            <button className="bg-green-500 text-white rounded-3 p-2 mt-0 rounded-md" type="button" onClick={addMoreEmails}>ADD MORE</button>
          </div>



          <div className="md:flex gap-5">
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="client_spoc">Name of The Client SPOC:*</label>
              <input
                type="text"
                name="client_spoc"
                id="client_spoc"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.client_spoc}
                onChange={handleChange}
              />
              {errors.client_spoc && <p className="text-red-500">{errors.client_spoc}</p>}
            </div>

            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="gstin">GSTIN: *</label>
              <input
                type="text"
                name="gstin"
                id="gstin"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.gstin}
                onChange={handleChange}
              />
              {errors.gstin && <p className="text-red-500">{errors.gstin}</p>}
            </div>
          </div>

          <div className="md:flex gap-5">
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="tat">TAT: *</label>
              <input
                type="text"
                name="tat"
                id="tat"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.tat}
                onChange={handleChange}
              />
              {errors.tat && <p className="text-red-500">{errors.tat}</p>}
            </div>

            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="date_agreement">Date of Service Agreement:*</label>
              <input
                type="date"
                name="date_agreement"
                id="date_agreement"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.date_agreement}
                onChange={handleChange}
              />
              {errors.date_agreement && <p className="text-red-500">{errors.date_agreement}</p>}
            </div>
          </div>

          <div className="md:flex gap-5">
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="client_standard">Client Standard Procedure:</label>
              <textarea name="client_standard"
                id="client_standard"
                className="border w-full rounded-md p-2 mt-2 outline-none"
                value={input.client_standard}
                onChange={handleChange}></textarea>
              {errors.client_standard && <p className="text-red-500">{errors.client_standard}</p>}
            </div>
            <div className="mb-4 md:w-6/12">
              <label className="text-gray-500" htmlFor="agreement_period">Agreement Period: *</label>

              <select name="agreement_period" className="border w-full rounded-md p-2 mt-2 outline-none" id="agreement_period" onChange={handleChange} value={input.agreement_period}>
                <option value="Unless terminated" selected>Unless terminated</option>
                <option value="1 year">1 year</option>
                <option value="2 year">2 year</option>
                <option value="3 year">3 year</option>
              </select>
              {errors.agreement_period && <p className="text-red-500">{errors.agreement_period}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-gray-500" htmlFor="agr_upload">Agreement Upload:</label>
            <input
              type="file"
              name="agr_upload"
              id="agr_upload"
              className="border w-full rounded-md p-2 mt-2 outline-none"
              onChange={(e) => handleFileChange('agr_upload', e)}
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-500" htmlFor="custom_template">Required Custom Template:*</label>
            <select name="custom_template" id="custom_template" value={input.custom_template} className="border w-full rounded-md p-2 mt-2 outline-none" onChange={handleChange}>
              <option value="yes">yes</option>
              <option value="no" selected>no</option>
            </select>
            {input.custom_template === 'yes' && (
              <>
                <div className="mb-4 mt-4">
                  <label htmlFor="custom_logo" className="text-gray-500">Upload Custom Logo :*</label>
                  <input
                    type="file"
                    name="custom_logo"
                    id="custom_logo"
                    onChange={(e) => handleFileChange('custom_logo', e)} />
                </div>
                <div className="mb-4">
                  <label htmlFor="" className="text-gray-500">Custom Address</label>
                  <textarea
                    name="custom_address"
                    id="custom_address"
                    onChange={handleChange}
                    value={input.custom_address}
                    className="border w-full rounded-md p-2 mt-2 outline-none"
                  ></textarea>
                </div>
              </>
            )}
          </div>
          <div className="mb-4">
            <label className="text-gray-500" htmlFor="additional_login">Additional login Required</label>
            <div className="flex items-center gap-10 mt-4">
              <div>
                <input
                  type="radio"
                  name="additional_login"
                  value="Yes"
                  checked={input.additional_login === "Yes"}
                  onChange={handleChange}
                  className="me-2"
                />Yes
              </div>
              <div>
                <input
                  type="radio"
                  name="additional_login"
                  value="No"
                  checked={input.additional_login === "No"}
                  onChange={handleChange}
                  className="me-2"
                />No
              </div>
            </div>
            {input.additional_login === "Yes" && (
              <input
                type="text"
                name="username"
                id="username"
                placeholder="username2"
                value={input.username}
                className="border w-full rounded-md p-2 mt-2 outline-none"
                onChange={handleChange}
              />
            )}
          </div>


          <div className="my-8">
            <h3 className="text-lg font-semibold mb-4">Branch Details</h3>
            {branchForms.map((branch, index) => (
              <div key={index} className="flex content-between items-center gap-4 mb-3">
                <div>
                  <label className="text-gray-500" htmlFor={`branch_name_${index}`}>
                    Branch Name: *
                  </label>
                  <input
                    type="text"
                    name="branch_name"
                    id={`branch_name_${index}`}
                    className="border w-full rounded-md p-2 mt-2 outline-none"
                    value={branch.branch_name}
                    onChange={(e) => handleChange(e, index)}
                  />
                  {errors[`branch_name_${index}`] && (
                    <p className="text-red-500">{errors[`branch_name_${index}`]}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-500" htmlFor={`branch_email_${index}`}>
                    Branch Email: *
                  </label>
                  <input
                    type="email"
                    name="branch_email"
                    id={`branch_email_${index}`}
                    className="border w-full rounded-md p-2 mt-2 outline-none emailCheck"
                    value={branch.branch_email}
                    onChange={(e) => handleChange(e, index)}
                  />
                  {errors[`branch_email_${index}`] && (
                    <p className="text-red-500">{errors[`branch_email_${index}`]}</p>
                  )}
                </div>
                {index > 0 && (
                  <button
                    className="bg-red-500 rounded-md p-2 text-white mt-2 col-span-2"
                    type="button"
                    onClick={() => deleteField(index)}
                  >
                    Delete Branch
                  </button>
                )}
              </div>
            ))}

            <button
              className="bg-green-500 text-white rounded-md p-2 mt-4"
              type="button"
              onClick={addMoreFields}
            >
              Add More Branches
            </button>
          </div>
          <ClientManagementData />
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-green-200 w-full text-white p-3 mt-5 rounded-md hover:bg-green-500"
              disabled={isLoading}
            >
            {isLoading ? 'Processing...' : 'Send'}

            </button>
          </div>

        </form>
      </div>

    </div>
  </>
);
};

export default ClientManagement;
