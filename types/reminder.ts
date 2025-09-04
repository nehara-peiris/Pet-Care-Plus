export type Repeat = { freq: 'once'|'daily'|'weekly'|'monthly'; byWeekday?: number[]; };
export type Reminder = { id: string; petId: string; kind: 'meds'|'feed'|'walk'|'groom'|'vax'|'deworm';
  timeIso: string; repeat: Repeat; note?: string; enabled: boolean; };
