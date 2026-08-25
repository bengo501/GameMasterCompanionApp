import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { LocationForm } from "@/components/location-form";
import { loadCampaign } from "@/lib/campaigns/context";
import {
  getLocation,
  listLocations,
  updateLocation,
} from "@/lib/locations/actions";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string; locationId: string }>;
}) {
  const { id, locationId } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const location = await getLocation(id, locationId);
  if (!location) notFound();

  const all = await listLocations(id);
  const parents = all
    .filter((l) => l.id !== locationId)
    .map((l) => ({ id: l.id, name: l.name }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Editar {location.name}
      </h1>
      <LocationForm
        action={updateLocation}
        campaignId={id}
        location={location}
        parents={parents}
      />
    </div>
  );
}
