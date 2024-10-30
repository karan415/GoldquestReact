import React, { useMemo } from 'react';
import { useEditClient } from './ClientEditContext';
import countryList from 'react-select-country-list';
import ServicesEditForm from './ServicesEditForm';

export const ClientEditForm = () => {
    const options = useMemo(() => countryList().getData(), []);
    const { clientData, loading, handleClientChange, handleClientSubmit, setFiles } = useEditClient();
    const initialDate = clientData.date_agreement;
    const formattedDate = initialDate.split("T")[0];
 
    // Initialize newEmails safely
    let newEmails = [];
    try {
        if (clientData.emails) {
            newEmails = JSON.parse(clientData.emails);
            // Ensure it's an array
            if (!Array.isArray(newEmails)) {
                newEmails = [];
            }
        }
    } catch (error) {
        console.error('Error parsing emails:', error);
    }

    const handleEmailChange = (index, value) => {
        const updatedEmails = [...newEmails];
        updatedEmails[index] = value;
        handleClientChange({ target: { name: 'emails', value: JSON.stringify(updatedEmails) } });
    };

    const handleFileChange = (fileName, e) => {

        const selectedFiles = Array.from(e.target.files);
        setFiles((prevFiles) => {
            return {
                ...prevFiles,
                [fileName]: selectedFiles,
            };
        });
    };

  


    return (
        <>
            <form onSubmit={handleClientSubmit} className='p-5 bg-white rounded-md w-8/12 m-auto py-10 my-7 border ' >
                <h3 className='text-center font-bold text-2xl pb-5'>Edit Client</h3>
                <div className="md:flex gap-5">
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="company_name">Company Name: *</label>
                        <input
                            type="text"
                            name="company_name"
                            id="company_name"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.company_name}
                            onChange={handleClientChange}
                        />
                    </div>
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="client_code">Client Code: *</label>
                        <input
                            type="text"
                            name="client_code"
                            id="client_code"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            disabled
                            value={clientData.client_code}
                            onChange={handleClientChange}
                        />
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
                            value={clientData.address}
                            onChange={handleClientChange}
                        />
                    </div>
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="mobile_number">Mobile: *</label>
                        <input
                            type="number"
                            name="mobile_number"
                            id="mobile_number"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.mobile_number}
                            onChange={handleClientChange}
                        />
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
                            value={clientData.contact_person}
                            onChange={handleClientChange}
                        />
                    </div>
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="state">State: *</label>
                        <select name="state" id="state" className="w-full border p-2 rounded-md mt-2" value={clientData.state} onChange={handleClientChange}>
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>

                <div className="md:flex gap-5">
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="name_of_escalation">Name of the Escalation Point of Contact:*</label>
                        <input
                            type="text"
                            name="name_of_escalation"
                            id="name_of_escalation"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.name_of_escalation}
                            onChange={handleClientChange}
                        />
                    </div>
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="state_code">State Code: *</label>
                        <input
                            type="number"
                            name="state_code"
                            id="state_code"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.state_code}
                            onChange={handleClientChange}
                        />
                    </div>
                </div>

                <div className="md:flex gap-5">
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="client_spoc">Name of The Client SPOC:*</label>
                        <input
                            type="text"
                            name="client_spoc"
                            id="client_spoc"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.client_spoc}
                            onChange={handleClientChange}
                        />
                    </div>

                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="gstin">GSTIN: *</label>
                        <input
                            type="text"
                            name="gstin"
                            id="gstin"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.gstin}
                            onChange={handleClientChange}
                        />
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
                            value={clientData.tat}
                            onChange={handleClientChange}
                        />
                    </div>

                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="date_agreement">Date of Service Agreement:*</label>
                        <input
                            type="date"
                            name="date_agreement"
                            id="date_agreement"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={formattedDate}
                            onChange={handleClientChange}
                        />
                    </div>
                </div>

                <div className="md:flex gap-5">
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="client_standard">Client Standard Procedure:</label>
                        <textarea name="client_standard"
                            id="client_standard"
                            rows={2}
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.client_standard}
                            onChange={handleClientChange}></textarea>
                    </div>
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="agreement_period">Agreement Period: *</label>

                        <select name="agreement_period" className="border w-full rounded-md p-2 mt-2 outline-none" id="agreement_period" onChange={handleClientChange} value={clientData.agreement_period}>
                            <option value="Unless terminated" selected>Unless terminated</option>
                            <option value="1 year">1 year</option>
                            <option value="2 year">2 year</option>
                            <option value="3 year">3 year</option>
                        </select>
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
                    <label className="text-gray-500" htmlFor="agr_upload">Emails</label>
                    <div className="flex gap-3 flex-wrap">
                        {newEmails.length > 0 ? (
                            newEmails.map((email, index) => (
                                <input
                                    key={index}
                                    type="email"
                                    name={`email-${index}`}
                                    id={`email-${index}`}
                                    value={email}
                                    className="border w-3/12 rounded-md p-2 mt-2 outline-none"
                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                />
                            ))
                        ) : (
                            <p>No emails available</p>
                        )}
                    </div>

                </div>

                <div className="mb-4">
                    <label className="text-gray-500" htmlFor="custom_template">Required Custom Template:*</label>
                    <select name="custom_template" id="custom_template" value={clientData.custom_template} className="border w-full rounded-md p-2 mt-2 outline-none" onChange={handleClientChange}>
                        <option value="yes">yes</option>
                        <option value="no">no</option>
                    </select>
                    {clientData.custom_template === 'yes' && (
                        <>
                            <div className="mb-4 mt-4">
                                <label htmlFor="custom_logo" className="text-gray-500">Upload Custom Logo :*</label>
                                <input
                                    type="file"
                                    name="custom_logo"
                                    id="custom_logo"
                                    onChange={(e) => handleFileChange('custom_logo', e)}
                                    className="border w-full rounded-md p-2 mt-2 outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="" className="text-gray-500">Custom Address</label>
                                <textarea
                                    name="custom_address"
                                    id="custom_address"
                                    onChange={handleClientChange}
                                    value={clientData.custom_address}
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
                                checked={clientData.additional_login === "Yes"}
                                onChange={handleClientChange}
                                className="me-2"
                            />Yes
                        </div>
                        <div>
                            <input
                                type="radio"
                                name="additional_login"
                                value="No"
                                checked={clientData.additional_login === "No"}
                                onChange={handleClientChange}
                                className="me-2"
                            />No
                        </div>
                    </div>
                    {clientData.additional_login === "Yes" && (
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="username2"
                            value={clientData.username}
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            onChange={handleClientChange}
                        />
                    )}
                </div>
                <ServicesEditForm />

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-green-200 w-full text-white p-3 mt-5 rounded-md hover:bg-green-500"
                    >
                        {loading ? 'Processing...' : 'Update'}
                    </button>
                </div>


            </form>
        </>
    )
}
