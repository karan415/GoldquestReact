import { createContext, useContext, useState } from "react";

// Create the context
const GenerateReportContext = createContext();

// Create the provider component
const GenerateReportProvider = ({ children }) => {
    const [formData, setFormData] = useState({
        updated_json: {
            month_year: '',
            initiation_date: '',
            organization_name: '',
            verification_purpose: '',
            employee_id: '',
            client_code: '',
            applicant_name: '',
            contact_number: '',
            contact_number2: '',
            father_name: '',
            dob: '',
            gender: '',
            marital_status: '',
            nationality: '',
            insuff: '',
            address: {
                address: '',
                landmark: '',
                residence_mobile_number: '',
                state: '',
            },
            permanent_address: {
                permanent_address: '',
                permanent_sender_name: '',
                permanent_reciever_name: '',
                permanent_landmark: '',
                permanent_pin_code: '',
                permanent_state: '',
            },
            insuffDetails: {
                first_insufficiency_marks: '',
                first_insuff_date: '',
                first_insuff_reopened_date: '',
                second_insufficiency_marks: '',
                second_insuff_date: '',
                second_insuff_reopened_date: '',
                third_insufficiency_marks: '',
                third_insuff_date: '',
                third_insuff_reopened_date: '',
                overall_status: '',
                report_date: '',
                report_status: '',
                report_type: '',
                final_verification_status: '',
                is_verify: '',
                deadline_date: '',
                insuff_address: '',
                basic_entry: '',
                education: '',
                case_upload: '',
                emp_spoc: '',
                report_generate_by: '',
                qc_done_by: '',
                delay_reason: '',
            },
        },
    });

    const [annexure, setAnnexure] = useState({});

    const handleInputChange2 = (e) => {
        const { name, value } = e.target;
        setAnnexure((prevInput) => ({ ...prevInput, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name.startsWith('updated_json.address.')) {
            const nestedField = name.split('.').slice(2).join('.'); // Get the nested field
            setFormData(prevFormData => ({
                updated_json: {
                    ...prevFormData.updated_json,
                    address: {
                        ...prevFormData.updated_json.address,
                        [nestedField]: value
                    }
                }
            }));
        } else if (name.startsWith('updated_json.permanent_address.')) {
            const nestedField = name.split('.').slice(2).join('.');
            setFormData(prevFormData => ({
                updated_json: {
                    ...prevFormData.updated_json,
                    permanent_address: {
                        ...prevFormData.updated_json.permanent_address,
                        [nestedField]: value
                    }
                }
            }));
        } else if (name.startsWith('updated_json.insuffDetails.')) {
            const nestedField = name.split('.').slice(2).join('.');
            setFormData(prevFormData => ({
                updated_json: {
                    ...prevFormData.updated_json,
                    insuffDetails: {
                        ...prevFormData.updated_json.insuffDetails,
                        [nestedField]: value
                    }
                }
            }));
        } else {
            // For top-level fields and other nested structures
            setFormData(prevFormData => ({
                updated_json: {
                    ...prevFormData.updated_json,
                    [name]: value // Directly set the value for top-level fields
                }
            }));
        }
    };
    
    

    const sendReport = async () => {
        try {
            const response = await fetch('YOUR_API_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Success:', result);
            // Handle success (e.g., update UI or reset form)
        } catch (error) {
            console.error('Error sending report:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <GenerateReportContext.Provider value={{ formData, setFormData, handleInputChange, handleInputChange2, annexure, setAnnexure, sendReport }}>
            {children}
        </GenerateReportContext.Provider>
    );
}

// Custom hook to use the GenerateReportContext
export const useGenerateReport = () => useContext(GenerateReportContext);

export default GenerateReportProvider;
