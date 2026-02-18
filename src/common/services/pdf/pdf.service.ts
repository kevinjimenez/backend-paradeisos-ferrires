import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as ejs from 'ejs';
import { Browser, chromium } from 'playwright';
import {
  CHROMIUM_LAUNCH_ARGS,
  DEFAULT_PAGE_LOAD_OPTIONS,
  DEFAULT_PDF_OPTIONS,
  DEFAULT_VIEWPORT_SIZE,
} from './constants/pdf-defaults';
import {
  PdfGenerator,
  PdfGeneratorOptions,
} from './interfaces/pdf-generator.interface';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browser: Browser;

  async onModuleInit(): Promise<void> {
    this.logger.debug('Initializing PDF service...');

    try {
      this.browser = await chromium.launch({
        headless: true,
        args: CHROMIUM_LAUNCH_ARGS,
      });

      this.logger.debug('PDF service initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing PDF service:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.logger.debug('Playwright browser closed');
    }
  }

  async generate<T>(generator: PdfGenerator<T>, data: T): Promise<Buffer> {
    this.logger.debug('Generating PDF...');

    try {
      const templateData = generator.prepareData(data);
      const html = await ejs.renderFile(
        generator.getTemplatePath(),
        templateData,
      );
      const pdfBuffer = await this.htmlToPdf(html, generator.getPdfOptions());

      this.logger.debug('PDF generated successfully');
      return pdfBuffer;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating PDF: ${errorMessage}`);
      throw error;
    }
  }

  private async htmlToPdf(
    html: string,
    options: PdfGeneratorOptions,
  ): Promise<Buffer> {
    const context = await this.browser.newContext();
    const page = await context.newPage();

    try {
      await page.setViewportSize(DEFAULT_VIEWPORT_SIZE);

      await page.setContent(html, DEFAULT_PAGE_LOAD_OPTIONS);

      await page.evaluate(() => document.fonts.ready);

      const pdfBuffer = await page.pdf({
        ...DEFAULT_PDF_OPTIONS,
        ...options,
        margin: options.margin || DEFAULT_PDF_OPTIONS.margin,
      });

      return pdfBuffer;
    } finally {
      await context.close();
    }
  }
}
