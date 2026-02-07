import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { TICKET_TEMPLATE_PATH } from '../constants/template-paths';
import { DEFAULT_PDF_OPTIONS } from './../../common/services/pdf/constants/pdf-defaults';
import {
  PdfGenerator,
  PdfGeneratorOptions,
} from './../../common/services/pdf/interfaces/pdf-generator.interface';
import { TicketPdf } from '../interfaces/ticket-pdf.interface';

@Injectable()
export class TicketPdfGenerator implements PdfGenerator<TicketPdf> {
  getTemplatePath(): string {
    return path.resolve(__dirname, TICKET_TEMPLATE_PATH);
  }

  prepareData(data: TicketPdf) {
    return data;
  }

  getPdfOptions(): PdfGeneratorOptions {
    return DEFAULT_PDF_OPTIONS;
  }
}
