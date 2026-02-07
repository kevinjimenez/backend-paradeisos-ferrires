import { Global, Module } from '@nestjs/common';
import { PdfService } from './services/pdf/pdf.service';
import { EmailService } from './services/email/email.service';
import { QrService } from './services/qr/qr.service';

@Global()
@Module({
  providers: [PdfService, EmailService, QrService],
  exports: [PdfService, EmailService, QrService],
})
export class CommonModule {}
