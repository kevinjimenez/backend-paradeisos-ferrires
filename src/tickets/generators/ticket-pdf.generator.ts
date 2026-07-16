import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import {
  TICKET_LOGO_PATH,
  TICKET_TEMPLATE_PATH,
} from '../constants/template-paths';
import { DEFAULT_PDF_OPTIONS } from './../../common/services/pdf/constants/pdf-defaults';
import {
  PdfGenerator,
  PdfGeneratorOptions,
} from './../../common/services/pdf/interfaces/pdf-generator.interface';
import { TicketPdf } from '../interfaces/ticket-pdf.interface';

@Injectable()
export class TicketPdfGenerator implements PdfGenerator<TicketPdf> {
  private readonly logger = new Logger(TicketPdfGenerator.name);
  private logoSvg: string | null = null;

  getTemplatePath(): string {
    return path.resolve(__dirname, TICKET_TEMPLATE_PATH);
  }

  async prepareData(data: TicketPdf) {
    const [qrImage, returnTripQrImage] = await Promise.all([
      this.generateQrImage(data.qrCode),
      data.returnTrip
        ? this.generateQrImage(data.returnTrip.qrCode)
        : Promise.resolve(undefined),
    ]);

    return {
      ...data,
      logoSvg: this.getLogoSvg(),
      qrImage,
      returnTrip: data.returnTrip
        ? { ...data.returnTrip, qrImage: returnTripQrImage }
        : undefined,
    };
  }

  getPdfOptions(): PdfGeneratorOptions {
    return DEFAULT_PDF_OPTIONS;
  }

  private async generateQrImage(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, { margin: 1, width: 200 });
    } catch (error) {
      this.logger.error('Error generating QR code:', error);
      return '';
    }
  }

  private getLogoSvg(): string {
    if (this.logoSvg === null) {
      try {
        this.logoSvg = fs.readFileSync(TICKET_LOGO_PATH, 'utf-8');
      } catch (error) {
        this.logger.error('Error reading ticket logo:', error);
        this.logoSvg = '';
      }
    }
    return this.logoSvg;
  }
}
