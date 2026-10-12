import { redirect } from "next/navigation";

export default async function BlueprintRedirect({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  redirect(`/projects/${project_id}/blueprint/overview`);
}
