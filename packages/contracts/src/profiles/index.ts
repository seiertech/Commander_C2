/**
 * Domain Profiles — Commander SDR CMEP-1.0
 *
 * Barrel export for domain profile contracts and implementations.
 */

export type {
  DomainProfile,
  SignalResolver,
  SignalResolutionResult,
  PrioritySignalScore,
  SlaModifier,
  SlaModifierResolver,
  ValidationTypeDefinition,
  ValidationProfileResolver,
  ClosureGate,
  ClosureGateEvaluator,
  ReopeningTrigger,
  ReopeningTriggerEvaluator,
} from './types';

export * from './vulnerability/index';
