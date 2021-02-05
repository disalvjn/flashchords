import { diatonicMajorRootTriads } from './triads/diatonic-major-root-triads';
import { diatonicMinorRootTriads } from './triads/diatonic-minor-root-triads';
import { singlets } from './singlets';

const chordEntities = diatonicMajorRootTriads.concat(diatonicMinorRootTriads).concat(singlets);

export { chordEntities }