import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(configService: ConfigService<AppConfig>) {
    const mailConfig = configService.get('mail', { infer: true })!;
    this.from = mailConfig.from;
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.user
        ? { user: mailConfig.user, pass: mailConfig.pass }
        : undefined,
    });
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    ttlMinutes: number,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Mã OTP đặt lại mật khẩu TicketX',
      html: buildOtpEmailHtml(otp, ttlMinutes),
      text: `Ma OTP dat lai mat khau TicketX cua ban la: ${otp}\nMa co hieu luc trong ${ttlMinutes} phut. Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.`,
    });
    this.logger.log(`OTP email sent to ${to}`);
  }
}

const ACCENT = '#ca8a04';
const ACCENT_DARK = '#0f172a';

/**
 * Table-based layout with everything inlined — email clients (Outlook,
 * Gmail, Apple Mail...) strip <script> and largely ignore external/`<style>`
 * CSS, so a real "click to copy" button isn't possible here; the OTP is
 * shown as a large, letter-spaced block that's easy to double-click/select.
 */
function buildOtpEmailHtml(otp: string, ttlMinutes: number): string {
  const digits = otp.split('');

  return `
<div style="background-color: #f4f4f5; padding: 32px 16px; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7;">
    <tr>
      <td style="padding: 28px 32px 0; text-align: center;">
        <span style="font-size: 20px; font-weight: 800; color: ${ACCENT_DARK};">Ticket<span style="color: ${ACCENT};">X</span></span>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px 0;">
        <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: ${ACCENT_DARK}; text-align: center;">Đặt lại mật khẩu</h1>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
          Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản TicketX này. Nhập mã bên dưới để tiếp tục.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef9ec; border: 1px solid ${ACCENT}; border-radius: 12px;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: ${ACCENT_DARK};">${digits.join(' ')}</span>
            </td>
          </tr>
        </table>
        <p style="margin: 8px 0 0; font-size: 12px; color: #a1a1aa; text-align: center;">Bôi đen hoặc double-click vào mã để copy nhanh</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 32px 0; text-align: center;">
        <span style="display: inline-block; font-size: 12px; font-weight: 600; color: ${ACCENT_DARK}; background-color: #f4f4f5; border-radius: 999px; padding: 6px 14px;">
          ⏱ Hết hạn sau ${ttlMinutes} phút
        </span>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px 28px;">
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 0 0 16px;" />
        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #a1a1aa; text-align: center;">
          Không chia sẻ mã này với bất kỳ ai. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.
        </p>
      </td>
    </tr>
  </table>
  <p style="margin: 16px 0 0; font-size: 11px; color: #d4d4d8; text-align: center;">© TicketX</p>
</div>
`;
}
