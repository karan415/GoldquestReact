import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PdfTableGenerator = () => {
  const generatePDF = () => {
    const input = document.getElementById('table-to-pdf');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('table.pdf');
    });
  
  
  };

  return (
    <div>
      <div id="table-to-pdf" style={{ margin: '20px' }}>
        <h2>Sample Table</h2>
        <table style={{ border: '1px solid black', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '8px' }}>Header 1</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>Header 2</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>Header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid black', padding: '8px' }}>Data 1</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>Data 2</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>Data 3</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid black', padding: '8px' }}>Data 4</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>Data 5</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>Data 6</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button onClick={generatePDF} style={{ marginTop: '20px' }}>
        Generate PDF
      </button>
    </div>
  );
};

export default PdfTableGenerator;
