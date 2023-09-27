// exportUtils.js
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToExcel = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
};

export const exportToPDF = (columns, data, filename) => {
  const pdf = new jsPDF();
  pdf.text("Table Example", 10, 10);
  pdf.autoTable({
    head: [Object.keys(data[0])],
    body: data.map((item) => Object.values(item)),
  });
  pdf.save(filename);

  // Add content to the PDF

  // Use autoTable to generate a table
  // pdf.autoTable({
  //   head: [columns],
  //   body: data.map(item => Object.values(item)),
  //startY: 20, // Adjust the starting y-coordinate
  // });

  // Save the PDF
  // pdf.save('example.pdf');
};
