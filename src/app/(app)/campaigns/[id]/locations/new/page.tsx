import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { LocationForm } from "@/components/location-form";
import { loadCampaign } from "@/lib/campaigns/context";
import { createLocation, listLocations } from "@/lib/locations/actions";

export default async function NewLocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ parent?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const all = await listLocations(id);
  const parents = all.map((l) => ({ id: l.id, name: l.name }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nova localização</h1>
      <LocationForm
        action={createLocation}
        campaignId={id}
        parents={parents}
        defaultParentId={sp.parent}
      />
    </div>
  );
}
