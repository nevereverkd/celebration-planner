# Firebase security review

## Data model and access paths

- The client reads, creates, updates, and deletes `user_celebrations/{uid}` only.
- The document contains `events` (a list of planner event maps), `updatedAt` (Firestore server timestamp), and `clientTimestamp` (ISO date string).
- There are no Firestore queries; reads use `getDoc` and live subscriptions use `onSnapshot` on the user's document.
- Authentication was previously anonymous-only. Email/password and Google sign-in, account creation, password reset, and sign-out are now configured and deployed. The Google OAuth support contact is the Firebase project owner's email.

## Findings addressed

- Added owner-only Firestore rules, payload field allowlisting, a maximum event count, and default-deny behavior.
- Removed the unsafe fallback that treated the Firebase web API key as a Gemini API key.
- Removed `dangerouslySetInnerHTML` from AI response rendering so model text cannot execute markup or scripts.
- Added clear account state and sign-out controls.

## Remaining deployment and review steps

- Deploy `firestore.rules` to Firebase project `event-manage-app-147a1` after reviewing the rules in Firebase Console. The rules are a prototype: nested event maps are not deeply schema-validated, and every signed-in account can still write up to 100 planner entries in its own document.
- Enable Email/Password sign-in in Firebase Authentication and verify the authorized domains.
- Restrict the Firebase web API key by allowed APIs and web referrers in Google Cloud Console. Firebase client config is public by design; it is not an authorization secret.
- Configure a server-side Gemini proxy (for example, a callable Cloud Function with App Check and rate limits) before using a shared production Gemini key. A user-supplied Gemini key remains in browser storage and is sent to Google's API from the browser.
- Review XSS handling anywhere else untrusted text is rendered; this review found the AI renderer as the direct HTML injection point.
