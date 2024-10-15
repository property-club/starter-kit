// app/verify.tsx
"use client";

import { useState } from "react";

import { SiweMessage } from "siwe";
import { verifyMessage } from "viem";
import { getNonce } from "../actions";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { Button } from "@repo/ui/components/ui/button";

export default function VerifyButton() {
  const [status, setStatus] = useState("");
  const account = useAccount();
  const chain = useChainId();
  const { signMessageAsync } = useSignMessage();

  const handleSignIn = async () => {
    try {
      const address = account.address;
      if (!address) throw new Error("no connected address");
      // Fetch the nonce from the server
      const nonce = await getNonce();

      // Create the SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: chain,
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

      if (result) {
        setStatus("Successfully signed in!");
      } else {
        setStatus(`Error: shit hit the fan`);
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <Button variant="secondary" onClick={handleSignIn}>
        Sign-In with Ethereum
      </Button>
      <p>{status}</p>
    </div>
  );
}
