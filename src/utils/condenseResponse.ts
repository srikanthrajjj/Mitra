import { stripSimulationDisclaimer } from '../constants/simulation';
import { simplifyResponseText } from './simplifyResponseText';

/** Normalize assistant text (simulation notice lives on the input bar only). */
export function condenseResponse(text: string): string {
  return simplifyResponseText(stripSimulationDisclaimer(text));
}

export function condenseChoices<T>(choices: T[] | undefined): T[] | undefined {
  return choices;
}
