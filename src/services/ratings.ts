/**
 * Computes a TrueSkill leaderboard from the matches of a set of events.
 *
 * Global FTC rankings would require every event's matches (impractical to pull
 * on-device), so callers pass a bounded, meaningful set of event codes — e.g.
 * the events your favorited teams attend. The engine itself is scope-agnostic.
 */
import { ftcApi } from '../api/client';
import {
  defaultRating,
  rate,
  conservativeScore,
  type Rating,
} from '../trueskill/trueskill';
import type { FtcMatch } from '../types/ftc';

export interface TeamRating {
  teamNumber: number;
  name: string;
  rating: Rating;
  score: number; // μ − 3σ
  wins: number;
  losses: number;
  ties: number;
}

interface TimedMatch {
  match: FtcMatch;
  time: number;
}

function matchTime(m: FtcMatch): number {
  const raw = m.postResultTime || m.actualStartTime;
  const t = raw ? new Date(raw).getTime() : NaN;
  return Number.isNaN(t) ? m.matchNumber : t;
}

/**
 * @param eventCodes bounded set of events to include
 * @param onProgress optional callback (done, total) for UI feedback
 */
export async function computeLeaderboard(
  eventCodes: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<TeamRating[]> {
  const names = new Map<number, string>();
  const timed: TimedMatch[] = [];

  let done = 0;
  for (const code of eventCodes) {
    try {
      const [matchRes, teamRes] = await Promise.all([
        ftcApi.getMatches(code),
        ftcApi.getTeams({ eventCode: code }),
      ]);
      for (const t of teamRes.teams) names.set(t.teamNumber, t.nameShort);
      for (const m of matchRes.matches) {
        if (m.scoreRedFinal != null && m.scoreBlueFinal != null) {
          timed.push({ match: m, time: matchTime(m) });
        }
      }
    } catch {
      // Skip events that fail to load; keep computing the rest.
    }
    done += 1;
    onProgress?.(done, eventCodes.length);
  }

  timed.sort((a, b) => a.time - b.time);

  const ratings = new Map<number, Rating>();
  const record = new Map<number, { w: number; l: number; t: number }>();
  const get = (team: number): Rating => ratings.get(team) ?? defaultRating();
  const rec = (team: number) =>
    record.get(team) ?? { w: 0, l: 0, t: 0 };

  for (const { match } of timed) {
    const red = match.teams
      .filter((t) => t.station?.startsWith('Red'))
      .map((t) => t.teamNumber);
    const blue = match.teams
      .filter((t) => t.station?.startsWith('Blue'))
      .map((t) => t.teamNumber);
    if (red.length === 0 || blue.length === 0) continue;

    const rScore = match.scoreRedFinal ?? 0;
    const bScore = match.scoreBlueFinal ?? 0;
    const result: 1 | -1 | 0 = rScore > bScore ? 1 : bScore > rScore ? -1 : 0;

    const updated = rate({
      allianceA: red.map(get),
      allianceB: blue.map(get),
      result,
    });

    red.forEach((team, i) => ratings.set(team, updated.allianceA[i]));
    blue.forEach((team, i) => ratings.set(team, updated.allianceB[i]));

    // Win/loss/tie bookkeeping.
    const bump = (teams: number[], key: 'w' | 'l' | 't') =>
      teams.forEach((team) => {
        const r = rec(team);
        r[key] += 1;
        record.set(team, r);
      });
    if (result === 1) {
      bump(red, 'w');
      bump(blue, 'l');
    } else if (result === -1) {
      bump(blue, 'w');
      bump(red, 'l');
    } else {
      bump([...red, ...blue], 't');
    }
  }

  const rows: TeamRating[] = [];
  for (const [teamNumber, rating] of ratings) {
    const r = rec(teamNumber);
    rows.push({
      teamNumber,
      name: names.get(teamNumber) ?? `Team ${teamNumber}`,
      rating,
      score: conservativeScore(rating),
      wins: r.w,
      losses: r.l,
      ties: r.t,
    });
  }
  rows.sort((a, b) => b.score - a.score);
  return rows;
}
