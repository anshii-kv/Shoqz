const PDFDocument = require("pdfkit");

const generatePDF = (req, res) => {
  const salesData = req.body; 
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=sales-report.pdf");
  doc.pipe(res);

  doc.fontSize(18).text("Sales Report", { align: "center" });
  doc.moveDown();


  salesData.forEach((sale, i) => {
    doc.fontSize(12).text(`${i + 1}. ${sale.orderId} - ₹${sale.amount} (${sale.status})`);
    doc.moveDown(0.5);
  });

  doc.end();
};
const ExcelJS = require("exceljs");

const generateExcel = async (res, salesData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Report");

  const today = new Date();
  const todayFormatted = today.toLocaleDateString();
  let reportTypeHeading = "";
  let subheading = "";

  if (salesData.reportType === "custom" && salesData.startDate && salesData.endDate) {
    const start = new Date(salesData.startDate).toLocaleDateString();
    const end = new Date(salesData.endDate).toLocaleDateString();
    reportTypeHeading = "Custom Sales Report";
    subheading = `From ${start} to ${end}`;
  } else if (salesData.reportType === "daily") {
    reportTypeHeading = `Daily Sales Report - ${todayFormatted}`;
  } else if (salesData.reportType === "weekly") {
    reportTypeHeading = `Weekly Sales Report - ${todayFormatted}`;
  } else if (salesData.reportType === "monthly") {
    const monthYear = new Date(
      salesData.sales[0]?.date || Date.now()
    ).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    reportTypeHeading = "Monthly Sales Report";
    subheading = monthYear;
  } else {
    reportTypeHeading = "Sales Report";
  }

  worksheet.addRow([`${salesData.shopName || "Sales Report"} - ${reportTypeHeading}`]);
  if (subheading) worksheet.addRow([subheading]);
  worksheet.addRow([`Generated on: ${todayFormatted}`]);
  worksheet.addRow([]);


  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Order ID", key: "orderId", width: 30 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Discounts", key: "discount", width: 15 },
    { header: "Coupons", key: "coupon", width: 15 },
    { header: "Delivery Charge", key: "deliveryCharge", width: 20 },
  ];

  salesData.sales.forEach((sale) => {
    worksheet.addRow({
      date: new Date(sale.date).toLocaleDateString(),
      orderId: sale.orderId.toString(),
      amount: `Rs. ${sale.amount.toLocaleString()}`,
      discount: `Rs. ${sale.discount.toLocaleString()}`,
      coupon: `Rs. ${sale.coupon.toLocaleString()}`,
      deliveryCharge: `Rs. ${sale.deliveryCharge.toLocaleString()}`,
    });
  });

  worksheet.addRow([]);
  worksheet.addRow(["Summary"]);
  worksheet.addRow(["Total Sales", "", `Rs. ${salesData.totalSales.toLocaleString()}`]);
  worksheet.addRow(["Total Orders", "", salesData.orderCount]);
  worksheet.addRow(["Total Coupons", "", `Rs. ${salesData.coupons.toLocaleString()}`]);
  worksheet.addRow(["Total Discounts", "", `Rs. ${salesData.discounts.toLocaleString()}`]);
  worksheet.addRow(["Total Delivery Charge", "", `Rs. ${salesData.lessPrices.toLocaleString()}`]);


  worksheet.getRow(1).font = { bold: true, size: 14 };
  if (subheading) {
    worksheet.getRow(2).font = { italic: true, size: 12 };
    worksheet.getRow(3).font = { size: 10 };
    worksheet.getRow(5).font = { bold: true };
  } else {
    worksheet.getRow(2).font = { size: 10 };
    worksheet.getRow(4).font = { bold: true };
  }

  
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=sales-report.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { generatePDF,generateExcel };
