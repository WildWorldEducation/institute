'use strict';
/*
 * Load provider API keys from AWS SSM Parameter Store into process.env BEFORE
 * the app (or a test) reads them — the same pattern RFab uses in its
 * scripts/start.js. This is why institute "just has" GROK_API_KEY etc. without
 * anyone hand-fetching secrets.
 *
 * - In dev, only provider keys (names ending _API_KEY / _API_KEY_BACKUP /
 *   _TOKEN) are pulled; infra secrets (DB creds, session secret) stay local.
 * - Never overrides a value already set in the environment, so .env / real env
 *   still win when explicitly set.
 * - SSM_PATH / AWS_REGION are overridable. Locally this points at RFab's
 *   /rfab/prod/. In institute's own AWS account, point SSM_PATH at wherever the
 *   key is replicated (see prod caveat in the audit notes).
 */
const { SSMClient, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');

const DEV_PROVIDER_KEY_PATTERN = /(_API_KEY(_BACKUP)?|_TOKEN)$/;

async function loadSSMSecrets() {
    const env = process.env.NODE_ENV;
    const isDeployed = env === 'production' || env === 'staging';
    const ssmPath = process.env.SSM_PATH || '/rfab/prod/';
    const region = process.env.AWS_REGION || 'us-east-1';
    const ssm = new SSMClient({ region });

    let nextToken;
    let loaded = 0;
    let skipped = 0;
    try {
        do {
            const resp = await ssm.send(
                new GetParametersByPathCommand({
                    Path: ssmPath,
                    WithDecryption: true,
                    Recursive: false,
                    NextToken: nextToken
                })
            );
            for (const p of resp.Parameters || []) {
                const key = p.Name.slice(ssmPath.length);
                if (!isDeployed && !DEV_PROVIDER_KEY_PATTERN.test(key)) {
                    skipped++;
                    continue;
                }
                if (process.env[key] === undefined || process.env[key] === '') {
                    process.env[key] = p.Value;
                    loaded++;
                } else {
                    skipped++;
                }
            }
            nextToken = resp.NextToken;
        } while (nextToken);
        console.log(`[SSM] loaded ${loaded} provider keys from ${ssmPath} (${skipped} skipped)`);
    } catch (err) {
        console.warn(
            `[SSM] could not load from ${ssmPath}: ${err.message} — continuing with existing env/.env`
        );
    }
}

module.exports = { loadSSMSecrets };
