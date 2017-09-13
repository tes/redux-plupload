import expect from 'expect.js';

import snapshot, { makeSnapshotFunction } from '../es6/snapshot';

function defineSnapshotTests(c) {
  it('works on scalars', () => {
    expect(c.snap(undefined)).to.be(undefined);
    expect(c.snap(null)).to.be(null);
    expect(c.snap(true)).to.be(true);
    expect(c.snap(false)).to.be(false);
    expect(c.snap(1)).to.be(1);
    expect(c.snap('hi')).to.be('hi');
  });

  it('"fails" on regex and date', () => {
    expect(c.snap(/foo/)).to.eql({});
    expect(c.snap(new Date())).to.eql({});
  });

  it('works on objects', () => {
    expect(c.snap({})).to.eql({});
    expect(c.snap({ a: 1 })).to.eql({ a: 1 });
    expect(c.snap({ b: 7, c: 9 })).to.eql({ b: 7, c: 9 });
  });

  it('ignores "_.*" and "Symbol(.*" props', () => {
    expect(c.snap({ _: 1 })).to.eql({});
    expect(c.snap({ 'Symbol(baz': 1 })).to.eql({});
    expect(c.snap({ a_: 1, _foo: 2 })).to.eql({ a_: 1 });
    expect(c.snap({ a_: 1, 'Symbol(foobar': 2 })).to.eql({ a_: 1 });
    expect(c.snap({ a_: 1, b_c: 2, 'aSymbol(': 3 })).to.eql({ a_: 1, b_c: 2, 'aSymbol(': 3 });
  });

  it('works on arrays', () => {
    expect(c.snap([])).to.eql([]);
    expect(c.snap([1])).to.eql([1]);
    expect(c.snap([5, 4, 6])).to.eql([5, 4, 6]);
  });

  it('works on mixed', () => {
    expect(c.snap([{}])).to.eql([{}]);
    expect(c.snap([[2]])).to.eql([[2]]);
    expect(c.snap({ a: [1] })).to.eql({ a: [1] });
    expect(c.snap({ a: 5, b: { c: [4] }, d: [6] })).to.eql({ a: 5, b: { c: [4] }, d: [6] });
  });

  it('reuses object references', () => {
    const ref1 = {};
    const obj1 = {};
    expect(obj1).to.not.be(ref1);
    expect(c.snap(obj1, ref1)).to.be(ref1);
    const ref2 = { a: 1 };
    const obj2 = { a: 1 };
    expect(obj2).to.not.be(ref2);
    expect(c.snap(obj2, ref2)).to.be(ref2);
    const ref3 = { b: 7, c: { d: 5 } };
    const obj3 = { b: 7, c: { d: 5 } };
    expect(obj3).to.not.be(ref3);
    expect(c.snap(obj3, ref3)).to.be(ref3);
    const ref4 = { b: 7, e: 5, c: { d: 5 } };
    const obj4 = { b: 6, c: { d: 5 } };
    expect(obj4).to.not.be(ref4);
    const snap4 = c.snap(obj4, ref4);
    expect(snap4).to.not.be(obj4);
    expect(snap4).to.eql(obj4);
    expect(snap4).to.not.eql(ref4);
    expect(snap4.c).to.be(ref4.c);
  });

  it('reuses array references', () => {
    const ref1 = [];
    const arr1 = [];
    expect(arr1).to.not.be(ref1);
    expect(c.snap(arr1, ref1)).to.be(ref1);
    const ref2 = [1];
    const arr2 = [1];
    expect(arr2).to.not.be(ref2);
    expect(c.snap(arr2, ref2)).to.be(ref2);
    const ref3 = [5, 4, 6];
    const arr3 = [5, 4, 6];
    expect(arr3).to.not.be(ref3);
    expect(c.snap(arr3, ref3)).to.be(ref3);
    const ref4 = [5, [4], 6];
    const arr4 = [5, [4], 6, 7];
    expect(arr4).to.not.be(ref4);
    const snap4 = c.snap(arr4, ref4);
    expect(snap4).to.not.be(arr4);
    expect(snap4).to.eql(arr4);
    expect(snap4).to.not.eql(ref4);
    expect(snap4[1]).to.be(ref4[1]);
  });

  it('reuses mixed references', () => {
    const ref1 = { a: 1, b: [2] };
    const obj1 = { a: 1, b: [2] };
    expect(obj1).to.not.be(ref1);
    expect(c.snap(obj1, ref1)).to.be(ref1);
    const ref2 = [{ a: 1 }, 2];
    const obj2 = [{ a: 1 }, 2];
    expect(obj2).to.not.be(ref2);
    expect(c.snap(obj2, ref2)).to.be(ref2);
    const ref3 = { b: 7, c: [{ d: 5 }, { d: 7 }] };
    const obj3 = { b: 7, c: [{ d: 5 }, { d: 7 }, { d: 8 }] };
    expect(obj3).to.not.be(ref3);
    const snap3 = c.snap(obj3, ref3);
    expect(snap3).to.not.be(obj3);
    expect(snap3).to.not.eql(ref3);
    expect(snap3.c).to.not.be(obj3.c);
    expect(snap3.c).to.not.eql(ref3.c);
    expect(snap3.c[0]).to.be(ref3.c[0]);
    expect(snap3.c[1]).to.be(ref3.c[1]);
    const ref4 = [{ b: 7, e: 5, c: [5] }, { a: { b: 5 } }];
    const obj4 = [{ b: 6, c: [5] }, { a: { b: 5 } }];
    expect(obj4).to.not.be(ref4);
    const snap4 = c.snap(obj4, ref4);
    expect(snap4).to.not.be(obj4);
    expect(snap4).to.eql(obj4);
    expect(snap4).to.not.eql(ref4);
    expect(snap4[1]).to.be(ref4[1]);
    expect(snap4[0].c).to.be(ref4[0].c);
  });

  it('counts undefined prop as used', () => {
    const snap1 = c.snap({ a: undefined, b: 1 });
    expect(snap1.hasOwnProperty('a')).to.be(true);
    expect(snap1.b).to.be(1);
    const snap2 = c.snap({ b: 1 }, snap1);
    expect(snap2).to.not.be(snap1);
    const snap3 = c.snap({ a: undefined, b: 1 }, snap1);
    expect(snap3).to.be(snap1);
  });

  it('breaks circular structures', () => {
    const obj1 = {};
    obj1.a = obj1;
    expect(c.snap(obj1)).to.eql({ a: undefined });
    const arr1 = [];
    arr1.push(arr1);
    expect(c.snap(arr1)).to.eql([undefined]);
    const obj2 = { b: [{}] };
    obj2.b[0].parent = obj2;
    expect(c.snap(obj2)).to.eql({ b: [{ parent: undefined }] });
  });

  it('handles properties throwing Errors on read', () => {
    const obj = {
      get a() {
        throw Error();
      },
    };
    expect(c.snap(obj)).to.eql({ a: undefined });
  });
}

