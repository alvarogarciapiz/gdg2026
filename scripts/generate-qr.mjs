import QRCode from 'qrcode';
import { writeFile } from 'node:fs/promises';

const svg = await QRCode.toString('https://gdg.lvrpiz.com', {
  type: 'svg',
  errorCorrectionLevel: 'H',
  margin: 4,
  color: { dark: '#1b2224', light: '#ffffff' },
});
await writeFile('public/qr-gdg-lvrpiz.svg', `${svg.slice(svg.indexOf('<svg')).trimEnd()}\n`);
