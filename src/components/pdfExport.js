const loadImage = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

const formatDate = (value) => new Date(value).toLocaleString("es-ES");

export const exportToolsPdf = async ({ tools, user, title }) => {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("No se encontró la librería jsPDF. Verifica la conexión.");
    return;
  }

  const doc = new jsPDF({
    orientation: tools.length > 4 ? "landscape" : "portrait",
    unit: "pt",
    format: "a4"
  });

  doc.setFontSize(18);
  doc.text(title, 40, 40);
  doc.setFontSize(11);
  doc.text(`Exportado por: ${user?.name || "Usuario"}`, 40, 60);
  doc.text(`Fecha: ${formatDate(new Date())}`, 40, 76);

  const rows = [];
  for (const tool of tools) {
    const imgUrl = tool.photos?.[0] || "";
    const image = imgUrl ? await loadImage(imgUrl) : null;
    rows.push({
      image,
      name: tool.name,
      category: tool.category,
      location: tool.location_name_cache,
      qty: tool.qty_available,
      status: tool.status,
      code: tool.code || "-"
    });
  }

  const startY = 100;
  const rowHeight = 70;
  const colWidths = [80, 140, 100, 120, 80, 90, 110];
  const headers = [
    "Foto",
    "Herramienta",
    "Categoría",
    "Ubicación",
    "Cantidad",
    "Estado",
    "Código"
  ];

  let y = startY;
  doc.setFontSize(10);
  doc.setFillColor(230, 237, 245);
  doc.rect(40, y, colWidths.reduce((a, b) => a + b, 0), 24, "F");
  let x = 40;
  headers.forEach((header, index) => {
    doc.text(header, x + 4, y + 16);
    x += colWidths[index];
  });
  y += 30;

  for (const row of rows) {
    x = 40;
    const imgBox = { x: x + 4, y: y + 4, w: 60, h: 60 };
    doc.rect(x, y, colWidths[0], rowHeight);
    if (row.image) {
      doc.addImage(row.image, "JPEG", imgBox.x, imgBox.y, imgBox.w, imgBox.h);
    } else {
      doc.text("Sin foto", x + 10, y + 36);
    }
    x += colWidths[0];
    const cells = [row.name, row.category, row.location, String(row.qty), row.status, row.code];
    cells.forEach((cell, idx) => {
      doc.rect(x, y, colWidths[idx + 1], rowHeight);
      doc.text(String(cell), x + 6, y + 24, { maxWidth: colWidths[idx + 1] - 12 });
      x += colWidths[idx + 1];
    });
    y += rowHeight;
    if (y + rowHeight > doc.internal.pageSize.height - 60) {
      doc.addPage();
      y = 40;
    }
  }

  const footerText = `Inventario de Herramientas IT · ${formatDate(new Date())}`;
  doc.setFontSize(9);
  doc.text(footerText, 40, doc.internal.pageSize.height - 30);

  doc.save("inventario-herramientas.pdf");
};
