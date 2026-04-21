import { Global, Module } from '@nestjs/common';
import { PdfService } from './services/pdf/pdf.service';
import { MailService } from './services/mail/mail.service';
import { QrService } from './services/qr/qr.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomHttpExceptionFilter } from './filters/custom-http-exception.filter';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';

@Global()
@Module({
  providers: [
    PdfService,
    MailService,
    QrService,
    { provide: APP_FILTER, useClass: CustomHttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
  exports: [PdfService, MailService, QrService],
})
export class CommonModule {}
