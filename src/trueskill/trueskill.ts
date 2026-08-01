/**
 * TrueSkill (Herbrich et al.) Bayesian rating for FTC 2v2 alliance matches.
 *
 * Each team holds a Gaussian skill N(μ, σ²). After a match the four teams'
 * ratings are updated toward the observed result. The conservative display
 * score is μ − 3σ (≈ the skill we're 99% sure the team exceeds).
 *
 * This implements the standard two-team factor-graph update in closed form
 * (teams' skills sum), with both win/loss and draw corrections.
 */
import { pdf, cdf, invCdf } from './gaussian';

export interface Rating {
  mu: number;
  sigma: number;
}

export const DEFAULTS = {
  mu: 25,
  sigma: 25 / 3,
  beta: 25 / 6, // skill-class width
  tau: 25 / 300, // dynamics (per-match σ inflation)
  drawProbability: 0.1,
};

export function defaultRating(): Rating {
  return { mu: DEFAULTS.mu, sigma: DEFAULTS.sigma };
}

/** Conservative skill estimate μ − 3σ. */
export function conservativeScore(r: Rating): number {
  return r.mu - 3 * r.sigma;
}

// ---- Truncated-Gaussian correction functions ----

function vWin(t: number, e: number): number {
  const denom = cdf(t - e);
  if (denom < 1e-12) return e - t; // numerical guard
  return pdf(t - e) / denom;
}

function wWin(t: number, e: number): number {
  const v = vWin(t, e);
  return v * (v + (t - e));
}

function vDraw(t: number, e: number): number {
  const c = cdf(e - t) - cdf(-e - t);
  if (Math.abs(c) < 1e-12) return t < 0 ? -t - e : -t + e;
  const num = pdf(-e - t) - pdf(e - t);
  return (t < 0 ? -num : num) / c;
}

function wDraw(t: number, e: number): number {
  const c = cdf(e - t) - cdf(-e - t);
  if (Math.abs(c) < 1e-12) return 1;
  const v = vDraw(t, e);
  return (
    v * v +
    ((e - t) * pdf(e - t) - (-e - t) * pdf(-e - t)) / c
  );
}

function drawMargin(drawProbability: number, beta: number, totalPlayers: number): number {
  return invCdf(0.5 * (drawProbability + 1)) * Math.sqrt(totalPlayers) * beta;
}

export interface MatchOutcome {
  /** Ratings of the two teams on alliance A. */
  allianceA: Rating[];
  /** Ratings of the two teams on alliance B. */
  allianceB: Rating[];
  /** 1 = A wins, -1 = B wins, 0 = draw. */
  result: 1 | -1 | 0;
}

/**
 * Returns updated ratings for both alliances, in the same order as input.
 */
export function rate(
  outcome: MatchOutcome,
  opts: typeof DEFAULTS = DEFAULTS,
): { allianceA: Rating[]; allianceB: Rating[] } {
  const { beta, tau, drawProbability } = opts;

  // Winner is the alliance listed first in the (winner, loser) framing.
  const draw = outcome.result === 0;
  const [winners, losers] =
    outcome.result >= 0
      ? [outcome.allianceA, outcome.allianceB]
      : [outcome.allianceB, outcome.allianceA];

  const all = [...winners, ...losers];
  const totalPlayers = all.length;

  // Inflate σ² by dynamics factor before the update.
  const sig2 = (r: Rating) => r.sigma * r.sigma + tau * tau;

  const c = Math.sqrt(
    totalPlayers * beta * beta + all.reduce((s, r) => s + sig2(r), 0),
  );

  const muWin = winners.reduce((s, r) => s + r.mu, 0);
  const muLose = losers.reduce((s, r) => s + r.mu, 0);
  const meanDelta = muWin - muLose;

  const e = drawMargin(drawProbability, beta, totalPlayers) / c;
  const t = meanDelta / c;

  const v = draw ? vDraw(t, e) : vWin(t, e);
  const w = draw ? wDraw(t, e) : wWin(t, e);

  const update = (r: Rating, sign: 1 | -1): Rating => {
    const s2 = sig2(r);
    const meanMultiplier = s2 / c;
    const varMultiplier = s2 / (c * c);
    const newMu = r.mu + sign * meanMultiplier * v;
    const newSigma = Math.sqrt(s2 * Math.max(1e-6, 1 - w * varMultiplier));
    return { mu: newMu, sigma: newSigma };
  };

  const newWinners = winners.map((r) => update(r, 1));
  const newLosers = losers.map((r) => update(r, -1));

  // Map back to the original A/B ordering.
  return outcome.result >= 0
    ? { allianceA: newWinners, allianceB: newLosers }
    : { allianceA: newLosers, allianceB: newWinners };
}
