import { StubPage } from "@/components/stub-page";

export default function TrackingPixelsPage() {
  return (
    <StubPage
      title="Tracking & Pixels"
      subtitle="Ad platform pixels and server-side conversion tracking per brand"
      icon="ri-radar-line"
      body="This will manage Meta/TikTok/Google pixel IDs per brand and relay server-side conversion events straight from the order webhook, for accuracy iOS-side pixel tracking alone misses."
    />
  );
}
