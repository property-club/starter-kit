import { AppShell } from "@repo/ui/components/AppShell/index";
import "@repo/ui/globals.css";

import { cookies } from "next/headers";

export default function RootLayout({
  secondary,
  main,
}: {
  secondary: React.ReactNode;
  main: React.ReactNode;
}): JSX.Element {
  const layout = cookies().get("react-resizable-panels:layout:mail");
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <AppShell
      mainView={main}
      secondaryView={secondary}
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      navCollapsedSize={4}
    />
  );
}
