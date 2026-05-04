import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-full bg-paper-deep flex items-center justify-center py-12">
      <SignUp />
    </div>
  );
}
