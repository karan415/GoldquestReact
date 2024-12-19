import { useEditClient } from './ClientEditContext';
import ServicesEditForm from './ServicesEditForm';
import { State } from 'country-state-city';

const states = State.getStatesOfCountry('IN');

export const ClientEditForm = () => {
    const options = states.map(state => ({ value: state.isoCode, label: state.name }));
    const { clientData, loading, handleClientChange, handleClientSubmit, setFiles } = useEditClient();
    const formattedDate = clientData.agreement_date.split("T")[0];

    let emails = clientData.emails;

    // Safely parse emails
    if (typeof emails === 'string') {
        try {
            emails = JSON.parse(emails);
        } catch (error) {
            console.error("Error parsing emails JSON:", error);
            emails = [];
        }
    }

    const newEmails = Array.isArray(emails) ? emails : [];

    const handleEmailChange = (index, value) => {
        const updatedEmails = [...newEmails];
        updatedEmails[index] = value;
        handleClientChange({ target: { name: 'emails', value: updatedEmails } });
    };

    const addNewEmailField = () => {
        const updatedEmails = [...newEmails, ""];
        handleClientChange({ target: { name: 'emails', value: updatedEmails } });
    };

    const handleFileChange = (fileName, e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prevFiles) => ({ ...prevFiles, [fileName]: selectedFiles }));
    };

    return (
        <>
            <form onSubmit={handleClientSubmit} className='p-5 bg-white rounded-md w-8/12 m-auto py-10 my-7 border ' >
                <h3 className='text-center font-bold text-2xl pb-5'>Edit Client</h3>
                <div className="md:flex gap-5">
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="name">Company Name: *</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.name}
                            onChange={handleClientChange}
                        />
                    </div>
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="client_unique_id">Client Code: *</label>
                        <input
                            type="text"
                            name="client_unique_id"
                            id="client_unique_id"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            disabled
                            value={clientData.client_unique_id}
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
                        <label className="text-gray-500" htmlFor="mobile">Mobile: *</label>
                        <input
                            type="number"
                            name="mobile"
                            id="mobile"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.mobile}
                            onChange={handleClientChange}
                        />
                    </div>

                </div>

                <div className="md:flex gap-5">

                    <div className="mb-4 md:w-6/12">
                        <label htmlFor="contact_person_name">Contact Person: *</label>
                        <input
                            type="text"
                            name="contact_person_name"
                            id="contact_person_name"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.contact_person_name}
                            onChange={handleClientChange}
                        />
                    </div>
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="state">State: *</label>
                        <select name="state" id="state" className="w-full border p-2 rounded-md mt-2" value={clientData.state} onChange={handleClientChange}>
                            {options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>

                <div className="md:flex gap-5">
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="escalation_point_contact">Name of the Escalation Point of Contact:*</label>
                        <input
                            type="text"
                            name="escalation_point_contact"
                            id="escalation_point_contact"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.escalation_point_contact}
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
                        <label className="text-gray-500" htmlFor="single_point_of_contact">Name of The Client SPOC:*</label>
                        <input
                            type="text"
                            name="single_point_of_contact"
                            id="single_point_of_contact"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.single_point_of_contact}
                            onChange={handleClientChange}
                        />
                    </div>

                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="gstin">GSTIN: *</label>
                        <input
                            type="text"
                            name="gst_number"
                            id="gst_number"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.gst_number}
                            onChange={handleClientChange}
                        />
                    </div>
                </div>

                <div className="md:flex gap-5">
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="tat">TAT: *</label>
                        <input
                            type="text"
                            name="tat_days"
                            id="tat_days"
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.tat_days}
                            onChange={handleClientChange}
                        />
                    </div>

                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="agreement_date">Date of Service Agreement:*</label>
                        <input
                            type="date"
                            name="agreement_date"
                            id="agreement_date"
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
                            rows={1}
                            className="border w-full rounded-md p-2 mt-2 outline-none"
                            value={clientData.client_standard}
                            onChange={handleClientChange}></textarea>
                    </div>
                    <div className="mb-4 md:w-6/12">
                        <label className="text-gray-500" htmlFor="agreement_duration">Agreement Period: *</label>

                        <select name="agreement_duration" className="border w-full rounded-md p-2 mt-2 outline-none" id="agreement_duration" onChange={handleClientChange} value={clientData.agreement_duration}>
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
                <label className="text-gray-500" htmlFor="emails">Emails:</label>
                <div className="flex gap-3 flex-wrap">
                    {newEmails.length > 0 ? (
                        newEmails.map((email, index) => (
                            <input
                                key={index}
                                type="email"
                                value={email}
                                className="border w-3/12 rounded-md p-2 mt-2 outline-none"
                                onChange={(e) => handleEmailChange(index, e.target.value)}
                            />
                        ))
                    ) : (
                        <p>No emails available</p>
                    )}
                </div>
                <button
                    type="button"
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={addNewEmailField}
                >
                    Add Email
                </button>
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
                        className="bg-green-600 w-full text-white p-3 mt-5 rounded-md hover:bg-green-500"
                    >
                        {loading ? 'Processing...' : 'Update'}
                    </button>
                </div>


            </form>
        </>
    )
}
