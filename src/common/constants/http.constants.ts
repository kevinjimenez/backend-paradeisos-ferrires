export const HTTP_CONTENT_TYPES = {
  PDF: 'application/pdf',
} as const;

export const HTTP_HEADERS = {
  contentDisposition: (filename: string) => `attachment; filename=${filename}`,
} as const;
