"use client";
import { StatePanel } from "@/components/ui/common";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <StatePanel
      error
      title="Unable to display this page"
      message="Please try again or return to your project list."
      retry={reset}
    />
  );
}
