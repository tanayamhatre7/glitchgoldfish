import { ProjectWorkspace } from "@/components/project/project-workspace";
export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  return <ProjectWorkspace project_id={(await params).project_id} />;
}
