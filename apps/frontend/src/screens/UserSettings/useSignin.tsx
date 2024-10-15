// hooks/useSignIn.ts
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { useMutation } from "@tanstack/react-query";
import { verifyMessage } from "viem";
import { getNonce } from "~/modules/authentication/actions";

export function useSignIn() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const mutationFn = async () => {
    if (!isConnected || !address) {
      throw new Error("No connected wallet address.");
    }

    // Fetch the nonce from the server
    const nonce = await getNonce();

    // Create the SIWE message
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in with Ethereum to the app.",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce,
    });

    // Sign the message
    const signature = await signMessageAsync({
      message: message.prepareMessage(),
    });

    // Verify the message on the server
    const result = await verifyMessage({
      address,
      message: message.toMessage(),
      signature,
    });

    if (!result) {
      throw new Error("Verification failed.");
    }

    return result;
  };

  const mutation = useMutation({ mutationFn });

  return mutation;
}
