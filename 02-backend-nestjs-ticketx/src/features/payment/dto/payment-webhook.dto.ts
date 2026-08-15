import { IsIn, IsString, IsUUID } from 'class-validator';

export class PaymentWebhookDto {
  @IsUUID('4')
  paymentId: string;

  @IsIn(['success', 'failed'])
  resultCode: 'success' | 'failed';

  @IsString()
  signature: string;
}
