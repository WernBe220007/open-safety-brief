import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { cacheLife, cacheTag } from "next/cache";

export interface Member {
    id: string;
    displayName: string;
    mail: string | null;
}

export interface MembersResponse {
    value: Member[];
    "@odata.nextLink"?: string;
}

async function getGraphClient(): Promise<Client> {
    const credential = new ClientSecretCredential(process.env.MICROSOFT_TENANT_ID as string, process.env.MICROSOFT_CLIENT_ID as string, process.env.MICROSOFT_CLIENT_SECRET as string);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ["https://graph.microsoft.com/.default"],
    });
    return Client.initWithMiddleware({ authProvider });
}

async function getGroupMembers(groupId: string): Promise<Member[]> {
    console.log("Fetching data from Microsoft Graph");
    const client = await getGraphClient();
    const allMembers: Member[] = [];

    let response: MembersResponse = await client
        .api(`/groups/${groupId}/members`)
        .select("id,displayName,mail")
        .top(100)
        .get();

    allMembers.push(...response.value);

    while (response["@odata.nextLink"]) {
        response = await client.api(response["@odata.nextLink"]).get();
        allMembers.push(...response.value);
    }

    return allMembers;
}

export async function getTeachers() {
    'use cache';
    cacheLife('days');
    cacheTag('graph-persons');
    const members = await getGroupMembers(process.env.MICROSOFT_TEACHERS_GROUP_ID as string);
    return members;
}