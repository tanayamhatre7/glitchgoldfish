import { notFound } from "next/navigation";
import { sections } from "@/lib/constants/navigation";
import { BlueprintWorkspace } from "@/components/blueprint/blueprint-workspace";
export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string; section: string }>;
}) {
  const { project_id, section } = await params;
  if (!sections.some((item) => item[0] === section)) notFound();
  return <BlueprintWorkspace project_id={project_id} section={section} />;
}
