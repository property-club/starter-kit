"use client";

// 1. Import modules
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { State, WagmiProvider } from "wagmi";
import { SimpleKitProvider } from "./simplekit";
import { wagmiConfig } from "../config";

// 3. Initialize your new QueryClient
const queryClient = new QueryClient();

// 4. Create your Wagmi provider
export function Web3Provider(props: {
  initialState: State | undefined;
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        <SimpleKitProvider>{props.children}</SimpleKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
