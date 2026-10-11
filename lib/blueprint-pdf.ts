import { jsPDF } from "jspdf";
import { diagramGeometry } from "./blueprint-diagram.ts";
import { measurementText } from "./blueprint.ts";
import type { BlueprintDocument, BlueprintItem } from "../types/blueprint.ts";

const pdfText = (value: string) =>
  value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "");
function heading(doc: jsPDF, title: string, blueprint: BlueprintDocument) {
  doc.setTextColor(42, 61, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(title, 16, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `monis.rent | Room ${blueprint.room.width} x ${blueprint.room.depth} x ${blueprint.room.height} cm`,
    16,
    31,
  );
}
export function itemDistances(item: BlueprintItem) {
  if (item.view === "desk")
    return [
      `Left desk edge: ${measurementText(item.left)}`,
      `Back desk edge: ${measurementText(item.offset)}`,
      `Surface height: ${measurementText(item.surfaceHeight)}`,
    ];
  if (item.view === "wall")
    return [
      `Left wall edge: ${measurementText(item.left)}`,
      `Bottom from floor: ${measurementText(item.offset)}`,
    ];
  return [
    `Left wall: ${measurementText(item.left)}`,
    `Back wall: ${measurementText(item.offset)}`,
  ];
}
export function buildBlueprintPdf(blueprint: BlueprintDocument) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  for (const [index, view] of blueprint.views.entries()) {
    if (index) doc.addPage("a4", "landscape");
    heading(doc, view.title, blueprint);
    // Use the same fitted drawing geometry as the on-screen SVG.
    const geometry = diagramGeometry(view);
    const factor = 0.245;
    const px = (value: number) => 31 + value * factor;
    const py = (value: number) => 39 + value * factor;
    const x = px(geometry.x),
      y = py(geometry.y);
    const width = geometry.width * factor,
      height = geometry.height * factor;
    const scale = geometry.scale * factor;
    doc.setDrawColor(112, 133, 104);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height);
    doc.line(x, y - 4, x, y - 10);
    doc.line(x, y - 10, x + width, y - 10);
    doc.line(x + width, y - 10, x + width, y - 4);
    doc.text(measurementText(view.width), x + width / 2, y - 13, {
      align: "center",
    });
    doc.line(x - 4, y, x - 10, y);
    doc.line(x - 10, y, x - 10, y + height);
    doc.line(x - 10, y + height, x - 4, y + height);
    doc.text(measurementText(view.height), x - 13, y + height / 2, {
      angle: 90,
      align: "center",
    });
    doc.text(
      view.id === "wall" ? "Floor" : "Front",
      x + width / 2,
      y + height + 10,
      { align: "center" },
    );
    for (const footprint of view.footprints) {
      const fx = x + footprint.x * scale,
        fy = y + footprint.y * scale;
      const fw = footprint.width * scale,
        fh = footprint.height * scale;
      doc.setFillColor(238, 242, 232);
      doc.rect(fx, fy, fw, fh, "FD");
      if (footprint.facing) {
        const middle = fx + fw / 2;
        const arrowY = footprint.facing === "up" ? fy + 4 : fy + fh - 4;
        const tip = footprint.facing === "up" ? arrowY - 2 : arrowY + 2;
        doc.line(middle - 2, arrowY, middle, tip);
        doc.line(middle, tip, middle + 2, arrowY);
      }
      doc.setFillColor(255, 255, 255);
      doc.circle(fx + fw / 2, fy + fh / 2, 4.8, "FD");
      doc.text(String(footprint.item.number), fx + fw / 2, fy + fh / 2 + 1.4, {
        align: "center",
      });
    }
    const barCm = view.id === "desk" ? 20 : 50;
    doc.line(16, 184, 16 + barCm * scale, 184);
    doc.line(16, 182, 16, 186);
    doc.line(16 + barCm * scale, 182, 16 + barCm * scale, 186);
    doc.text(measurementText(barCm), 16 + barCm * scale + 4, 185);
    doc.text(
      "Match item numbers to the placement list. Follow the cm measurements.",
      16,
      196,
    );
  }
  const rowsPerPage = 5;
  for (let start = 0; start < blueprint.items.length; start += rowsPerPage) {
    doc.addPage("a4", "landscape");
    heading(doc, "Placement list", blueprint);
    doc.setFont("helvetica", "bold");
    doc.text("Item", 16, 44);
    doc.text("Product", 34, 44);
    doc.text("W x D x H (cm)", 120, 44);
    doc.text("Measure to product edge", 195, 44);
    doc.setFont("helvetica", "normal");
    for (const [index, item] of blueprint.items
      .slice(start, start + rowsPerPage)
      .entries()) {
      const y = 55 + index * 26;
      doc.text(String(item.number), 16, y);
      doc.text(doc.splitTextToSize(pdfText(item.name), 80), 34, y);
      doc.text(
        doc.splitTextToSize(
          `${item.width} x ${item.depth} x ${item.height}`,
          44,
        ),
        120,
        y,
      );
      doc.text(itemDistances(item), 195, y);
      if (item.estimated) doc.text("Estimated footprint", 120, y + 12);
      doc.setDrawColor(222, 229, 216);
      doc.line(16, y + 19, 281, y + 19);
    }
    doc.text(
      "Check your room measurements and the manufacturer's assembly instructions.",
      16,
      196,
    );
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFontSize(12);
    doc.text(`${page} / ${pages}`, 281, 204, { align: "right" });
  }
  return doc;
}

export async function downloadBlueprint(blueprint: BlueprintDocument) {
  const doc = buildBlueprintPdf(blueprint);
  await doc.save("monis-setup-blueprint.pdf", { returnPromise: true });
}
