import React, { useState } from 'react';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const PdfGenerator = () => {
  const [pdfData, setPdfData] = useState({
    name: 'John Doe',
    application_id: '12345',
    employee_id: 'E123',
    overall_status: 'Verified',
    status: 'Complete',
    updated_at: new Date().toISOString(),
  });

  const [parentCustomer, setParentCustomer] = useState([{ name: 'Client Inc.' }]);
  const [cmtAllData, setCmtAllData] = useState({
    report_status: 'Final',
    dob: '1990-01-01',
    report_type: 'Standard',
    report_date: new Date().toISOString(),
  });

  const [serviceTitleValue, setServiceTitleValue] = useState([
    { title: 'Employment Verification', info_source: 'HR Department', verified_at: new Date().toISOString(), status: 'Completed' },
    { title: 'Education Verification', info_source: 'University', verified_at: new Date().toISOString(), status: 'Completed' },
  ]);

  const styles = StyleSheet.create({
    page: {
      padding: 20,
      backgroundColor: '#ffffff',
    },
    title: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    table: {
      width: '100%',
      marginBottom: 20,
      borderCollapse: 'collapse',
    },
    header: {
      backgroundColor: '#f0f0f0',
      padding: 10,
      fontWeight: 'bold',
    },
    cell: {
      padding: 10,
      border: '1pt solid #000',
      fontSize: 12,
      textAlign: 'left',
    },
    row: {
      flexDirection: 'row',
      marginBottom: 5,
    },
    disclaimer: {
      fontSize: 10,
      marginTop: 10,
      borderTop: '1pt solid #000',
      paddingTop: 10,
      textAlign: 'center',
    },
  });

  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>CONFIDENTIAL BACKGROUND VERIFICATION REPORT</Text>

        {/* Candidate Details Table */}
        <Text style={styles.title}>Candidate Details</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cell, styles.header]}>Name of the Candidate</Text>
            <Text style={[styles.cell, styles.header]}>Application ID</Text>
            <Text style={[styles.cell, styles.header]}>Client Name</Text>
            <Text style={[styles.cell, styles.header]}>Report Status</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>{pdfData.name || 'N/A'}</Text>
            <Text style={styles.cell}>{pdfData.application_id || 'N/A'}</Text>
            <Text style={styles.cell}>{parentCustomer[0]?.name || 'N/A'}</Text>
            <Text style={styles.cell}>{cmtAllData.report_status || 'N/A'}</Text>
          </View>
        </View>

        {/* Report Details Table */}
        <Text style={styles.title}>Report Details</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cell, styles.header]}>Date of Birth</Text>
            <Text style={[styles.cell, styles.header]}>Application Received</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>{cmtAllData.dob || 'N/A'}</Text>
            <Text style={styles.cell}>{pdfData.updated_at ? new Date(pdfData.updated_at).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>

        {/* Service Title Table */}
        <Text style={styles.title}>Report Components</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cell, styles.header]}>Title</Text>
            <Text style={[styles.cell, styles.header]}>Info Source</Text>
            <Text style={[styles.cell, styles.header]}>Verified At</Text>
            <Text style={[styles.cell, styles.header]}>Status</Text>
          </View>
          {serviceTitleValue.map((item, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.cell}>{item.title}</Text>
              <Text style={styles.cell}>{item.info_source}</Text>
              <Text style={styles.cell}>{item.verified_at ? new Date(item.verified_at).toLocaleDateString() : 'N/A'}</Text>
              <Text style={styles.cell}>{item.status}</Text>
            </View>
          ))}
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
