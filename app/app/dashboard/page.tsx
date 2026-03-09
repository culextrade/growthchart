export const dynamic = 'force-dynamic';

import { getPatients } from "../actions";
import { DashboardClient } from "./dashboard-client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import pkg from "../../package.json";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const patients = await getPatients();

    // Serialize dates for client component
    const serialized = patients.map(p => ({
        ...p,
        dob: new Date(p.dob),
        _count: p._count,
    }));

    return <DashboardClient
        patients={serialized}
        userName={session?.user?.name || "Klinik"}
        userUsername={(session?.user as any)?.username || ""}
        version={pkg.version}
    />;
}
