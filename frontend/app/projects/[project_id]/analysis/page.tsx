import { AnalysisScreen } from "@/components/project/analysis-screen";
export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  return <AnalysisScreen project_id={(await params).project_id} />;
}
