import { diatonicMajorTriads } from './triads/diatonic-major-triads';
import { diatonicMinorTriads } from './triads/diatonic-minor-triads';
import { singlets } from './singlets';

const chordEntities = diatonicMajorTriads.concat(diatonicMinorTriads).concat(singlets);

export { chordEntities }