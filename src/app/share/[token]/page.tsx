import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://terrain.ambrosiaventures.co';

  try {
    const res = await fetch(`${baseUrl}/api/share/${token}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          title: `${json.data.title} — Terrain`,
          description: `${json.data.report_type} report for ${json.data.indication}. Shared via Terrain by Ambrosia Ventures.`,
        };
      }
    }
  } catch {
    // Fall through to default
  }

  return {
    title: 'Shared Report — Terrain',
    description: 'Market Opportunity Intelligence by Ambrosia Ventures',
  };
}

export { SharedReportPage as default } from './SharedReportView';
