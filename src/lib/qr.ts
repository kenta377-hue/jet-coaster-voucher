import QRCode from 'qrcode';

export async function makeQR(text: string): Promise<string> {
  return await QRCode.toDataURL(text, { width: 256, margin: 1 });
}
