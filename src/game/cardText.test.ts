import { cardTextLines } from './cardText';
test.each(['RECTÁNGULO', 'TRIÁNGULO', 'RECTANGLE', 'GOLONDRINA', 'FÉVRIER', 'LENGÜETA', 'TRIANGLE'])('%s stays a single unmodified fitted line', label => { expect(cardTextLines(label)).toEqual([label]); });
test.each(['MUSICAL INSTRUMENTS', 'INSTRUMENTS DE MUSIQUE', 'INSTRUMENTOS MUSICALES'])('%s splits only at word boundaries into two lines', label => { const lines = cardTextLines(label); expect(lines).toHaveLength(2); expect(lines.join(' ')).toBe(label); });
