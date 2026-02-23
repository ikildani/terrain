import { Text, Section, Link } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';
import { EmailCTAButton } from './components/Button';

interface PaymentFailedEmailProps {
  userName: string;
  invoiceAmount: string;
  billingPortalUrl: string;
}

export function PaymentFailedEmail({
  userName,
  invoiceAmount,
  billingPortalUrl,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout preview="Action required: your Terrain payment could not be processed">
      <Text style={headingStyle}>
        Action required: payment failed.
      </Text>
      <Text style={bodyTextStyle}>
        {userName ? `Hi ${userName}, ` : ''}We were unable to process your
        payment{invoiceAmount ? ` of ${invoiceAmount}` : ''} for your Terrain
        subscription. Please update your payment method to maintain access.
      </Text>

      <Section style={alertBoxStyle}>
        <Text style={alertTextStyle}>
          If your payment is not resolved within 7 days, your account will be
          downgraded to the Free plan and you will lose access to Pro features
          including partner discovery, regulatory intelligence, and PDF exports.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailCTAButton href={billingPortalUrl}>
          Update payment method
        </EmailCTAButton>
      </Section>

      <Text style={mutedTextStyle}>
        If you believe this is an error, please contact us at{' '}
        <Link href="mailto:team@ambrosiaventures.co" style={linkStyle}>
          team@ambrosiaventures.co
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: '"DM Serif Display", Georgia, serif',
  fontSize: '22px',
  color: '#F0F4F8',
  margin: '0 0 16px',
  fontWeight: 400,
};

const bodyTextStyle: React.CSSProperties = {
  color: '#CBD5E1',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
};

const alertBoxStyle: React.CSSProperties = {
  backgroundColor: 'rgba(251, 191, 36, 0.05)',
  border: '1px solid rgba(251, 191, 36, 0.2)',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '24px 0',
};

const alertTextStyle: React.CSSProperties = {
  color: '#CBD5E1',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const mutedTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '24px 0 0',
};

const linkStyle: React.CSSProperties = {
  color: '#00C9A7',
  textDecoration: 'none',
};

export default PaymentFailedEmail;
