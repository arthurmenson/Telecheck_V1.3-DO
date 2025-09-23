import React from "react";
import { useToast } from "../hooks/use-toast";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    // no-op: handled via toast in render
  }

  render() {
    if (this.state.hasError) {
      return <BoundaryFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function BoundaryFallback({ error }: { error?: Error }) {
  const { toast } = useToast();
  React.useEffect(() => {
    toast({
      title: "Something went wrong",
      description: error?.message || "Unknown error",
      variant: "destructive",
    });
  }, [error, toast]);
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">An error occurred</h2>
      <p className="text-sm text-muted-foreground">
        Please try again or refresh the page.
      </p>
    </div>
  );
}
