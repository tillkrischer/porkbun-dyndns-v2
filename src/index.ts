#!/usr/bin/env bun

import { editDnsRecord } from './edit';
import { config } from './config';
import { getPublicIpv4, getPublicIpv6 } from './ip';
import { DnsRecord, retrieveByNameType } from './retrieveByNameType';

type LogLevel = 'error' | 'info' | 'debug';
type ManagedRecordType = 'A' | 'AAAA';

const logLevels: Record<LogLevel, number> = {
  error: 0,
  info: 1,
  debug: 2,
};

function log(level: LogLevel, message: string, ...args: unknown[]) {
  if (logLevels[level] > logLevels[config.LOG_LEVEL]) {
    return;
  }

  const output = `[${new Date().toISOString()}] ${message}`;

  if (level === 'error') {
    console.error(output, ...args);
    return;
  }

  console.log(output, ...args);
}

log('info', 'Starting porkbun-dyndns-v2...');
log('info', `Domain: ${config.DOMAIN}`);

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

    log('info', `No ${type} record found for domain ${config.DOMAIN}. Skipping.`);
    return;
  }

  log('debug', `Current ${type} record: ${currentRecord.content}`);

  if (currentRecord.content !== nextIp) {
    log('info', `${type} address has changed. Updating DNS...`);
    await editDnsRecord(config.DOMAIN, currentRecord.id, type, nextIp);
    log('info', `Updated ${type} record to ${nextIp}`);
    return;
  }

  log('debug', `${type} address has not changed.`);
}

async function main() {
  log('debug', 'Running DNS update check...');
  
  try {
    const currentIpv4 = await getPublicIpv4();
    log('debug', `Detected public IPv4: ${currentIpv4}`);

    await syncRecord('A', currentIpv4, true);

    const currentIpv6 = await getPublicIpv6();
    if (!currentIpv6) {
      log('info', 'No public IPv6 detected via Porkbun. Skipping AAAA update.');
    } else {
      log('debug', `Detected public IPv6: ${currentIpv6}`);
      await syncRecord('AAAA', currentIpv6);
    }

    log('debug', 'DNS update check completed');
  } catch (error) {
    log('error', 'Error during DNS update check:', error);
  }
}

main().catch((error) => log('error', 'Unhandled error during startup:', error));

setInterval(() => {
  main().catch((error) => log('error', 'Unhandled error during scheduled run:', error));
}, 5 * 60 * 1000);

log('info', 'Scheduler started. Will run every 5 minutes...');
