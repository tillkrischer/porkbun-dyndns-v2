#!/usr/bin/env bun

import { editDnsRecord } from './edit';
import { config } from './config';
import { getPublicIpv4, getPublicIpv6 } from './ip';
import { DnsRecord, retrieveByNameType } from './retrieveByNameType';


console.log(`[${new Date().toISOString()}] Starting porkbun-dyndns-v2...`);
console.log(`[${new Date().toISOString()}] Domain: ${config.DOMAIN}`);

type ManagedRecordType = 'A' | 'AAAA';

async function getCurrentRecord(type: ManagedRecordType): Promise<DnsRecord | null> {
    const recordsResponse = await retrieveByNameType(config.DOMAIN, type);

    if (recordsResponse.records.length === 0) {
        return null;
    }

    return recordsResponse.records[0];
}

async function syncRecord(type: ManagedRecordType, nextIp: string, required = false) {
  const currentRecord = await getCurrentRecord(type);

  if (!currentRecord) {
    if (required) {
      throw new Error(`No ${type} records found for domain ${config.DOMAIN}`);
    }

    console.log(`[${new Date().toISOString()}] No ${type} record found for domain ${config.DOMAIN}. Skipping.`);
    return;
  }

  console.log(`[${new Date().toISOString()}] Current ${type} record: ${currentRecord.content}`);

  if (currentRecord.content !== nextIp) {
    console.log(`[${new Date().toISOString()}] ${type} address has changed. Updating DNS...`);
    await editDnsRecord(config.DOMAIN, currentRecord.id, type, nextIp);
    console.log(`[${new Date().toISOString()}] Updated ${type} record to ${nextIp}`);
    return;
  }

  console.log(`[${new Date().toISOString()}] ${type} address has not changed.`);
}

async function main() {
  console.log(`[${new Date().toISOString()}] Running DNS update check...`);
  
  try {
    const currentIpv4 = await getPublicIpv4();
    console.log(`[${new Date().toISOString()}] Detected public IPv4: ${currentIpv4}`);

    await syncRecord('A', currentIpv4, true);

    const currentIpv6 = await getPublicIpv6();
    if (!currentIpv6) {
      console.log(`[${new Date().toISOString()}] No public IPv6 detected via Porkbun. Skipping AAAA update.`);
    } else {
      console.log(`[${new Date().toISOString()}] Detected public IPv6: ${currentIpv6}`);
      await syncRecord('AAAA', currentIpv6);
    }

    console.log(`[${new Date().toISOString()}] DNS update check completed`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during DNS update check:`, error);
  }
}

main().catch(console.error);

setInterval(() => {
  main().catch(console.error);
}, 5 * 60 * 1000);

console.log(`[${new Date().toISOString()}] Scheduler started. Will run every 5 minutes...`);
