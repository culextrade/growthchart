import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const url = req.nextUrl.pathname;
        const role = req.nextauth.token?.role as string | undefined;

        // SUPERADMIN trying to access user pages → redirect to superadmin
        if (url.startsWith("/dashboard") || url.startsWith("/patients")) {
            if (role === "SUPERADMIN") {
                return NextResponse.redirect(new URL("/superadmin", req.url));
            }
        }

        // USER trying to access superadmin → redirect to dashboard
        if (url.startsWith("/superadmin") && role !== "SUPERADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/patients/:path*", "/superadmin/:path*"],
};
