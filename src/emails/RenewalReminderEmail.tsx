import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';
import { EmailCTAButton } from './components/Button';

interface RenewalReminderEmailProps {
  userName: string;
  planName: string;
  renewalDate: string;
  amount: string;
}

export function RenewalReminderEmail({
  userName,
  planName,
  renewalDate,
  amount,
}: RenewalReminderEmailProps) {
  return (
    <EmailLayout preview={`Your ${planName} plan renews on ${renewalDate}`}>
      <Text style={headingStyle}>
        Your {planName} plan renews soon.
      </Text>

      <Text style={bodyTextStyle}>
        {userName ? `Hi ${userName}, your` : 'Your'} Terrain {planName} subscription
        will automatically renew on <strong style={{ color: '#F0F4F8' }}>{renewalDate}</strong>.
      </Text>

      <Section style={detailsCardStyle}>
        <Text style={detailLabelStyle}>Plan</Text>
        <Text style={detailValueStyle}>{planName}</Text>
        <Text style={detailLabelStyle}>Renewal date</Text>
        <Text style={detailValueStyle}>{renewalDate}</Text>
        <Text style={detailLabelStyle}>Amount</Text>
        <Text style={detailValueStyle}>{amount}</Text>
      </Section>

      <Text style={bodyTextStyle}>
        No action is needed — your plan will renew automatically with your
        current payment method. If you need to update your billing information
        or change your plan, visit your billing settings.
      </Text>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailCTAButton href="https://terrain.ambrosiaventures.co/settings/billing">
          Manage subscription
        </EmailCTAButton>
      </Section>

      <Text style={mutedTextStyle}>
        No action needed — your plan will renew automatically.
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

const detailsCardStyle: React.CSSProperties = {
  backgroundColor: '#0D1B2E',
  borderRadius: '6px',
  border: '1px solid rgba(100, 116, 139, 0.15)',
  padding: '16px 20px',
  margin: '20px 0',
};

const detailLabelStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '8px 0 2px',
};

const detailValueStyle: React.CSSProperties = {
  fontFamily: '"DM Mono", monospace',
  color: '#F0F4F8',
  fontSize: '14px',
  margin: '0 0 4px',
};

const mutedTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '24px 0 0',
};

export default RenewalReminderEmail;
