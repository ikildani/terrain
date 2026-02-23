import { Button } from '@react-email/components';
import * as React from 'react';

interface EmailCTAButtonProps {
  href: string;
  children: React.ReactNode;
}

export function EmailCTAButton({ href, children }: EmailCTAButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: '#00C9A7',
        borderRadius: '6px',
        color: '#04080F',
        display: 'inline-block',
        fontFamily: 'Sora, Helvetica, sans-serif',
        fontSize: '13px',
        fontWeight: 600,
        padding: '12px 24px',
        textDecoration: 'none',
        textAlign: 'center' as const,
      }}
    >
      {children}
    </Button>
  );
}
