"use client";

import { SignIn } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn forceRedirectUrl="/ebook-generator" />
    </div>
  );
};

export default SignInPage;

