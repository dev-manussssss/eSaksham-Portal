import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const textContent = `
MPLADS RUNNING ACCOUNT BILL (RA BILL-02)
Project: RCC Bridge Approach and Protection Works
Project ID: PRJ-004
Tender ID: TND-004 (SYNTHETIC)
Contractor: Eastern Structural & Eng (VND-007)

Item 1.1 Earthwork in filling 5000 cum @ 200 = 1000000
Item 1.2 RCC M25 Concrete 880 cum @ 6000 = 5280000
Item 1.3 TMT Steel Reinforcement 25000 kg @ 80 = 2000000

MB Record Reference: MB-P14
Total Claimed: Rs 8280000
`;

function createSimplePdf(text) {
  const lines = text.trim().split('\n');
  let streamContent = 'BT /F1 12 Tf 50 720 Td 16 TL ';
  for (const line of lines) {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    streamContent += `(${escaped}) ' `;
  }
  streamContent += 'ET';

  const streamLength = streamContent.length;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000305 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return Buffer.from(pdf);
}

const pdfBuffer = createSimplePdf(textContent);
const targetPath = path.join(__dirname, 'sample_bill_quantity_mismatch.pdf');
fs.writeFileSync(targetPath, pdfBuffer);
console.log('Sample PDF created at:', targetPath);
