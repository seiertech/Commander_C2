/**
 * Email Case Communication Engine — Commander C2 (Unit 44)
 * Source: Spec #17 Closed-Loop Control Architecture
 * Binds inbound emails to cases, assesses binding confidence, rejects duplicates.
 *
 * RULE: Commander monitors customer's mailbox — no native inbox.
 * Inbound only. Commander does not send emails — it receives and binds.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InboundEmail {
  message_id: string;
  subject: string;
  senderDomain: string;
  thread_id: string | null;
  received_at: string;
  bodySnippet: string;
}

export interface CaseReference {
  case_ref: string;
  title: string;
  threadIds: string[];
  senderDomains: string[];
}

export interface EmailBindingResult {
  case_ref: string | null;
  confidence: number; // 0-100
  status: 'bound' | 'unmatched' | 'duplicate';
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Bind an inbound email to an existing case based on thread ID, subject match,
 * and sender domain correlation.
 * Returns the best-match case with confidence score.
 */
export function bindEmailToCase(
  email: InboundEmail,
  cases: CaseReference[],
): EmailBindingResult {
  let bestMatch: CaseReference | null = null;
  let bestConfidence = 0;

  for (const caseRef of cases) {
    let confidence = 0;

    // Thread ID match is strongest signal
    if (email.thread_id && caseRef.threadIds.includes(email.thread_id)) {
      confidence += 60;
    }

    // Subject similarity (contains case ref or title keywords)
    if (email.subject.includes(caseRef.case_ref)) {
      confidence += 30;
    } else if (caseRef.title && email.subject.toLowerCase().includes(caseRef.title.toLowerCase())) {
      confidence += 20;
    }

    // Sender domain match
    if (caseRef.senderDomains.includes(email.senderDomain)) {
      confidence += 10;
    }

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestMatch = caseRef;
    }
  }

  if (bestMatch && bestConfidence >= 50) {
    return {
      case_ref: bestMatch.case_ref,
      confidence: Math.min(100, bestConfidence),
      status: 'bound',
    };
  }

  return { case_ref: null, confidence: bestConfidence, status: 'unmatched' };
}

/**
 * Assess binding confidence from email metadata signals.
 * Higher confidence when subject contains case ref, sender domain is known,
 * and thread ID matches existing threads.
 */
export function assessBindingConfidence(
  subject: string,
  senderDomain: string,
  existingThreads: string[],
): number {
  let confidence = 0;

  // Subject contains a case reference pattern (e.g., CASE-XXXX)
  const caseRefPattern = /CASE-[A-Z0-9]+/i;
  if (caseRefPattern.test(subject)) {
    confidence += 40;
  }

  // Sender domain is known (non-generic)
  const genericDomains = new Set(['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com']);
  if (!genericDomains.has(senderDomain.toLowerCase())) {
    confidence += 30;
  }

  // Thread continuity
  if (existingThreads.length > 0) {
    confidence += 30;
  }

  return Math.min(100, confidence);
}

/**
 * Reject duplicate emails by comparing message ID against existing messages.
 * Returns true if the email is a duplicate and should be rejected.
 */
export function rejectDuplicate(
  email: InboundEmail,
  existing: InboundEmail[],
): boolean {
  // Exact message ID match — definite duplicate
  if (existing.some((e) => e.message_id === email.message_id)) {
    return true;
  }

  // Same thread, same sender, same subject within 60 seconds — probable duplicate
  const duplicateWindow = 60_000; // 60 seconds
  const emailTime = new Date(email.received_at).getTime();

  return existing.some((e) => {
    if (e.thread_id !== email.thread_id) return false;
    if (e.senderDomain !== email.senderDomain) return false;
    if (e.subject !== email.subject) return false;
    const existingTime = new Date(e.received_at).getTime();
    return Math.abs(emailTime - existingTime) < duplicateWindow;
  });
}
