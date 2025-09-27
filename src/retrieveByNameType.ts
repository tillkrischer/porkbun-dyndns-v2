import { z } from 'zod';
import { config } from './config';

const retrieveByNameTypeRequestSchema = z.object({
    secretapikey: z.string(),
    apikey: z.string(),
});

const dnsRecordSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    content: z.string(),
    ttl: z.string(),
    prio: z.string(),
    notes: z.string().nullable(),
});

const retrieveByNameTypeResponseSchema = z.object({
    status: z.literal("SUCCESS"),
    records: z.array(dnsRecordSchema),
});

type RetrieveByNameTypeRequest = z.infer<typeof retrieveByNameTypeRequestSchema>;
type RetrieveByNameTypeResponse = z.infer<typeof retrieveByNameTypeResponseSchema>;
type DnsRecord = z.infer<typeof dnsRecordSchema>;

export async function retrieveByNameType(
    domain: string,
    type: string,
    subdomain?: string
): Promise<RetrieveByNameTypeResponse> {
    const requestBody: RetrieveByNameTypeRequest = {
        secretapikey: config.SECRETAPIKEY,
        apikey: config.APIKEY,
    };

    // Build the URL with optional subdomain
    let url = `https://api.porkbun.com/api/json/v3/dns/retrieveByNameType/${domain}/${type}`;
    if (subdomain) {
        url += `/${subdomain}`;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return retrieveByNameTypeResponseSchema.parse(data);
}

export type { RetrieveByNameTypeResponse, DnsRecord };