import Link from "next/link";
import { GoogleSignInButton } from "@/features/auth-google-signin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export function LoginView() {
  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-10">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight">GrowTap</h1>
          <p className="text-muted-foreground text-sm">
            한 번의 탭으로 쌓아가는 작은 실천
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-lg">로그인 / 회원가입</CardTitle>
            <CardDescription>
              Google 계정으로 간편하게 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignInButton />
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-xs leading-relaxed">
          계속 진행 시{" "}
          <Link href="/terms" className="text-foreground underline">
            이용약관
          </Link>
          {" 및 "}
          <Link href="/privacy" className="text-foreground underline">
            개인정보처리방침
          </Link>
          에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </main>
  );
}
