import { z } from 'zod';
import { config } from './config';

const editRequestSchema = z.object({
    secretapikey: z.string(),
    apikey: z.string(),
    name: z.string().optional(),
    type: z.enum(['A', 'MX', 'CNAME', 'ALIAS', 'TXT', 'NS', 'AAAA', 'SRV', 'TLSA', 'CAA', 'HTTPS', 'SVCB']),
    content: z.string(),
    ttl: z.string().optional(),
    prio: z.string().optional(),
    notes: z.string().nullable().optional(),
});

const editResponseSchema = z.object({
    status: z.literal("SUCCESS"),
});

type EditRequest = z.infer<typeof editRequestSchema>;
type EditResponse = z.infer<typeof editResponseSchema>;

export async function editDnsRecord(
    domain: string,
    recordId: string,
    type: 'A' | 'MX' | 'CNAME' | 'ALIAS' | 'TXT' | 'NS' | 'AAAA' | 'SRV' | 'TLSA' | 'CAA' | 'HTTPS' | 'SVCB',
    content: string,
    name?: string,
    ttl?: string,
    prio?: string,
    notes?: string | null
): Promise<EditResponse> {
    const requestBody: Partial<EditRequest> = {
        secretapikey: config.SECRETAPIKEY,
        apikey: config.APIKEY,
    };

    // Add optional parameters only if they are provided
    if (name !== undefined) requestBody.name = name;
    if (type !== undefined) requestBody.type = type;
    if (content !== undefined) requestBody.content = content;
    if (ttl !== undefined) requestBody.ttl = ttl;
    if (prio !== undefined) requestBody.prio = prio;
    if (notes !== undefined) requestBody.notes = notes;

    const url = `https://api.porkbun.com/api/json/v3/dns/edit/${domain}/${recordId}`;

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
    return editResponseSchema.parse(data);
}

export type { EditResponse };