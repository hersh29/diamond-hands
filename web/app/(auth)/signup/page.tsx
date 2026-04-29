import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "./signup-form";
import { DiamondMark } from "@/components/diamond-mark";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-grid py-10 sm:py-12">
      <Card className="terminal-card w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto"><DiamondMark size={28} /></div>
          <span className="eyebrow">New account</span>
          <CardTitle className="text-2xl tracking-tight">Create your account</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Save scenarios, build paper portfolios, and track them over time.
          </p>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
            By signing up you agree to our{" "}
            <Link href="/legal/terms" className="underline">terms</Link> and acknowledge
            the{" "}
            <Link href="/legal/disclaimer" className="underline">disclaimer</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
