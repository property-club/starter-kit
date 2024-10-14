import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";
import { passkeyConnector } from "@zerodev/magic-account";
import { googleConnector } from "@zerodev/magic-account";

export function getConfig() {
  return createConfig({
    chains: [sepolia],
    connectors: [passkeyConnector(), googleConnector()],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [sepolia.id]: http(),
    },
  });
}

export const wagmiConfig = getConfig();
