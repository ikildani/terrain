import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';
import { EmailCTAButton } from './components/Button';

interface WelcomeEmailProps {
  userName: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to Terrain — your market intelligence is ready">
      <Text style={headingStyle}>
        Welcome to Terrain{userName ? `, ${userName}` : ''}.
      </Text>
      <Text style={bodyTextStyle}>
        You now have access to institutional-grade market intelligence for life
        sciences. Run your first analysis in under 90 seconds.
      </Text>

      <Section style={{ margin: '24px 0' }}>
        <Text style={featureHeaderStyle}>What you can do today:</Text>
        <Text style={listItemStyle}>
          TAM/SAM/SOM analysis across 150+ indications
        </Text>
        <Text style={listItemStyle}>
          Competitive landscape mapping with pipeline data
        </Text>
        <Text style={listItemStyle}>
          Save and compare reports over time
        </Text>
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailCTAButton href="https://terrain.ambrosiaventures.co/market-sizing">
          Run your first analysis
        </EmailCTAButton>
      </Section>

      <Text style={mutedTextStyle}>
        Free plan includes 3 market sizing reports per month. Upgrade to Pro
        for unlimited access, partner discovery, and PDF exports.
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

const mutedTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '24px 0 0',
};

export default WelcomeEmail;
