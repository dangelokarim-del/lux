import { DigitalTwin } from "@/components/live/DigitalTwin";

export default async function VillaTwinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DigitalTwin propertyId={id} />;
}
