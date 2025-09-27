import { z } from 'zod';
import { config } from './config';

const pingRequestSchema = z.object({
    secretapikey: z.string(),
    apikey: z.string(),
});

const pingResponseSchema = z.object({
    status: z.literal("SUCCESS"),
    yourIp: z.string(),
});

type PingRequest = z.infer<typeof pingRequestSchema>;
type PingResponse = z.infer<typeof pingResponseSchema>;

export async function ping(): Promise<PingResponse> {
    const requestBody: PingRequest = {
        secretapikey: config.SECRETAPIKEY,
        apikey: config.APIKEY,
    };

    const response = await fetch('https://api.porkbun.com/api/json/v3/ping', {
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
    return pingResponseSchema.parse(data);
}

export type { PingResponse };