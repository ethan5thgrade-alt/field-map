import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-full bg-paper-deep flex items-center justify-center py-12">
      <SignIn />
    </div>
  );
}
