import { getHospitalAccounts } from "./actions";
import SuperadminClient from "./superadmin-client";

export default async function SuperadminPage() {
    const hospitals = await getHospitalAccounts();

    return <SuperadminClient hospitals={JSON.parse(JSON.stringify(hospitals))} />;
}
