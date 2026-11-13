export type HelpIssue='microphone'|'network'|'translation'|'billing';
export function troubleshootingSteps(issue:HelpIssue):string[]{switch(issue){case 'microphone':return ['permission','device','retry'];case 'network':return ['wifi','shared-link','retry'];case 'translation':return ['language','short-sentence','retry'];case 'billing':return ['pin','payment','owner'];}}
