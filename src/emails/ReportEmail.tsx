import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/Layout';
import { EmailCTAButton } from './components/Button';

interface ReportEmailProps {
  userName: string;
  reportTitle: string;
  reportSubtitle?: string;
  reportUrl?: string;
}

export function ReportEmail({
  userName,
  reportTitle,
  reportSubtitle,
  reportUrl = 'https://terrain.ambrosiaventures.co/reports',
}: ReportEmailProps) {
  return (
    <EmailLayout preview={`Your Terrain report: ${reportTitle}`}>
      <Text style={headingStyle}>Your report is ready.</Text>

      <Text style={bodyTextStyle}>
        {userName ? `Hi ${userName}, your` : 'Your'} Terrain intelligence report
        has been generated and is ready to view.
      </Text>

      <Section style={reportCardStyle}>
        <Text style={reportTitleStyle}>{reportTitle}</Text>
        {reportSubtitle && (
          <Text style={reportSubtitleStyle}>{reportSubtitle}</Text>
        )}
      </Section>

      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <EmailCTAButton href={reportUrl}>View full report</EmailCTAButton>
      </Section>

      <Text style={mutedTextStyle}>
        For the full interactive experience including charts and export
        options, view your report in Terrain.
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

const reportCardStyle: React.CSSProperties = {
  backgroundColor: '#0D1B2E',
  borderRadius: '6px',
  border: '1px solid rgba(0, 201, 167, 0.2)',
  padding: '16px 20px',
  margin: '20px 0',
};

const reportTitleStyle: React.CSSProperties = {
  fontFamily: '"DM Serif Display", Georgia, serif',
  fontSize: '16px',
  color: '#F0F4F8',
  margin: '0',
  fontWeight: 400,
};

const reportSubtitleStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '13px',
  margin: '4px 0 0',
};

const mutedTextStyle: React.CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '24px 0 0',
};

export default ReportEmail;
