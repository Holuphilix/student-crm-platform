import { PipelineBoard } from "@/features/deals/components/pipeline-board";

export function DealsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Deal Pipeline
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Track clients across each pipeline stage.
        </p>
      </div>

      <PipelineBoard />
    </div>
  );
}
