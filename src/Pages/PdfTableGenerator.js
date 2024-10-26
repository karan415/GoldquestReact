import React from 'react';
import { jsPDF } from 'jspdf';

const PdfTableGenerator = () => {
    // Utility function to capitalize the first letter of each word
    const capitalizeFirstLetter = (text) => {
        return text
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Add the logo
        doc.addImage("https://i0.wp.com/goldquestglobal.in/wp-content/uploads/2024/03/goldquestglobal.png?w=771&ssl=1", 'PNG', 10, 10, 50, 20);

        // Title for the report
        doc.setFontSize(20);
        doc.text("CONFIDENTIAL BACKGROUND VERIFICATION REPORT", pageWidth / 2, 40, { align: 'center' });

        // Define data row (you can add more rows as needed)
        const dataRow = [
            { title: 'completed', color: null },
            { title: 'component a', color: 'lightgreen' },
            { title: 'source 1', color: 'lightcoral' },
            { title: 'pending', color: 'orange' },
            { title: 'check again', color: 'pink' },
            { title: 'reviewed', color: 'yellow' },
        ];

        // Calculate column width and starting position
        const colWidth = (pageWidth - 40) / dataRow.length; // Adjust for margins
        const startingY = 70; // Starting Y position for data row
        const height = 10; // Row height

        // Draw data row
        dataRow.forEach((item, index) => {
            const x = 20 + index * colWidth; // Calculate X position for each data cell

            // Draw data cell border
            doc.setDrawColor(0); // Set border color to black
            doc.rect(x, startingY, colWidth, height); // Draw border around the data box
            
            // Draw small colored box if color is specified
            if (item.color) {
                doc.setFillColor(item.color);
                doc.rect(x + colWidth / 2 - 1.5, startingY + 2, 3, 3, 'F'); // Fill a small colored box (width: 3, height: 3)
            }

            doc.setTextColor(0, 0, 0); // Set text color to black
            doc.setFontSize(8); // Set font size for data (smaller font size)

            // Center the text horizontally, converting to capitalized first letter
            const textWithCapital = capitalizeFirstLetter(item.title);
            const textWidth = doc.getTextWidth(textWithCapital);
            const textX = x + (colWidth - textWidth) / 2; // Center the text in the cell
            const textY = startingY + (height / 2) + 3; // Slightly offset for vertical centering
            doc.text(textWithCapital, textX, textY); // Add centered text
        });

        // Save the PDF
        doc.save("ComponentStatusReport.pdf");
    };

    return (
        <div>
            <button onClick={generatePDF}>Generate PDF</button>
        </div>
    );
};

export default PdfTableGenerator;
