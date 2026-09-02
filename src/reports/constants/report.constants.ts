import * as path from 'path';

export const REPORT_PDF_FILENAME = 'reporte-tickets.pdf';
export const REPORT_EXCEL_FILENAME = 'reporte-tickets.xlsx';

// Evita generar reportes sobre rangos de fechas excesivamente grandes.
export const MAX_REPORT_RANGE_DAYS = 90;

export const REPORT_TEMPLATE_PATH = path.resolve(
  __dirname,
  '../templates/report.ejs',
);
