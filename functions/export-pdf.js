const PDFDocument = require('pdfkit');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { markdown, filename } = JSON.parse(event.body);
    if (!markdown) return { statusCode: 400, body: JSON.stringify({ error: 'No markdown provided' }) };

    const buffer = await buildPDF(markdown);
    const base64 = buffer.toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: base64, filename: filename || 'Arcspect-Export.pdf' })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

const C = {
  green: '#4A7C59',
  greenLight: '#6BAF80',
  text: '#1A1A1A',
  text2: '#444444',
  muted: '#888888',
  border: '#DDDDDD',
  headerBg: '#F0F7F2',
  rowAlt: '#F9FCF9',
  white: '#FFFFFF'
};

const F = { normal: 'Helvetica', bold: 'Helvetica-Bold' };

function buildPDF(markdown) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'A4', bufferPages: true });
    const buffers = [];
    doc.on('data', d => buffers.push(d));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageW = doc.page.width - 120;

    // Header bar
    doc.rect(0, 0, doc.page.width, 44).fill(C.green);
    doc.font(F.bold).fontSize(13).fillColor(C.white).text('ARCSPECT', 60, 14);
    doc.font(F.normal).fontSize(9).fillColor('rgba(255,255,255,0.75)').text('AI Product Documentation', 133, 17);

    doc.y = 68;

    const lines = markdown.split('\n');
    let i = 0;

    function ensureSpace(needed) {
      if (doc.y + needed > doc.page.height - 60) {
        doc.addPage();
        doc.y = 60;
      }
    }

    function drawHRule(color, weight) {
      doc.moveTo(60, doc.y).lineTo(60 + pageW, doc.y)
         .strokeColor(color || C.border).lineWidth(weight || 0.5).stroke();
      doc.y += 6;
    }

    function cleanInline(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    }

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        ensureSpace(60);
        doc.moveDown(0.6);
        doc.font(F.bold).fontSize(20).fillColor(C.text)
           .text(line.slice(2), 60, doc.y, { width: pageW });
        doc.y += 4;
        drawHRule(C.green, 1.5);
        doc.font(F.normal).fontSize(11);
        i++; continue;
      }

      if (line.startsWith('## ')) {
        ensureSpace(40);
        doc.y += 12;
        doc.font(F.bold).fontSize(8).fillColor(C.green)
           .text(line.slice(3).toUpperCase(), 60, doc.y, { width: pageW, characterSpacing: 1.8 });
        doc.y += 4;
        drawHRule(C.green, 0.75);
        doc.font(F.normal).fontSize(11);
        i++; continue;
      }

      if (line.startsWith('### ')) {
        ensureSpace(30);
        doc.y += 6;
        doc.font(F.bold).fontSize(12).fillColor(C.text)
           .text(line.slice(4), 60, doc.y, { width: pageW });
        doc.y += 4;
        doc.font(F.normal).fontSize(11);
        i++; continue;
      }

      if (/^---+$/.test(line)) {
        doc.y += 8; drawHRule(C.border, 0.5); doc.y += 8;
        i++; continue;
      }

      if (line.startsWith('|')) {
        const tableLines = [];
        while (i < lines.length && lines[i].startsWith('|')) {
          if (!/^[\|\s\-:]+$/.test(lines[i])) tableLines.push(lines[i]);
          i++;
        }
        if (!tableLines.length) continue;

        const parseRow = r => r.split('|').map(c => c.trim()).filter(Boolean);
        const headers = parseRow(tableLines[0]);
        const colW = Math.floor(pageW / headers.length);
        const rowH = 20;

        ensureSpace(rowH * (tableLines.length + 1) + 8);
        doc.y += 6;
        const startY = doc.y;

        headers.forEach((h, ci) => {
          const x = 60 + ci * colW;
          doc.rect(x, startY, colW, rowH).fill(C.headerBg);
          doc.rect(x, startY, colW, rowH).strokeColor(C.border).lineWidth(0.5).stroke();
          doc.font(F.bold).fontSize(8).fillColor(C.green)
             .text(h.toUpperCase(), x + 6, startY + 6, { width: colW - 12, ellipsis: true });
        });
        doc.y = startY + rowH;

        for (let r = 1; r < tableLines.length; r++) {
          const cells = parseRow(tableLines[r]);
          const rowY = doc.y;
          headers.forEach((_, ci) => {
            const x = 60 + ci * colW;
            doc.rect(x, rowY, colW, rowH).fill(r % 2 === 0 ? C.rowAlt : C.white);
            doc.rect(x, rowY, colW, rowH).strokeColor(C.border).lineWidth(0.5).stroke();
            doc.font(F.normal).fontSize(9).fillColor(C.text2)
               .text(cleanInline(cells[ci] || ''), x + 6, rowY + 6, { width: colW - 12, ellipsis: true });
          });
          doc.y = rowY + rowH;
        }
        doc.y += 12;
        continue;
      }

      if (line.startsWith('- [ ] ')) {
        ensureSpace(18);
        doc.font(F.normal).fontSize(11).fillColor(C.muted).text('☐  ', 60, doc.y, { continued: true, width: 20 });
        doc.fillColor(C.text2).text(cleanInline(line.slice(6)), { width: pageW - 20 });
        i++; continue;
      }

      if (/^- /.test(line)) {
        ensureSpace(18);
        doc.font(F.bold).fontSize(11).fillColor(C.green).text('• ', 60, doc.y, { continued: true, width: 16 });
        doc.font(F.normal).fillColor(C.text2).text(cleanInline(line.slice(2)), { width: pageW - 16 });
        i++; continue;
      }

      if (/^\d+\. /.test(line)) {
        ensureSpace(18);
        const num = line.match(/^(\d+)\./)[1];
        doc.font(F.bold).fontSize(11).fillColor(C.green).text(num + '.  ', 60, doc.y, { continued: true, width: 24 });
        doc.font(F.normal).fillColor(C.text2).text(cleanInline(line.replace(/^\d+\. /, '')), { width: pageW - 24 });
        i++; continue;
      }

      if (!line.trim()) { doc.y += 6; i++; continue; }

      ensureSpace(18);
      doc.font(F.normal).fontSize(11).fillColor(C.text2)
         .text(cleanInline(line), 60, doc.y, { width: pageW });
      i++;
    }

    // Footer on all pages
    const range = doc.bufferedPageRange();
    for (let p = 0; p < range.count; p++) {
      doc.switchToPage(range.start + p);
      const footerY = doc.page.height - 32;
      doc.rect(0, footerY, doc.page.width, 32).fill(C.headerBg);
      doc.moveTo(0, footerY).lineTo(doc.page.width, footerY)
         .strokeColor(C.border).lineWidth(0.5).stroke();
      doc.font(F.normal).fontSize(8).fillColor(C.muted)
         .text('Generated by Arcspect · arcspect.netlify.app', 60, footerY + 10, { continued: true, width: pageW - 60 })
         .text(`Page ${p + 1} of ${range.count}`, { align: 'right' });
    }

    doc.end();
  });
}