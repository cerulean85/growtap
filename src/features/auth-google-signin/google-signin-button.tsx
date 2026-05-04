import { signIn } from "@/shared/api/auth/auth";
import { Button } from "@/shared/ui/button";
import { GoogleIcon } from "@/shared/icons/google";

export function GoogleSignInButton({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: callbackUrl ?? "/" });
      }}
      className="w-full"
    >
      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full h-12 gap-2 text-base"
      >
        <GoogleIcon className="size-5" />
        Google로 계속하기
      </Button>
    </form>
  );
}
