import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useApi } from '../ApiContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { useSidebar } from '../Sidebar/SidebarContext';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { BranchContextExel } from './BranchContextExel';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
const ExelTrackerStatus = () => {
    const { handleTabChange } = useSidebar();
    const [itemsPerPage, setItemPerPage] = useState(10)
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [allInputDetails, setAllInputDetails] = useState([]);
    const [parentCustomer, setParentCustomer] = useState([]);
    const [pdfData, setPdfData] = useState([]);
    const [serviceTitleValue, setServiceTitleValue] = useState([]);
    const [cmtAllData, setCmtAllData] = useState([]);
    const printRef = React.useRef();
    const [dbHeadingsStatus, setDBHeadingsStatus] = useState({});
    const [applicationData, setApplicationData] = useState([]);
    const [expandedRows, setExpandedRows] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serviceHeadings, setServiceHeadings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const { branch_id, setApplicationId, setServiceId } = useContext(BranchContextExel);
    const API_URL = useApi();
    const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
    const storedToken = localStorage.getItem("_token");
    const [options, setOptions] = useState([]);
    const requestOptions = {
        method: "GET",
        redirect: "follow",
    };

    const fetchApplications = useCallback(() => {
        setLoading(true);
        fetch(`${API_URL}/client-master-tracker/applications-by-branch?branch_id=${branch_id}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        const errorData = JSON.parse(text);
                        Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                        throw new Error(errorData.message);
                    });
                }
                return response.json();
            })
            .then(data => {
                const newToken = data._token || data.token;
                if (newToken) {
                    localStorage.setItem("_token", newToken);
                }
                setApplicationData(data.customers || []);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                setError('Failed to load data');
            })
            .finally(() => setLoading(false));
    }, [API_URL, branch_id, admin_id, storedToken]);

    console.log('serviceHeadings', serviceHeadings)

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);
    const handleToggle = useCallback((index, services, id) => {
        if (!admin_id || !storedToken || !id) {
            console.error("Missing required parameters");
            return;
        }


        const newExpandedRow = expandedRows === index ? null : index;
        setExpandedRows(newExpandedRow);

        if (newExpandedRow === index && services) {
            const servicesArray = services.split(',').map(Number);


            const uniqueServiceHeadings = new Set();
            const uniqueStatuses = new Set();


            Promise.all(
                servicesArray.map(serviceId => {
                    const url = `${API_URL}/client-master-tracker/report-form-json-by-service-id?service_id=${serviceId}&admin_id=${admin_id}&_token=${storedToken}`;

                    return fetch(url, requestOptions)
                        .then(response => {
                            if (!response.ok) throw new Error('Network response was not ok');
                            return response.json();
                        })
                        .then(result => {
                            const { reportFormJson } = result;
                            const parsedData = JSON.parse(reportFormJson.json);
                            const { heading, db_table } = parsedData;

                            // Add unique heading to the Set
                            uniqueServiceHeadings.add(heading);

                            // Convert the Set to an array before updating state
                            setServiceHeadings(prev => ({
                                ...prev,
                                [id]: Array.from(uniqueServiceHeadings)  // Convert Set to Array
                            }));

                            // Update token if available
                            const newToken = result._token || result.token;
                            if (newToken) localStorage.setItem("_token", newToken);
                            return db_table;
                        })
                        .catch(error => console.error('Fetch error:', error));
                })
            ).then(parsedDbs => {
                const uniqueDbNames = [...new Set(parsedDbs.filter(Boolean))];

                // Fetch annexure data for unique DB tables
                const annexureFetches = uniqueDbNames.map(db_name => {
                    const url = `${API_URL}/client-master-tracker/annexure-data?application_id=${id}&db_table=${db_name}&admin_id=${admin_id}&_token=${storedToken}`;

                    return fetch(url, requestOptions)
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                            return response.json();
                        })
                        .then(result => {
                            const status = result?.annexureData?.status || 'N/A';

                            // Add unique status
                            uniqueStatuses.add(status);

                            return {
                                db_table: db_name,
                                status
                            };
                        })
                        .catch(error => console.error("Fetch error: ", error));
                });


                return Promise.all(annexureFetches).then(annexureStatusArr => {
                    setDBHeadingsStatus(prev => ({
                        ...prev,
                        [id]: annexureStatusArr
                    }));


                    // console.log('Unique Service Headings:', Array.from(uniqueServiceHeadings));
                    // console.log('Unique Statuses:', Array.from(uniqueStatuses));
                });
            })
                .catch(error => console.error("Error during service fetch or annexure fetch: ", error));
        }
    }, [expandedRows, admin_id, storedToken, API_URL, requestOptions]);

    const generateReport = (id, services) => {
        navigate('/candidate');
        setApplicationId(id);
        setServiceId(services);
    };


    const handleDownloadPdf = async (id, branch_id) => {


        if (!id || !branch_id) {
            return Swal.fire('Error!', 'Something is missing', 'error');
        }

        const adminId = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://goldquestreact.onrender.com/client-master-tracker/application-by-id?application_id=${id}&branch_id=${branch_id}&admin_id=${adminId}&_token=${storedToken}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                const errorData = JSON.parse(errorText);
                Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                throw new Error(errorText);
            }

            const data = await response.json();
            const applications = data.application;
            const serviceIdsArr = applications?.services?.split(',') || [];
            const serviceTitleValue = [];

            // Fetch service data
            if (serviceIdsArr.length > 0) {
                const serviceFetchPromises = serviceIdsArr.map(async (serviceId) => {
                    const requestOptions = {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        redirect: "follow",
                    };

                    const serviceInfoUrl = `https://goldquestreact.onrender.com/service/service-info?id=${serviceId}&admin_id=${adminId}&_token=${storedToken}`;
                    const applicationServiceUrl = `https://goldquestreact.onrender.com/client-master-tracker/application-service?service_id=${serviceId}&application_id=${id}&admin_id=${adminId}&_token=${storedToken}`;

                    const [serviceResponse, applicationResponse] = await Promise.all([
                        fetch(serviceInfoUrl, requestOptions),
                        fetch(applicationServiceUrl, requestOptions),
                    ]);

                    if (!serviceResponse.ok || !applicationResponse.ok) {
                        return null; // Early exit if any request fails
                    }

                    const serviceData = await serviceResponse.json();
                    const applicationData = await applicationResponse.json();

                    const title = serviceData.service.title || "N/A";
                    serviceTitleValue.push({
                        title,
                        status: applicationData.annexureData?.status || "N/A",
                        info_source: applicationData.annexureData?.info_source || "N/A",
                        verified_at: applicationData.annexureData?.verified_at || "N/A",
                        color_status: applicationData.annexureData?.color_status || "N/A",
                    });
                });

                await Promise.all(serviceFetchPromises);
                setServiceTitleValue(serviceTitleValue);
            }

            // Fetch report form details
            const allInputDetails = [];
            const servicesArray = serviceIdsArr.map(Number);

            await Promise.all(
                servicesArray.map(async (serviceId) => {
                    const response = await fetch(
                        `https://goldquestreact.onrender.com/client-master-tracker/report-form-json-by-service-id?service_id=${serviceId}&admin_id=${adminId}&_token=${storedToken}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (!response.ok) {
                        const errorText = await response.text();
                        const errorData = JSON.parse(errorText);
                        Swal.fire('Error!', `An error occurred: ${errorData.message}`, 'error');
                        throw new Error(errorText);
                    }

                    const data = await response.json();
                    const newToken = data._token || data.token;
                    if (newToken) {
                        localStorage.setItem("_token", newToken);
                    }

                    let parsedJson;
                    try {
                        parsedJson = JSON.parse(data.reportFormJson.json || '{}');
                    } catch (error) {
                        console.error("Failed to parse reportFormJson:", error);
                        return;
                    }

                    if (parsedJson.db_table && parsedJson.heading) {
                        const annexureHeading = parsedJson.heading;
                        const annexureURL = `https://goldquestreact.onrender.com/client-master-tracker/annexure-data?application_id=${id}&db_table=${parsedJson.db_table}&admin_id=${adminId}&_token=${storedToken}`;

                        const annexureResponse = await fetch(annexureURL, { method: "GET", redirect: "follow" });
                        if (!annexureResponse.ok) {
                            return;
                        }

                        const annexureResult = await annexureResponse.json();
                        const inputDetails = [];

                        const annexureData = annexureResult.annexureData;
                        parsedJson.rows.forEach(row => {
                            row.inputs.forEach(input => {
                                const value = annexureData && Array.isArray(annexureData)
                                    ? (annexureData.find(item => item.name === input.name)?.value || 'N/A')
                                    : (annexureData?.[input.name] || 'N/A');

                                inputDetails.push({
                                    label: input.label,
                                    name: input.name,
                                    type: input.type,
                                    value: value,
                                    options: input.options || undefined,
                                });
                            });
                        });

                        allInputDetails.push({ annexureHeading, inputDetails });
                    }
                })
            );

            setAllInputDetails(allInputDetails);

            // Prepare for PDF generation
            setPdfData(applications);
            const cmtData = data.CMTData;
            setCmtAllData(cmtData);

        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to load client data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSelectOptions = useCallback(() => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        fetch(`${API_URL}/client-master-tracker/branch-filter-options?branch_id=${branch_id}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((result) => {
                setOptions(result.filterOptions);
            })
            .catch((error) => console.error('Error fetching options:', error));
    }, []);


    useEffect(() => {
        fetchSelectOptions();
    }, [fetchSelectOptions])



    const fetchCustomers = useCallback(() => {
        const admin_id = JSON.parse(localStorage.getItem("admin"))?.id;
        const storedToken = localStorage.getItem("_token");

        const requestOptions = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json' // Optional, may not be needed for GET
            },
            redirect: "follow"
        };

        fetch(`https://goldquestreact.onrender.com/client-master-tracker/customer-info?customer_id=${applicationData[0]?.customer_id}&admin_id=${admin_id}&_token=${storedToken}`, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // Assuming the response is JSON
            }).then((data) => {
                setParentCustomer(data.customers)
            })

            .catch((error) => console.error('Error fetching customers:', error));
    }, [applicationData])

    useEffect(() => {

        fetchCustomers();
    }, [fetchCustomers]);

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };


    const filteredItems = applicationData.filter(item => {
        return (
            item.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });



    const filteredOptions = filteredItems.filter(item =>
        item.status.toLowerCase().includes(selectedStatus.toLowerCase())
    );


    const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOptions.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showPrev = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const showNext = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };


    const renderPagination = () => {
        const pageNumbers = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                if (!pageNumbers.includes(i)) {
                    pageNumbers.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }


            if (!pageNumbers.includes(totalPages)) {
                pageNumbers.push(totalPages);
            }
        }



        return pageNumbers.map((number, index) => (
            number === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
            ) : (
                <button
                    type="button"
                    key={`page-${number}`} // Unique key for page buttons
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-1 rounded-0 ${currentPage === number ? 'bg-green-500 text-white' : 'bg-green-300 text-black border'}`}
                >
                    {number}
                </button>
            )
        ));
    };


    const handleSelectChange = (e) => {

        const selectedValue = e.target.value;
        setItemPerPage(selectedValue)
    }

    const goBack = () => {
        handleTabChange('client_master');
    }


    const getColumnWidth = (numColumns) => `${100 / numColumns}%`;

    const styles = StyleSheet.create({
        page: {
            padding: 20,
            backgroundColor: '#ffffff',
        },
        tableCell: {
            borderLeftWidth: 1,
            borderLeftColor: '#000',
            padding: 12,
            width: '16.66%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
        },
        greenBox: {
            height: 15,
            width: 15,
            backgroundColor: 'green',
            marginRight: 10,
        },
        redBox: {
            height: 15,
            width: 15,
            backgroundColor: 'red',
            marginRight: 10,
        },
        orangeBox: {
            height: 15,
            width: 15,
            backgroundColor: 'orange',
            marginRight: 10,
        },
        pinkBox: {
            height: 15,
            width: 15,
            backgroundColor: 'pink',
            marginRight: 10,
        },
        yellowBox: {
            height: 15,
            width: 15,
            backgroundColor: 'yellow',
            marginRight: 10,
        },
        title: {
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        row: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#000',
        },
        cell: {
            border: '1px solid #000',
            padding: 10,
            fontSize: 12,
            textAlign: 'left',
            width: '50%',
        },
        header: {
            backgroundColor: '#f0f0f0',
            fontWeight: 'bold',
        },
        disclaimer: {
            fontSize: 10,
            marginTop: 10,
            borderTop: '1pt solid #000',
            paddingTop: 10,
            textAlign: 'center',
        },
        headerText: {
            fontSize: 10,
            textAlign: 'center',
            whiteSpace: 'nowrap',
        },
        border: {
            borderLeft: '1pt solid #000',
            padding: 4,
        }
    });


    const MyDocument = () => (
  
        <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Confidential Background Verification Report
            </Text>
            <View style={styles.row}>
                <View style={styles.row}>
                    <Text style={styles.cell}>Name of the Candidate</Text>
                    <Text style={styles.cell}>{pdfData?.name || ' N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.cell}>Application ID</Text>
                    <Text style={styles.cell}>{pdfData?.application_id || ' N/A'}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.row}>
                    <Text style={styles.cell}>Client Name</Text>
                    <Text style={styles.cell}>{parentCustomer[0]?.name || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.cell}>Report Status</Text>
                    <Text style={styles.cell}>{cmtAllData?.report_status || ' N/A'}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.row}>
                    <Text style={styles.cell}>Date of Birth</Text>
                    <Text style={styles.cell}>
                        {cmtAllData.dob ? new Date(cmtAllData.dob).toLocaleDateString() : 'N/A'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.cell}>Report Type</Text>
                    <Text style={styles.cell}>{cmtAllData.report_type || 'N/A'}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.row}>
                    <Text style={styles.cell}>Overall Report Status</Text>
                    <Text style={styles.cell}>{pdfData.status || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.cell}>Overall Report Status</Text>
                    <Text style={styles.cell}>{pdfData.status || 'N/A'}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.row}>
                    <Text style={styles.cell}>Overall Report Status</Text>
                    <Text style={styles.cell}>{pdfData.status || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.cell}>Overall Report Status</Text>
                    <Text style={styles.cell}>{pdfData.status || 'N/A'}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.row}>
                    <Text style={styles.cell}>Overall Report Status</Text>
                    <Text style={styles.cell}>{pdfData.status || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.cell}>Overall Report Status</Text>
                    <Text style={styles.cell}>{pdfData.status || 'N/A'}</Text>
                </View>
            </View>
    
    
    
    
    
            <View style={{ width: '100%', marginBottom: 20, marginTop: 20 }}>
                <View style={{ flexDirection: 'row', backgroundColor: '#22c55e', color: '#fff' }}>
                    <View style={{ border: '1px solid #000', padding: 12, flex: 1, textAlign: 'center' }}>
                        <Text style={{ fontSize: 13 }}>Report Components</Text>
                    </View>
                    <View style={{ border: '1px solid #000', padding: 12, flex: 1, textAlign: 'center' }}>
                        <Text style={{ fontSize: 13 }}>Information Source</Text>
                    </View>
                    <View style={{ border: '1px solid #000', padding: 12, flex: 2, textAlign: 'center' }}>
                        <Text style={{ fontSize: 13 }}>Components Status</Text>
                        <View style={{ flexDirection: 'row', backgroundColor: '#22c55e', color: '#fff', marginTop: 10 }}>
                            <View style={{ flex: 1, textAlign: 'center' }}>
                                <Text style={{ fontSize: 13 }}>Completed Date</Text>
                            </View>
                            <View style={{ flex: 1, textAlign: 'center' }}>
                                <Text style={{ fontSize: 13 }}>Verification Status</Text>
                            </View>
                        </View>
                    </View>
                </View>
    
    
    
                {serviceTitleValue.map(item => (
                    <View key={item.title} style={{ flexDirection: 'row' }}>
                        <View style={{ border: '1px solid #000', padding: 12, flex: 1, textAlign: 'left' }}>
                            <Text style={{ fontSize: 13 }}>{item.title}</Text>
                        </View>
                        <View style={{ border: '1px solid #000', padding: 12, flex: 1, textAlign: 'left' }}>
                            <Text style={{ fontSize: 13 }}>{item.info_source}</Text>
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <View style={{ border: '1px solid #000', padding: 12, flex: 1, textAlign: 'center' }}>
                                <Text style={{ fontSize: 13 }}>
                                    {item.verified_at
                                        ? new Date(item.verified_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'N/A'}
                                </Text>
                            </View>
                            <View style={{ border: '1px solid #000', padding: 12, flex: 1, textAlign: 'center' }}>
                                <Text style={{ fontSize: 13 }}>{item.status.replace(/[_-]/g, ' ')}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
    
    
            <View style={{ width: '100%' }}>
                <Text style={styles.title}>
                    End of summary report
                </Text>
    
                <View>
                    <Text style={styles.title}>Component Status</Text>
                </View>
                <View style={{ width: '100%', marginTop: 30, borderWidth: 1, borderColor: '#000' }}>
    
                    <View style={{ flexDirection: 'row' }}>
                        <View style={[styles.row, styles.border, { width: getColumnWidth(5) }]}>
                            <View style={styles.greenBox}></View>
                            <Text style={styles.headerText}>Report Component</Text>
                        </View>
                        <View style={[styles.row, styles.border, { width: getColumnWidth(5) }]}>
                            <View style={styles.redBox}></View>
                            <Text style={styles.headerText}>Information Source</Text>
                        </View>
                        <View style={[styles.row, styles.border, { width: getColumnWidth(5) }]}>
                            <View style={styles.orangeBox}></View>
                            <Text style={styles.headerText}>Component Status</Text>
                        </View>
                        <View style={[styles.row, styles.border, { width: getColumnWidth(5) }]}>
                            <View style={styles.pinkBox}></View>
                            <Text style={styles.headerText}>Component Status</Text>
                        </View>
                        <View style={[styles.row, styles.border, { width: getColumnWidth(5) }]}>
                            <View style={styles.yellowBox}></View>
                            <Text style={styles.headerText}>Component Status</Text>
                        </View>
                    </View>
    
                </View>
            </View>
    

            <Text style={styles.title}>Additional Details</Text>
            {allInputDetails.map((annexure, index) => (
                <View key={index} style={{ marginBottom: 20 }}>
                    <Text style={{ padding: 10, backgroundColor: '#22c55e', color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
                        {annexure.annexureHeading}
                    </Text>
                    <View style={{ padding: 10 }}>
                        {annexure.inputDetails.map((input, idx) => (
                            <View key={idx} style={{ marginVertical: 5 }}>
                                <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                                    <Text style={{ flex: 1, fontWeight: 'bold' }}>{input.label}:</Text>
                                    <Text style={{ flex: 2 }}>
                                        {input.type === 'datepicker'
                                            ? input.value ? new Date(input.value).toLocaleDateString() : 'N/A'
                                            : input.value || 'N/A'}
                                    </Text>
                                </View>
                                {input.type === 'file' && input.value ? (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 5 }}>
                                        {input.value.split(',').map((url, index) => (
                                            <Image
                                                key={index}
                                                source={{ uri: `https://goldquestreact.onrender.com/${url.trim()}` }}
                                                style={{ width: '100%', height: 200, marginVertical: 5 }} // Full width, adjust height as needed
                                                resizeMode="contain" // Maintain aspect ratio
                                            />
                                        ))}
                                    </View>
                                ) : null}
                            </View>
                        ))}
                    </View>
                </View>
            ))}
    
            <View style={{ border: '1px solid #000', borderTop: '0px', padding: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Remarks</Text>:
                <Text style={{ fontSize: 10 }}>
                    The following applicant details are verbally verified by Mr. Prashant Vishwas, (Head Constable), and the notary report duly stamped and signed by Mr. Harsh Shukla (Advocate) with comment on criminal record not found. Hence closing the check as GREEN and the same is furnished as annexure.
                </Text>
            </View>
    
            <Text style={{ fontWeight: 'bold', marginTop: 10, fontSize: 12 }}>Annexure - 1 (A)</Text>
    
            <View style={{ textAlign: 'center' }}>
                <Text style={{ textTransform: 'uppercase', fontSize: 16 }}>Lorem, ipsum dolor.</Text>
                <Text style={{ textTransform: 'uppercase', fontSize: 16 }}>Lorem ipsum dolor sit amet consectetur.</Text>
                <Text style={{ textTransform: 'uppercase', fontSize: 16 }}>Lorem ipsum dolor sit.</Text>
                <View style={{ borderBottomWidth: 1, marginVertical: 10 }} />
            </View>
    
    
            <View>
                <Text style={{ backgroundColor: 'green', color: '#fff', padding: 10, width: '100%', textAlign: 'center', borderRadius: 10 }}>
                    Disclaimer
                </Text>
                <Text style={{ paddingBottom: 15, fontSize: 10 }}>
                    This report is confidential and is meant for the exclusive use of the Client. This report has been prepared solely for the purpose set out pursuant to our letter of engagement (LoE)/Agreement signed with you and is not to be used for any other purpose. The Client recognizes that we are not the source of the data gathered and our reports are based on the information provided.
                </Text>
                <Text style={{ border: '1px solid #000', padding: 10, width: '100%', textAlign: 'center', borderRadius: 10 }}>
                    End of detail report
                </Text>
            </View>
    
    
            <Text style={styles.disclaimer}>
                This report is confidential and is meant for the exclusive use of the Client.
            </Text>
        </Page>
    </Document>
      );


    return (
        <>
            <div className='p-3 my-14'>
                {loading && <div className="loader">Loading...</div>}
                {error && <div>Error: {error}</div>}
                <div className='flex gap-4 justify-end p-4'>
                    <select id="" name='status' onChange={handleStatusChange} className='outline-none border-2 p-2 rounded-md w-5/12 my-4 md:my-0' >
                        {options.map((item, index) => {
                            return item.status !== 'closed' ? (
                                <option key={index} value={item.status}>
                                    {item.status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - {item.count}
                                </option>
                            ) : null;
                        })}


                    </select>
                </div>
                <div className="overflow-x-auto  mx-4 bg-white shadow-md rounded-md">
                    <div className="md:flex justify-between items-center md:my-4 border-b-2 pb-4">
                        <div className="col">
                            <form action="">
                                <div className="flex gap-5 justify-between">
                                    <select name="options" id="" onChange={handleSelectChange} className='outline-none pe-14 ps-2 text-left rounded-md w-10/12'>
                                        <option value="10">10 Rows</option>
                                        <option value="20">20 Rows</option>
                                        <option value="50">50 Rows</option>
                                        <option value="100">100 Rows</option>
                                        <option value="200">200 Rows</option>
                                        <option value="300">300 Rows</option>
                                        <option value="400">400 Rows</option>
                                        <option value="500">500 Rows</option>
                                    </select>
                                    <button className="bg-green-600 text-white py-3 px-8 rounded-md capitalize" type='button'>exel</button>
                                    <button onClick={goBack} className="bg-green-500 mx-2 whitespace-nowrap hover:bg-green-400 text-white rounded-md p-3">Go Back</button>

                                </div>
                            </form>
                        </div>
                        <div className="col md:flex justify-end ">
                            <form action="">
                                <div className="flex md:items-stretch items-center  gap-3">
                                    <input
                                        type="search"
                                        className='outline-none border-2 p-2 rounded-md w-full my-4 md:my-0'
                                        placeholder='Search by Client Code, Company Name, or Client Spoc'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button className='bg-green-500 p-3 rounded-md text-whitevhover:bg-green-200 text-white'>Serach</button>
                                </div>
                            </form>
                        </div>

                    </div>
                    {currentItems.length > 0 ? (
                        <>
                            <table className="min-w-full">
                                <thead>
                                    <tr className='bg-green-500'>
                                        <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">SL NO</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Application ID</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">NAME OF THE APPLICANT</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">APPLICANT EMPLOYEE ID</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Initiation Date</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Download Status</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Overall Status</th>
                                        <th className="py-3 px-4 border-b text-left border-r-2 uppercase whitespace-nowrap text-white">Report Data</th>
                                        <th className="py-3 px-4 border-b text-center uppercase whitespace-nowrap text-white">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <React.Fragment key={item.id}>
                                            <tr>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                    <input type="checkbox" className='me-2' />     {index + 1 + (currentPage - 1) * itemsPerPage}
                                                </td>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.application_id}</td>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.name}</td>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.employee_id}</td>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.created_at}</td>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                <PDFDownloadLink document={<MyDocument />} fileName="report.pdf">
                                                <button className="bg-green-500 hover:bg-green-400 rounded-md p-3 text-white" onClick={() => handleDownloadPdf(item.id, item.branch_id)}>Download Report</button>
                                                </PDFDownloadLink>
                                                </td>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">{item.overall_status}</td>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                    <button className="bg-green-400 rounded-md text-white p-3" onClick={() => generateReport(item.id, item.services)}>Generate Report</button>
                                                </td>
                                                <td className="py-3 px-4 border-b border-r-2 whitespace-nowrap capitalize">
                                                    <button
                                                        className="bg-green-500 hover:bg-green-400 rounded-md p-3 text-white"
                                                        onClick={() => handleToggle(index, item.services, item.id)}
                                                    >
                                                        {expandedRows === index ? "Hide Details" : "View More"}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows === index && (
                                                <tr>
                                                    <td colSpan="9" className="p-0">
                                                        <div className='collapseMenu overflow-auto w-full max-w-[1500px]'>
                                                            <table className="min-w-full max-w-full bg-gray-100">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">TAT Day</th>
                                                                        <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Batch No</th>
                                                                        <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap   fhghghghghghghghghghgf">Subclient</th>
                                                                        {serviceHeadings[item.id]?.map((value, index) => (
                                                                            <th key={index} className="service-th py-3 px-4 border-b text-left uppercase whitespace-nowrap">
                                                                                {value || 'Initiated'}
                                                                            </th>
                                                                        ))}


                                                                        <th className="py-3 px-4 border-b text-left uppercase whitespace-nowrap">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td className="py-3 px-4 border-b whitespace-nowrap capitalize">{item.tatday}</td>
                                                                        <td className="py-3 px-4 border-b whitespace-nowrap capitalize">{item.batch_number}</td>
                                                                        <td className="py-3 px-4 border-b whitespace-nowrap capitalize">{item.sub_client}</td>
                                                                        {dbHeadingsStatus[item.id]?.map((value, index) => (
                                                                            <td key={index} className=" py-3 px-4 border-b whitespace-nowrap capitalize">{value?.status || 'N/A'}</td>
                                                                        ))}

                                                                        <td className="py-3 px-4 border-b whitespace-nowrap capitalize">
                                                                            <button className="bg-red-500 hover:bg-red-400 text-white rounded-md p-3">Delete</button>

                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                        </>) : (

                        <><p className='text-center p-5'>No Data Available</p></>
                    )}
                </div>
                <div className="flex items-center justify-end rounded-md bg-white px-4 py-3 sm:px-6 md:m-4 mt-2">
                    <button
                        type='button'
                        onClick={showPrev}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        aria-label="Previous page"
                    >
                        <MdArrowBackIosNew />
                    </button>
                    <div className="flex items-center">
                        {renderPagination()}
                    </div>
                    <button
                        type="button"
                        onClick={showNext}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-0 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        aria-label="Next page"
                    >
                        <MdArrowForwardIos />
                    </button>
                </div>

            </div>
        </>

    );
};

export default ExelTrackerStatus;