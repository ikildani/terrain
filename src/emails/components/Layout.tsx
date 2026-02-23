import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Font,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const NAVY_950 = '#04080F';
const NAVY_900 = '#07101E';
const TEAL_500 = '#00C9A7';
const SLATE_500 = '#64748B';
const WHITE = '#F0F4F8';

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Sora"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/sora/v12/xMQbuFFYT72X5wkB_18qmnndmSdSnk-DKQJRBg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Text style={brandStyle}>TERRAIN</Text>
            <Text style={brandTaglineStyle}>by Ambrosia Ventures</Text>
          </Section>

          <Hr style={accentLineStyle} />

          <Section style={contentStyle}>{children}</Section>

          <Hr style={footerLineStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Terrain by Ambrosia Ventures
            </Text>
            <Text style={footerTextStyle}>
              Market Opportunity Intelligence for Life Sciences
            </Text>
            <Link
              href="https://terrain.ambrosiaventures.co"
              style={footerLinkStyle}
            >
              terrain.ambrosiaventures.co
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: NAVY_950,
  fontFamily: 'Sora, Helvetica, Arial, sans-serif',
  margin: '0',
  padding: '0',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: NAVY_900,
  borderRadius: '8px',
  border: '1px solid rgba(100, 116, 139, 0.15)',
  margin: '40px auto',
  maxWidth: '560px',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  padding: '32px 40px 16px',
};

const brandStyle: React.CSSProperties = {
  color: WHITE,
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  margin: '0',
};

const brandTaglineStyle: React.CSSProperties = {
  color: TEAL_500,
  fontSize: '11px',
  margin: '4px 0 0',
};

const accentLineStyle: React.CSSProperties = {
  borderColor: TEAL_500,
  borderWidth: '1px',
  margin: '0 40px',
};

const contentStyle: React.CSSProperties = {
  padding: '24px 40px 32px',
};

const footerLineStyle: React.CSSProperties = {
  borderColor: 'rgba(100, 116, 139, 0.15)',
  margin: '0 40px',
};

const footerStyle: React.CSSProperties = {
  padding: '24px 40px',
};

const footerTextStyle: React.CSSProperties = {
  color: SLATE_500,
  fontSize: '11px',
  margin: '0 0 4px',
};

const footerLinkStyle: React.CSSProperties = {
  color: TEAL_500,
  fontSize: '11px',
  textDecoration: 'none',
};
