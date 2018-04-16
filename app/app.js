"use strict";

import foo from './foo';
import magic from 'magic-string';
import { Bundle } from 'magic-string';
import diff from 'arr-diff';

console.log(foo, magic, Bundle, diff([1,2,3], [3,4,5]));
