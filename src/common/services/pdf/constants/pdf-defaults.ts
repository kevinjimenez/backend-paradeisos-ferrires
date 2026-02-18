import { PdfGeneratorOptions } from '../interfaces/pdf-generator.interface';

export const DEFAULT_PDF_OPTIONS: PdfGeneratorOptions = {
  format: 'A5',
  printBackground: true,
  preferCSSPageSize: true,
  margin: {
    top: '10mm',
    bottom: '10mm',
    left: '10mm',
    right: '10mm',
  },
};

export const DEFAULT_VIEWPORT_SIZE = {
  width: 450,
  height: 800,
};

export const DEFAULT_PAGE_LOAD_OPTIONS = {
  waitUntil: 'networkidle' as const,
  timeout: 30000,
};

export const CHROMIUM_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
];
