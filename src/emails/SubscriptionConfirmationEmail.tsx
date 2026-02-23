import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';
import { EmailCTAButton } from './components/Button';

interface SubscriptionConfirmationEmailProps {
  userName: string;
  planName: string;
  price: string;
  nextBillingDate: string;
}

export function SubscriptionConfirmationEmail({
  userName,
  planName,
  price,
  nextBillingDate,
}: SubscriptionConfirmationEmailProps) {
  const features =
    planName === 'Team'
      ? [
          'Everything in Pro',
          '5 team seats included',
          'Shared report library',
          'API access for integrations',
          'Priority support',
        ]
      : [
          'Unlimited market sizing analyses',
          'Partner discovery and matching',
          'Regulatory pathway intelligence',
          'PDF and CSV report exports',
          'Global geography coverage',
        ];

  return (
    <EmailLayout
      preview={`Your Terrain ${planName} plan is now active`}
    >
      <Text style={headingStyle}>
        Your {planName} plan is active{userName ? `, ${userName}` : ''}.
      </Text>
      <Text style={bodyTextStyle}>
        Thank you for upgrading. You now have full access to Terrain&apos;s
        {planName === 'Team' ? ' team' : ' professional'} intelligence tools.
      </Text>

      <Section style={{ margin: '24px 0' }}>
        <Text style={featureHeaderStyle}>
          What&apos;s included in {planName}:
        </Text>
        {features.map((feature) => (
          <Text key={feature} style={listItemStyle}>
            {feature}
          </Text>
        ))}
      </Section>

      <Section style={billingBoxStyle}>
        <Text style={billingLabelStyle}>Plan</Text>
        <Text style={billingValueStyle}>
          {planName} — {price}/mo
        </Text>
        <Text style={billingLabelStyle}>Next billing date</Text>
        <Text style={billingValueStyle}>{nextBillingDate}</Text>
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailCTAButton href="https://terrain.ambrosiaventures.co/dashboard">
          Explore your new features
        </EmailCTAButton>
      </Section>

      <Text style={mutedTextStyle}>
        You can manage your subscription anytime from Settings &gt; Billing.
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

const billingBoxStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0, 201, 167, 0.05)',
  border: '1px solid rgba(0, 201, 167, 0.15)',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '24px 0',
};

const billingLabelStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 2px',
};

const billingValueStyle: React.CSSProperties = {
  color: '#F0F4F8',
  fontSize: '14px',
  fontFamily: '"DM Mono", monospace',
  margin: '0 0 12px',
};

const mutedTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '24px 0 0',
};

export default SubscriptionConfirmationEmail;
