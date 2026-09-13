import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Isolates runtime errors in a subtree of the Command Deck.
 * Does not catch build-time / parse-time errors (those fail before React mounts).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Replace with preferred telemetry when available
    console.error("[Command Deck ErrorBoundary]", error, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className={cn(
            "flex h-full min-h-[12rem] w-full flex-col items-center justify-center gap-4 rounded-lg bg-card/80 p-6 text-center shadow-[var(--shadow-border)]",
            this.props.className,
          )}
        >
          <AlertTriangle className="size-8 text-destructive" strokeWidth={1.75} aria-hidden />
          <div className="space-y-1">
            <h2 className="font-display text-lg text-foreground">
              {this.props.fallbackTitle ?? "Field anomaly"}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              {this.props.fallbackMessage ??
                "A runtime error occurred in this section. The rest of the deck remains operational. You may reset this panel or reload the watch."}
            </p>
          </div>
          <Button variant="solid" onClick={this.handleReset} className="gap-2">
            <RotateCcw className="size-4" strokeWidth={1.75} />
            Reset section
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
