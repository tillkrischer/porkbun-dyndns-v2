import { isIP } from 'node:net';
import { z } from 'zod';

const ipResponseSchema = z.object({
    status: z.literal('SUCCESS'),
    yourIp: z.string(),
});

async function fetchPublicIp(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return ipResponseSchema.parse(data).yourIp;
}

export async function getPublicIpv4(): Promise<string> {
    const ip = await fetchPublicIp('https://api-ipv4.porkbun.com/api/json/v3/ip');

    if (isIP(ip) !== 4) {
        throw new Error(`Expected IPv4 address from Porkbun IPv4 endpoint, received: ${ip}`);
    }

    return ip;
}

export async function getPublicIpv6(): Promise<string | null> {
    const ip = await fetchPublicIp('https://api.porkbun.com/api/json/v3/ip');

    if (isIP(ip) === 6) {
        return ip;
    }

    return null;
}
