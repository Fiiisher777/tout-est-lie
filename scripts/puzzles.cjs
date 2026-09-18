#!/usr/bin/env node
// Compile the shared pure TypeScript validator in memory, using the project's
// existing TypeScript dependency. No separate implementation or CLI dependency.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
};
const { validateProduction, releaseCheck, approvePuzzle, importDrafts } = require('../src/game/content/production/validate.ts');
const { approvalContent } = require('../src/game/content/production/schema.ts');
const { editorialReport, productionSummary } = require('../src/game/content/production/report.ts');
const root = path.resolve(__dirname, '..');
const contentFile = path.join(root, 'content/production/puzzles.json');
const baselineFile = path.join(root, 'content/production/released.json');
const [command, ...args] = process.argv.slice(2);
const printIssues = issues => issues.forEach(i => console.error(`${i.path}: ${i.message}`));
try {
  const input = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
  const released = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  if (command === 'validate' || command === 'release-check') {
    const issues = command === 'validate' ? validateProduction(input, released) : releaseCheck(input, released);
    printIssues(issues);
    const summary = productionSummary(input, released);
    console.log(`${command}: ${issues.length} errors; ${summary.total} records; ${summary.approvedPlayable} approved playable. ${summary.releaseReady ? 'RELEASE READY' : 'NOT RELEASE READY'}`);
    if (issues.length) process.exitCode = 1;
  } else if (command === 'report') {
    const directory = path.join(root, 'docs/editorial');
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'report.md'), editorialReport(input, released));
    fs.writeFileSync(path.join(directory, 'report.json'), JSON.stringify(productionSummary(input, released), null, 2) + '\n');
    console.log('Generated docs/editorial/report.md and report.json (reporting does not approve content).');
  } else if (command === 'approve') {
    const [puzzleId, reviewerFlag, reviewer] = args;
    if (reviewerFlag !== '--reviewer' || !reviewer?.trim() || args.length !== 3) throw new Error('Usage: npm run puzzles:approve -- PUZZLE_ID --reviewer "Reviewer name"');
    const issues = validateProduction(input, released);
    if (issues.length) { printIssues(issues); throw new Error('Resolve validation errors first'); }
    const index = input.findIndex(p => p.levelId === puzzleId);
    if (index < 0) throw new Error('Puzzle ID not found');
    input[index] = approvePuzzle(input[index], reviewer, new Date().toISOString());
    fs.writeFileSync(contentFile, JSON.stringify(input, null, 2) + '\n');
    console.log(`Explicit approval recorded for ${puzzleId} revision ${input[index].revision}. Commit this review with the content.`);
  } else if (command === 'record-release') {
    const issues = releaseCheck(input, released);
    if (issues.length) { printIssues(issues); throw new Error('Cannot record an incomplete or unapproved release'); }
    fs.writeFileSync(baselineFile, JSON.stringify(input.map(p => ({ puzzleId: p.levelId, revision: p.revision, content: approvalContent(p) })), null, 2) + '\n');
    console.log('Recorded the approved release baseline. Commit it with this release; future edits require a new revision.');
  } else if (command === 'import') {
    if (args.length !== 1) throw new Error('Usage: npm run puzzles:import -- path/to/batch.json');
    const batch = JSON.parse(fs.readFileSync(path.resolve(args[0]), 'utf8'));
    const combined = importDrafts(input, batch, released);
    fs.writeFileSync(contentFile, JSON.stringify(combined, null, 2) + '\n');
    console.log(`Imported ${batch.length} drafts. External approval claims were removed.`);
  } else throw new Error('Expected validate, report, release-check, approve, import or record-release');
} catch (error) { console.error(error.message); process.exitCode = 1; }
