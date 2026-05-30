import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return {
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application runtime error", {
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
          <Card className="w-full max-w-lg rounded-lg">
            <CardHeader>
              <CardTitle>
                Student CRM could not start
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                A runtime error occurred while loading the application.
              </p>

              <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs text-foreground">
                {this.state.error.message}
              </pre>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
