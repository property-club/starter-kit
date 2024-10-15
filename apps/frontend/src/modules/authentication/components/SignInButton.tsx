// components/SignInButton.tsx
"use client";

import React from "react";
import { Button, ButtonProps } from "@repo/ui/components/ui/button";

import { useRouter } from "next/navigation";
import { useSignIn } from "~/screens/UserSettings/useSignin";
import { useAccount } from "wagmi";
import { useSimpleKit } from "~/modules/wallet";

interface SignInButtonProps extends ButtonProps {
  buttonText?: string;
}

const SignInButton: React.FC<SignInButtonProps> = ({
  buttonText = "Sign-In with Ethereum",
  ...props
}) => {
  const { address } = useAccount();
  const simplekit = useSimpleKit();

  const router = useRouter();
  const { mutate: signIn, isPending: isLoading, isError, error } = useSignIn();

  const handleAction = () => {
    if (address) {
      // If address exists, proceed with sign-in
      signIn(undefined, {
        onSuccess: () => {
          console.log("Signed in!");
          router.push("/dashboard");
        },
        onError: (err: Error) => {
          console.error("Sign in error:", err);
        },
      });
    } else {
      simplekit.toggleModal();
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Signing In...";
    if (!address) return "Connect Wallet";
    return buttonText;
  };

  return (
    <div>
      <Button
        variant="secondary"
        onClick={handleAction}
        disabled={isLoading}
        {...props}
      >
        {getButtonText()}
      </Button>

      {isError && error && (
        <p className="text-red-500 mt-2">
          {"An error occurred during sign-in."} {error.message}
        </p>
      )}
    </div>
  );
};

export default SignInButton;
