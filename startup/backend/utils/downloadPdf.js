import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const downloadPDF = async () => {
  const element = document.getElementById("feasibility-report");

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#020617",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("Startup_Feasibility_Report.pdf");
};
