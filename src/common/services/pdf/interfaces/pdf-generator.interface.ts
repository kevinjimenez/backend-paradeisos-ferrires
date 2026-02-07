export interface PdfGenerator<T> {
  getTemplatePath(): string;
  prepareData(data: T): Record<string, any>;
  getPdfOptions(): PdfGeneratorOptions;
}

export interface PdfGeneratorOptions {
  format?: 'A4' | 'A5' | 'Letter';
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  scale?: number;
  width?: string;
  height?: string;
}
