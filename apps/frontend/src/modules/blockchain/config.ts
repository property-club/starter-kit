import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors";

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export function getConfig() {
  return createConfig({
    chains: [mainnet],
    connectors: [
      injected({ target: "metaMask" }),
      coinbaseWallet(),
      walletConnect({ projectId }),
    ],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [mainnet.id]: http(),
    },
  });
}

export const wagmiConfig = getConfig();
