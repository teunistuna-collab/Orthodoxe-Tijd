// Gedeelde namen van window-events tussen pagina's.

/** Vandaag vraagt de Etmaal-pagina om het venster van een dienst te openen (detail = titel van de dienst). */
export const OPEN_DIENST_EVENT = 'orthodoxe:open-dienst';

/** Vandaag vraagt een cyclus-pagina om een bepaalde pop-up te openen. */
export const OPEN_POPUP_EVENT = 'orthodoxe:open-popup';
export type OpenPopupDetail = { pagina: 'week' | 'vasten' | 'pascha'; sleutel: string };
