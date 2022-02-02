/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/prefer-namespace-keyword */

declare module globalThis {
  var testRequest: import('supertest').SuperTest<import('supertest').Test>;
}
