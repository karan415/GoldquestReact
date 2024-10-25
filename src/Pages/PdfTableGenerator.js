import React, { useState } from 'react';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';

const PdfGenerator = () => {
  const [pdfData] = useState({
    name: 'John Doe',
    application_id: '12345',
    employee_id: 'E123',
    overall_status: 'Verified',
    status: 'Complete',
    updated_at: new Date().toISOString(),
  });

  const allInputDetails = [
    {
      annexureHeading: 'Annexure A',
      inputDetails: [
        { label: 'Detail 1', value: 'Value 1', type: 'text' },
        { label: 'Detail 2', value: '2020-01-01', type: 'datepicker' },
        { label: 'File Attachment', value: 'image1.png,image2.png', type: 'file' },
      ],
    },
  ];

  const [parentCustomer] = useState([{ name: 'Client Inc.' }]);
  const [cmtAllData] = useState({
    report_status: 'Final',
    dob: '1990-01-01',
    report_type: 'Standard',
    report_date: new Date().toISOString(),
  });

  const [serviceTitleValue] = useState([
    { title: 'Employment Verification', info_source: 'HR Department', verified_at: new Date().toISOString(), status: 'Completed' },
    { title: 'Education Verification', info_source: 'University', verified_at: new Date().toISOString(), status: 'Completed' },
  ]);

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
    <div>
      <h1>PDF Report Generator</h1>
      <PDFDownloadLink document={<MyDocument />} fileName="report.pdf">
        {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
      </PDFDownloadLink>
    </div>
  );
};

export default PdfGenerator;
