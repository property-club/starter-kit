"use client";

import * as React from "react";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@repo/ui/components/ui/resizable";

import { TooltipProvider } from "@repo/ui/components/ui/tooltip";

import { cn } from "@repo/ui/lib/utils";
import { SideNav } from "./side-nav";

// === Inline Utility Function ===

// Function to read 'isCollapsed' from cookies
const getIsCollapsedFromCookie = (defaultValue: boolean): boolean => {
  if (typeof document === "undefined") return defaultValue; // Handle SSR
  const match = document.cookie.match(
    /react-resizable-panels:collapsed=(true|false)/,
  );
  if (match) {
    return match[1] === "true";
  }
  return defaultValue;
};

interface AppShellProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  mainView: React.ReactNode;
  secondaryView?: React.ReactNode;
}

export function AppShell({
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  mainView,
  secondaryView,
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(
    getIsCollapsedFromCookie(defaultCollapsed),
  );

  const isSingleView = defaultLayout.length > 2 ? false : true;

  // Initialize 'isCollapsed' state from cookies or props on mount
  React.useEffect(() => {
    const initialCollapsed = getIsCollapsedFromCookie(defaultCollapsed);
    setIsCollapsed(initialCollapsed);
    // Set cookie if not already set
    if (!document.cookie.includes("react-resizable-panels:collapsed")) {
      document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(initialCollapsed)}`;
    }
  }, [defaultCollapsed]);

  // Handlers to update state and cookies
  const handleCollapse = () => {
    setIsCollapsed(true);
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
  };

  const handleResize = () => {
    setIsCollapsed(false);
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes,
          )}`;
        }}
        className="max-h-[100vh] min-h-[100vh] items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={15}
          onCollapse={handleCollapse}
          onResize={handleResize}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <SideNav isCollapsed={isCollapsed} />
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={isSingleView ? undefined : defaultLayout[1]}
          minSize={30}
          className="flex-grow"
        >
          {mainView}
        </ResizablePanel>
        {secondaryView && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
              {secondaryView}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
