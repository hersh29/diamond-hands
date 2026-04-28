import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "./signup-form";
import { DiamondMark } from "@/components/diamond-mark";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto"><DiamondMark size={32} /></div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Save scenarios, build paper portfolios, and track them over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
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
