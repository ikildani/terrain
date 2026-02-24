import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';
import { EmailCTAButton } from './components/Button';

interface TeamInviteEmailProps {
  inviterName: string;
  inviterEmail: string;
}

export function TeamInviteEmail({ inviterName, inviterEmail }: TeamInviteEmailProps) {
  return (
    <EmailLayout preview={`${inviterName || inviterEmail} invited you to Terrain`}>
      <Text style={headingStyle}>You&apos;ve been invited to Terrain.</Text>
      <Text style={bodyTextStyle}>
        <strong>{inviterName || inviterEmail}</strong> has invited you to join their team on Terrain, an
        institutional-grade market intelligence platform for life sciences.
      </Text>
      <Text style={bodyTextStyle}>
        Create your account to access shared analyses, competitive landscapes, partner discovery, and more.
      </Text>

      <Section style={{ margin: '24px 0', textAlign: 'center' as const }}>
        <EmailCTAButton href="https://terrain.ambrosiaventures.co/signup">Join Team</EmailCTAButton>
      </Section>

      <Text style={footerTextStyle}>
        Sign up with the email address this invitation was sent to and you&apos;ll be automatically added to the team.
      </Text>
    </EmailLayout>
  );
}

const headingStyle = {
  fontSize: '20px',
  fontWeight: '600' as const,
  color: '#F0F4F8',
  margin: '0 0 16px',
};

const bodyTextStyle = {
  fontSize: '14px',
  color: '#94A3B8',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const footerTextStyle = {
  fontSize: '12px',
  color: '#64748B',
  lineHeight: '1.5',
  margin: '16px 0 0',
};
