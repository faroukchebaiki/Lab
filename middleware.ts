import { auth } from "@/lib/neon-auth-server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: ["/dashboard/:path*", "/reports/:path*"],
};