describe('snapshot', () => {
  defineSnapshotTests({ snap: snapshot });

  it('makeSnapshotFunction returns a function', () => {
    expect(makeSnapshotFunction()).to.be.a('function');
  });

  describe('makeSnapshotFunction', () => {
    const context = {};
    let snap = undefined;
    beforeEach(() => {
      context.snap = snap = makeSnapshotFunction();
    });

    defineSnapshotTests(context);

    it('remembers object refs', () => {
      const obj1 = { a: 1 };
      const snap1 = snap(obj1);
      const snap2 = snap(obj1);
      expect(snap2).to.be(snap1);
    });

    it('remembers array refs', () => {
      const arr1 = [2];
      const snap1 = snap(arr1);
      const snap2 = snap(arr1);
      expect(snap2).to.be(snap1);
    });

    it('prefers mapped refs', () => {
      const obj1 = { a: 1 };
      const ref1 = { a: 1 };
      const snap1 = snap(obj1);
      const snap2 = snap(obj1, ref1);
      expect(snap1).to.not.be(ref1);
      expect(snap2).to.be(snap1);
      const arr1 = [2];
      const ref2 = [2];
      const snap3 = snap(arr1);
      const snap4 = snap(arr1, ref2);
      expect(snap3).to.not.be(ref2);
      expect(snap4).to.be(snap3);
    });

    it('remembers nested refs', () => {
      const obj1 = { a: 1 };
      const arr1 = [obj1];
      const snap1 = snap(obj1);
      const snap2 = snap(arr1);
      expect(snap2[0]).to.be(snap1);
      const obj2 = { b: obj1, c: arr1 };
      const snap3 = snap(obj2);
      expect(snap3.b).to.be(snap1);
      expect(snap3.c).to.be(snap2);
    });

    it('cycles break trying to use mapped refs', () => {
      const obj1 = {};
      const arr1 = [obj1];
      obj1.a = arr1;
      const snap1 = snap(obj1);
      const snap2 = snap(arr1);
      const snap3 = snap(obj1);
      const snap4 = snap(arr1);
      expect(snap3).to.not.be(snap1);
      expect(snap4).to.not.be(snap2);
    });
  });
});
