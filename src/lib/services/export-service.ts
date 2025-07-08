import { Activity } from "../types/activity";
import { Action } from "../types/action";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const exportToExcel = async (data: Activity[] | Action[], type: "activities" | "actions") => {
  // Convert data to worksheet format
  const worksheet = XLSX.utils.json_to_sheet(data.map(item => {
    if (type === "activities") {
      const activity = item as Activity;
      return {
        Date: new Date(activity.date).toLocaleDateString(),
        Time: new Date(activity.date).toLocaleTimeString(),
        Project: activity.projectName || "",
        Type: activity.type,
        Shift: activity.shift,
        Crew: activity.crew,
        Remarks: activity.remarks || "",
      };
    } else {
      const action = item as Action;
      return {
        Issue: action.issue,
        Status: action.status,
        Priority: action.priority,
        "Due Date": new Date(action.dueDate).toLocaleDateString(),
        "Responsible Person": action.responsiblePerson,
        "Created At": new Date(action.createdAt).toLocaleDateString(),
      };
    }
  }));

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1));

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Create blob and download
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}_export_${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (data: Activity[] | Action[], type: "activities" | "actions") => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text(
    type.charAt(0).toUpperCase() + type.slice(1) + " Report",
    20,
    20
  );

  // Add date
  doc.setFontSize(12);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    20,
    30
  );

  // Prepare table data
  const tableData = data.map(item => {
    if (type === "activities") {
      const activity = item as Activity;
      return [
        new Date(activity.date).toLocaleDateString(),
        new Date(activity.date).toLocaleTimeString(),
        activity.projectName || "",
        activity.type,
        activity.shift,
        activity.crew,
        activity.remarks || "",
      ];
    } else {
      const action = item as Action;
      return [
        action.issue,
        action.status,
        action.priority,
        new Date(action.dueDate).toLocaleDateString(),
        action.responsiblePerson,
        new Date(action.createdAt).toLocaleDateString(),
      ];
    }
  });

  // Define columns
  const columns = type === "activities" 
    ? ["Date", "Time", "Project", "Type", "Shift", "Crew", "Remarks"]
    : ["Issue", "Status", "Priority", "Due Date", "Responsible", "Created At"];

  // Add table
  (doc as any).autoTable({
    head: [columns],
    body: tableData,
    startY: 40,
    margin: { top: 40 },
    styles: { overflow: "linebreak" },
    columnStyles: {
      // Adjust column widths as needed
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
    },
  });

  // Save PDF
  doc.save(`${type}_export_${new Date().toISOString().split("T")[0]}.pdf`);
}; 