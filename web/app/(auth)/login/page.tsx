import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { DiamondMark } from "@/components/diamond-mark";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "Log in" };

const FRIENDLY_ERROR: Record<string, string> = {
  bad_oauth_state:
    "Sign-in took too long or was opened from a stale tab. Please try again from this page.",
  exchange_failed:
    "We couldn't complete sign-in. Please try again.",
  missing_code:
    "Sign-in didn't return a valid code. Please try again.",
  invalid_request:
    "There was a problem with the sign-in request. Please try again.",
};

export default async function LoginPage(
  { searchParams }: { searchParams: Promise<Record<string, string | undefined>> },
) {
  const sp = await searchParams;
  const errorCode = sp.error_code ?? sp.error;
  const errorDescription = sp.description ?? sp.error_description;
  const friendlyMessage = errorCode ? (FRIENDLY_ERROR[errorCode] ?? errorDescription ?? errorCode) : null;

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto"><DiamondMark size={32} /></div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to continue exploring scenarios.</CardDescription>
        </CardHeader>
        <CardContent>
          {friendlyMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <span className="text-foreground/90">{friendlyMessage}</span>
            </div>
          )}
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
