import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';
import { EmailCTAButton } from './components/Button';

interface CancellationConfirmationEmailProps {
  userName: string;
  planName: string;
  accessEndDate: string;
}

export function CancellationConfirmationEmail({
  userName,
  planName,
  accessEndDate,
}: CancellationConfirmationEmailProps) {
  return (
    <EmailLayout preview="Your Terrain subscription has been cancelled">
      <Text style={headingStyle}>
        Your cancellation has been confirmed.
      </Text>
      <Text style={bodyTextStyle}>
        {userName ? `Hi ${userName}, ` : ''}Your Terrain {planName} subscription
        has been cancelled. You will retain {planName} access until{' '}
        <strong style={{ color: '#F0F4F8' }}>{accessEndDate}</strong>, after
        which your account will revert to the Free plan.
      </Text>

      <Section style={{ margin: '24px 0' }}>
        <Text style={featureHeaderStyle}>What you keep (Free plan):</Text>
        <Text style={listItemStyle}>3 market sizing analyses per month</Text>
        <Text style={listItemStyle}>1 competitive landscape per month</Text>
        <Text style={listItemStyle}>3 saved reports</Text>
      </Section>

      <Section style={{ margin: '24px 0' }}>
        <Text style={lostHeaderStyle}>What you lose:</Text>
        <Text style={lostItemStyle}>Unlimited analyses</Text>
        <Text style={lostItemStyle}>Partner discovery and matching</Text>
        <Text style={lostItemStyle}>Regulatory pathway intelligence</Text>
        <Text style={lostItemStyle}>PDF and CSV exports</Text>
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailCTAButton href="https://terrain.ambrosiaventures.co/settings/billing">
          Re-subscribe
        </EmailCTAButton>
      </Section>

      <Text style={mutedTextStyle}>
        Changed your mind? You can re-subscribe anytime before {accessEndDate}{' '}
        to keep uninterrupted access.
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

const featureHeaderStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 12px',
};

const listItemStyle: React.CSSProperties = {
  color: '#CBD5E1',
  fontSize: '13px',
  margin: '0 0 8px',
  paddingLeft: '12px',
  borderLeft: '2px solid #00C9A7',
};

const lostHeaderStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 12px',
};

const lostItemStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '13px',
  margin: '0 0 8px',
  paddingLeft: '12px',
  borderLeft: '2px solid #64748B',
  textDecoration: 'line-through',
};

const mutedTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '24px 0 0',
};

export default CancellationConfirmationEmail;
