#!/usr/bin/env bun

import { config } from './config';
import { ping } from './ping';
import { DnsRecord, retrieveByNameType } from './retrieveByNameType';


console.log(`[${new Date().toISOString()}] Starting porkbun-dyndns-v2...`);
console.log(`[${new Date().toISOString()}] Domain: ${config.DOMAIN}`);

async function getPublicIp(): Promise<string> {
    const pingResponse = await ping();
    return pingResponse.yourIp;
}

async function getCurrentARecord(): Promise<DnsRecord> {
    const recordsResponse = await retrieveByNameType(config.DOMAIN, 'A');
    if (recordsResponse.records.length === 0) {
        throw new Error(`No A records found for domain ${config.DOMAIN}`);
    }
    return recordsResponse.records[0];
}

async function main() {
  console.log(`[${new Date().toISOString()}] Running DNS update check...`);
  
  try {
    const currentIp = await getPublicIp();
    console.log(`[${new Date().toISOString()}] Current public IP: ${currentIp}`);
    
    const currentARecord = await getCurrentARecord();
    console.log(`[${new Date().toISOString()}] Current A record: ${currentARecord.content}`);

    if (currentARecord.content !== currentIp) {
      console.log(`[${new Date().toISOString()}] IP address has changed. Updating DNS...`);
      await editDnsRecord(config.DOMAIN, currentARecord.id, undefined, undefined, currentIp);
    } else {
      console.log(`[${new Date().toISOString()}] IP address has not changed.`);
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