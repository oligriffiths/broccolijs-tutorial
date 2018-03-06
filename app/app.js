'use strict';

import foo from './foo';
import bar from './foo';
import BlankObject from 'blank-object';
import diff from 'arr-diff';

const blank = new BlankObject();

console.log(foo, blank, diff([1,2,3], [3,4,5]));