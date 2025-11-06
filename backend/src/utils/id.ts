import { customAlphabet } from 'nanoid';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';

// IDs are based off the Stripe convention, where each id has a descriptive prefix that describes what it corresponds to
// https://dev.to/stripe/designing-apis-for-humans-object-ids-3o5a

// Mapping readable prefix names : id prefixes
const ID_PREFIXES = {
  account: 'acct',
  profile: 'profile',
  course: 'course',
  courseEvent: 'lecture',
  session: 'sid',
  organization: 'org',
} as const;

type IdPrefixNames = keyof typeof ID_PREFIXES;

const hexAlphabet = customAlphabet('abcdef0123456789', 16);

export function generatePrefixedId(prefix: IdPrefixNames) {
  if (prefix === 'session') {
    // If we're asked for a session id, make sure it is secure
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    return `${ID_PREFIXES[prefix]}_${encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase()}`;
  }

  return `${ID_PREFIXES[prefix]}_${hexAlphabet()}`;
}

export function prefixedIdGenerator(prefix: IdPrefixNames) {
  return () => generatePrefixedId(prefix);
}
