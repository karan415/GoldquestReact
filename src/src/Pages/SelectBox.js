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

  const getColumnWidth = (numColumns) => `${100 / numColumns}%`;

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
      borderWidth: 1,
      borderColor: '#000',
      borderCollapse: 'collapse',
    },
    header: {
      backgroundColor: '#f0f0f0',
      padding: 10,
      fontWeight: 'bold',
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    cell: {
      padding: 10,
      borderWidth: 1,
      borderColor: '#000',
      fontSize: 12,
      textAlign: 'left',
    },
    row: {
      flexDirection: 'row',
      width: '100%',
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
            {['Name of the Candidate','Client Name', 'Application ID',  'Report Status','Date of Birth',].map((header, index) => (
              <View key={index} style={[styles.cell, styles.header, { width: getColumnWidth(4) }]}>
                <Text>{header}</Text>
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <View style={[styles.cell, { width: getColumnWidth(4) }]}>
              <Text>{pdfData.name || 'N/A'}</Text>
            </View>
            <View style={[styles.cell, { width: getColumnWidth(4) }]}>
              <Text>{pdfData.application_id || 'N/A'}</Text>
            </View>
            <View style={[styles.cell, { width: getColumnWidth(4) }]}>
              <Text>{parentCustomer[0]?.name || 'N/A'}</Text>
            </View>
            <View style={[styles.cell, { width: getColumnWidth(4) }]}>
              <Text>{cmtAllData.report_status || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Report Details Table */}
        <Text style={styles.title}>Report Details</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            {['Date of Birth', 'Application Received'].map((header, index) => (
              <View key={index} style={[styles.cell, styles.header, { width: getColumnWidth(2) }]}>
                <Text>{header}</Text>
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <View style={[styles.cell, { width: getColumnWidth(2) }]}>
              <Text>{cmtAllData.dob || 'N/A'}</Text>
            </View>
            <View style={[styles.cell, { width: getColumnWidth(2) }]}>
              <Text>{pdfData.updated_at ? new Date(pdfData.updated_at).toLocaleDateString() : 'N/A'}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Report Components Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Report Components</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            {['Title', 'Info Source', 'Verified At', 'Status'].map((header, index) => (
              <View key={index} style={[styles.cell, styles.header, { width: getColumnWidth(4) }]}>
                <Text>{header}</Text>
              </View>
            ))}
          </View>
          {serviceTitleValue.map((item, index) => (
            <View style={styles.row} key={index}>
              <View style={[styles.cell, { width: getColumnWidth(4) }]}>
                <Text>{item.title}</Text>
              </View>
              <View style={[styles.cell, { width: getColumnWidth(4) }]}>
                <Text>{item.info_source}</Text>
              </View>
              <View style={[styles.cell, { width: getColumnWidth(4) }]}>
                <Text>{item.verified_at ? new Date(item.verified_at).toLocaleDateString() : 'N/A'}</Text>
              </View>
              <View style={[styles.cell, { width: getColumnWidth(4) }]}>
                <Text>{item.status}</Text>
              </View>
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
        {({ loading }) => (loading ? 'Loading document...' : '')}
      </PDFDownloadLink>
    </div>
  );
};

export default PdfGenerator;
