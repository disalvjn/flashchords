import { diatonicMajorRootTriads } from './triads/diatonic-major-root-triads';
import { diatonicMinorRootTriads } from './triads/diatonic-minor-root-triads';

const chordEntities = diatonicMajorRootTriads.concat(diatonicMinorRootTriads);

export { chordEntities }