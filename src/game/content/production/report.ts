import { releaseDifficultyProfile } from '../difficulty';
import { approvalCurrent, locales, statuses, type ProductionPuzzle, type ReleasedRevision } from './schema';
import { releaseCheck, validateProduction, validateProductionPuzzle } from './validate';
import { releasePuzzles } from './release';
const escape = (value: unknown) => String(value ?? '').replace(/[|<>`*_\[\]#]/g, c => `&#${c.charCodeAt(0)};`).replace(/\r?\n/g, '<br>');
function positionRanges(positions: number[]): string {
  const ranges: string[] = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i];
    while (i + 1 < positions.length && positions[i + 1] === positions[i] + 1) i++;
    ranges.push(start === positions[i] ? String(start) : `${start}–${positions[i]}`);
  }
  return ranges.join(', ') || 'none';
}
export function productionSummary(input: unknown, released: readonly ReleasedRevision[] = []) {
  const records = (Array.isArray(input) ? input : []).filter(p => p && typeof p === 'object') as ProductionPuzzle[];
  const approved = releasePuzzles(input, released);
  const missing = (locale: string, source: ProductionPuzzle[]) => Array.from({ length: 100 }, (_, i) => i + 1).filter(position => !source.some(p => p.locale === locale && p.position === position));
  const concepts = [...new Set(records.map(p => p.concept?.id).filter(Boolean))];
  const errors = validateProduction(input, released); const releaseErrors = releaseCheck(input, released);
  return {
    total: Array.isArray(input) ? input.length : 0,
    locales: Object.fromEntries(locales.map(locale => [locale, {
      total: records.filter(p => p.locale === locale).length,
      approved: approved.filter(p => p.locale === locale).length,
      missingPositions: missing(locale, records), missingApprovedPositions: missing(locale, approved),
    }])),
    statuses: Object.fromEntries(statuses.map(status => [status, records.filter(p => p.status === status).length])),
    difficultyProfile: releaseDifficultyProfile.map(band => ({ ...band, levelsPerLocale: band.last - band.first + 1 })),
    difficulties: Object.fromEntries([1, 2, 3, 4, 5].map(difficulty => [difficulty, records.filter(p => p.difficulty === difficulty).length])),
    equivalenceCoverage: concepts.map(concept => ({ concept, locales: locales.filter(locale => records.some(p => p.concept?.id === concept && p.locale === locale)), missingLocales: locales.filter(locale => !records.some(p => p.concept?.id === concept && p.locale === locale)), relationships: records.filter(p => p.concept?.id === concept).map(p => ({ puzzleId: p.levelId, relationship: p.concept.relationship, source: p.concept.source ?? null })) })),
    structuralErrors: errors, releaseErrors, approvedPlayable: approved.length,
    releaseReady: releaseErrors.length === 0,
  };
}
export function editorialReport(input: unknown, released: readonly ReleasedRevision[] = []): string {
  const summary = productionSummary(input, released);
  const lines = ['# Production puzzle editorial report', '', '> Structural checks do not prove semantic uniqueness. Human editorial review is required.', '', `TOTAL PUZZLES: ${summary.total}`, `Approved playable: ${summary.approvedPlayable}`, `Approved-release readiness: ${summary.releaseReady ? 'READY' : 'NOT READY'}`, '', '## Locale coverage', '', '| Locale | Present | Approved | Missing positions |', '| --- | ---: | ---: | --- |'];
  for (const locale of locales) { const s = summary.locales[locale]; lines.push(`| ${locale.toUpperCase()} | ${s.total} | ${s.approved} | ${positionRanges(s.missingPositions)} |`); }
  lines.push('', '## Release difficulty profile (per locale)', '', ...summary.difficultyProfile.map(band => `- Positions ${band.first}–${band.last}: difficulty ${band.difficulty} (${band.levelsPerLocale} levels)`));
  lines.push('', '## Counts by status', '', ...Object.entries(summary.statuses).map(([s, n]) => `- ${s}: ${n}`), '', '## Counts by difficulty', '', ...Object.entries(summary.difficulties).map(([d, n]) => `- Difficulty ${d}: ${n}`), '', '## Structural errors', '', ...(summary.structuralErrors.length ? summary.structuralErrors.map(i => `- ${escape(i.path)}: ${escape(i.message)}`) : ['None.']), '', '## Equivalence coverage', '');
  for (const c of summary.equivalenceCoverage) lines.push(`- ${escape(c.concept)}: ${c.locales.join(', ')}; missing: ${c.missingLocales.join(', ') || 'none'}. ${c.relationships.map(r => `${escape(r.puzzleId)} (${r.relationship}${r.source ? ` → ${escape(r.source.puzzleId)} revision ${r.source.revision}` : ''})`).join('; ')}`);
  lines.push('', '## Release blockers', '', ...locales.map(locale => `- ${locale.toUpperCase()}: missing approved positions ${positionRanges(summary.locales[locale].missingApprovedPositions)}`), '', 'See the JSON report for the complete machine-readable error list.', '', '## Individual puzzles', '');
  for (const p of (Array.isArray(input) ? input : [])) {
    if (!p || typeof p !== 'object') { lines.push('Malformed record (see structural errors).', ''); continue; }
    lines.push(`### ${escape(p.levelId)}`, '', `Locale: ${escape(p.locale)} · Position: ${escape(p.position)} · Difficulty: ${escape(p.difficulty)} · Revision: ${escape(p.revision)}`, '', `Status: **${escape(p.status)}** · Approval: ${validateProductionPuzzle(p).length ? 'invalid' : approvalCurrent(p) ? 'current' : 'not current'}`, '', `Review: ${escape(p.review?.reviewedBy || 'none')} · ${escape(p.review?.reviewedAt || 'not reviewed')} · Approved revision: ${escape(p.review?.approvedRevision ?? 'none')}`, '', `Concept: ${escape(p.concept?.id)} · ${escape(p.concept?.relationship)} · Source: ${escape(p.concept?.source?.puzzleId ?? 'none')} revision ${escape(p.concept?.source?.revision ?? '—')}`, '', 'Visible cards:', '', '| 1 | 2 | 3 | 4 |', '| --- | --- | --- | --- |');
    const cards: { id: string; text: string }[] = Array.isArray(p.cards) ? p.cards.filter((c: unknown) => c && typeof c === 'object') : [];
    for (let row = 0; row < cards.length; row += 4) lines.push(`| ${cards.slice(row, row + 4).map(c => escape(c.text)).join(' | ')} |`);
    const label = (id: string) => cards.find(c => c.id === id)?.text ?? `[unknown: ${id}]`;
    lines.push('', 'Intended groups:', '');
    for (const g of (Array.isArray(p.groups) ? p.groups : [])) {
      if (!g || typeof g !== 'object') continue;
      lines.push(`- **${escape(g.label)}**: ${(Array.isArray(g.cardIds) ? g.cardIds : []).map((id: string) => escape(label(id))).join(' · ')}`, `  - Intended reason: ${escape(g.intendedReason)}`, `  - Explanation: ${escape(g.explanation)}`);
    }
    if (p.editorialNotes) lines.push('', `Editorial notes: ${escape(p.editorialNotes)}`);
    if (p.provenance) lines.push('', `Source: ${escape(p.provenance.sourceFile)} · Candidate: ${escape(p.provenance.sourceCandidate)}`);
    lines.push('', `Rationale: ${escape(p.rationale)}`, '', `Intended reason: ${escape(p.intendedReason)}`, '', `Known decoys: ${Array.isArray(p.knownDecoys) && p.knownDecoys.length ? p.knownDecoys.map(escape).join('; ') : 'none listed'}`, '', `Ambiguity notes: ${escape(p.ambiguityNotes)}`, '', 'Hints:', '');
    for (const h of (Array.isArray(p.hints) ? p.hints : [])) if (h && typeof h === 'object') lines.push(`- ${escape(h.kind)} / ${escape(h.groupId)}: ${h.kind === 'pair' && Array.isArray(h.cardIds) ? h.cardIds.map((id: string) => escape(label(id))).join(' + ') : escape(h.text)}`);
    if (p.rejectionReason) lines.push('', `Rejection reason: ${escape(p.rejectionReason)}`);
    lines.push('');
  }
  return lines.join('\n') + '\n';
}
