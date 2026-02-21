import { signIn } from "@/lib/auth";

export async function GET() {
  await signIn("credentials", {
    email: "admin@demo.de",
    password: "demo1234",
    redirectTo: "/dashboard",
  });
}
