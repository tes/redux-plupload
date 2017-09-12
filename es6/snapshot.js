function snapshotObject(obj, origRef, context) {
  let ref = origRef;
  let changed = false;
  if (typeof ref !== 'object') {
    changed = true;
    ref = {};
  }

  const { snapshotHelper } = context;
  const keys = Object.keys(obj);
  const clone = {};
  let foundRefKeys = 0;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.lastIndexOf('_', 0) === 0 || key.lastIndexOf('Symbol(', 0) === 0) continue;
    if (ref.hasOwnProperty(key)) foundRefKeys++;

    const referenceStateForKey = ref[key];
    let clonedStateForKey;
    // In some cases,
    // properties listed in `Object.keys` may actually throw Errors on read
    try {
      clonedStateForKey = snapshotHelper(obj[key], referenceStateForKey, context);
    // eslint-disable-next-line no-empty
    } catch (e) { }
    clone[key] = clonedStateForKey;
    changed = changed || clonedStateForKey !== referenceStateForKey;
  }
  changed = changed || !(keys.length === foundRefKeys && Object.keys(ref).length === foundRefKeys);
  return changed ? clone : ref;
}

function snapshotArray(arr, origRef, context) {
  let ref = origRef;
  let changed = false;
  if (!Array.isArray(ref)) {
    changed = true;
    ref = [];
  }

  const { snapshotHelper } = context;
  const clone = [];
  for (let i = 0; i < arr.length; i++) {
    const referenceStateForIndex = ref[i];
    const clonedStateForIndex = snapshotHelper(arr[i], referenceStateForIndex, context);
    clone[i] = clonedStateForIndex;
    changed = changed || clonedStateForIndex !== referenceStateForIndex;
  }
  changed = changed || arr.length !== ref.length;
  return changed ? clone : ref;
}

function stackSnapshotHelper(obj, ref, context) {
  if (obj === null) return obj;

  const type = typeof obj;
  if (type !== 'object' && type !== 'function') {
    return obj;
  }
  const { stack } = context;

  if (stack.length > 2000) return undefined;
  if (stack.indexOf(obj) !== -1) return undefined;

  const snapper = (Array.isArray(obj)) ? snapshotArray : snapshotObject;
  stack.push(obj);
  const snap = snapper(obj, ref, context);
  stack.pop();
  return snap;
}

function mapSnapshotHelper(obj, origRef, context) {
  if (obj === null) return obj;

  const type = typeof obj;
  if (type !== 'object' && type !== 'function') {
    return obj;
  }
  const { map } = context;

  const mapRef = map.get(obj);
  let ref = origRef;
  if (mapRef) ref = mapRef;
  const snap = stackSnapshotHelper(obj, ref, context);
  map.set(obj, snap);
  return snap;
}

export default function snapshot(obj, ref) {
  return stackSnapshotHelper(obj, ref, { stack: [], snapshotHelper: stackSnapshotHelper });
}

export function makeSnapshotFunction() {
  const map = new WeakMap();
  return (obj, ref) =>
    mapSnapshotHelper(obj, ref, { map, stack: [], snapshotHelper: mapSnapshotHelper });
}
