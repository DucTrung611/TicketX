'use client';

import Script from 'next/script';
import { useCallback, useRef } from 'react';
import { ApiError } from '@/shared/types/api-response.type';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          theme: string;
          size: string;
          shape?: string;
          width: number;
          text: string;
          locale: string;
        },
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
}

export function GoogleLoginButton({ onSuccess }: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const googleLoginMutation = useGoogleLogin();

  const handleCredential = useCallback(
    (response: GoogleCredentialResponse) => {
      googleLoginMutation.mutate(response.credential, { onSuccess });
    },
    [googleLoginMutation, onSuccess],
  );

  const initialize = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !containerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: 320,
      text: 'continue_with',
      locale: 'vi',
    });
  }, [handleCredential]);

  const errorMessage =
    googleLoginMutation.error instanceof ApiError
      ? googleLoginMutation.error.message
      : googleLoginMutation.error
        ? 'Đăng nhập Google thất bại, vui lòng thử lại'
        : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={initialize}
      />
      <div ref={containerRef} />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
