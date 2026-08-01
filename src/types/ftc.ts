/**
 * Type definitions for the FIRST Tech Challenge Events API (v2.0)
 * https://ftc-events.firstinspires.org/services/API
 *
 * These model the subset of fields the app consumes. The API returns many
 * more fields; unknown ones are simply ignored.
 */

// ---- Teams ----

export interface Team {
  teamNumber: number;
  nameFull: string;
  nameShort: string;
  schoolName: string;
  city: string;
  stateProv: string;
  country: string;
  rookieYear: number | null;
  website: string | null;
  homeCMP: string | null;
}

export interface TeamListing {
  teams: Team[];
  teamCountTotal: number;
  teamCountPage: number;
  pageCurrent: number;
  pageTotal: number;
}

// ---- Events ----

export interface FtcEvent {
  eventId: string;
  code: string;
  name: string;
  type: string;
  typeName: string;
  regionCode: string | null;
  districtCode: string | null;
  venue: string;
  address: string;
  city: string;
  stateprov: string;
  country: string;
  dateStart: string; // ISO date
  dateEnd: string; // ISO date
  /** Present on some events; used for distance sorting when available. */
  location?: { lat: number; lng: number } | null;
  latitude?: number | null;
  longitude?: number | null;
  remote: boolean;
  hybrid: boolean;
}

export interface EventListing {
  events: FtcEvent[];
  eventCount: number;
}

// ---- Matches ----

export type Alliance = 'Red' | 'Blue';

export interface MatchTeam {
  teamNumber: number;
  station: string; // e.g. "Red1", "Blue2"
  dq: boolean;
  onField: boolean;
}

export interface FtcMatch {
  matchNumber: number;
  description: string;
  tournamentLevel: string; // "QUALIFICATION" | "PLAYOFF" | ...
  series: number;
  scoreRedFinal: number | null;
  scoreRedAuto: number | null;
  scoreBlueFinal: number | null;
  scoreBlueAuto: number | null;
  postResultTime: string | null;
  actualStartTime: string | null;
  teams: MatchTeam[];
}

export interface MatchListing {
  matches: FtcMatch[];
}

// ---- Rankings ----

export interface Ranking {
  rank: number;
  teamNumber: number;
  teamName: string;
  sortOrder1: number;
  sortOrder2: number;
  wins: number;
  losses: number;
  ties: number;
  qualAverage: number;
  dq: number;
  matchesPlayed: number;
}

export interface RankingListing {
  rankings: Ranking[];
}

// ---- Awards ----

export interface Award {
  awardId: number;
  teamNumber: number | null;
  eventCode: string;
  name: string;
  series: number;
  personName: string | null;
}

export interface AwardListing {
  awards: Award[];
}
