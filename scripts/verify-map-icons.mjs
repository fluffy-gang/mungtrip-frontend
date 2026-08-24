import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const constants = fs.readFileSync(path.join(root, 'src/features/home/constants.ts'), 'utf8');
const marker = fs.readFileSync(path.join(root, 'src/features/home/components/place-marker.tsx'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'src/features/home/styles/map.ts'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'src/features/home/fixtures/map-marker-fixture.json'), 'utf8'));

const categories = ['RESTAURANT', 'CAFE', 'ATTRACTION', 'ACCOMMODATION', 'HOSPITAL', 'ACTIVITY', 'GROOMING', 'CARE', 'SHOPPING', 'TRAINING', 'FACILITY'];
for (const category of categories) assert.match(constants, new RegExp(`${category}:`), `${category} metadata is missing`);
assert.match(constants, /hasOwnProperty\.call/, 'category lookup must be prototype-safe');
assert.doesNotMatch(marker, /useState|useEffect|\bonReady\b/);
assert.match(styles, /height: 32/);
assert.match(styles, /shadowRadius: 6/);
assert.equal(fixture.places.length, 13);
assert.equal(new Set(fixture.places.filter((place) => categories.includes(place.category)).map((place) => place.category)).size, 11);
assert.equal(fixture.places.filter((place) => place.latitude === 33.5011 && place.longitude === 126.5311).length, 2);
assert.ok(fixture.places.find((place) => place.category === '__proto__'));
assert.equal(fixture.states.length, 4);
for (const file of [...categories.map((category) => category.toLowerCase()), 'hospital']) {
  assert.ok(fs.existsSync(path.join(root, 'src/features/home/assets/map-icons', `${file}.webp`)) || fs.existsSync(path.join(root, 'src/features/home/assets/map-icons', `${file}.svg`)), `${file} asset is missing`);
}

// Execute the real TSX component with lightweight existing-module stubs. This keeps
// the parity check runnable without adding a test framework or mounting native Naver.
let imageState = null;
let imageLoadCount = 0;
const React = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children: children.length === 1 ? children[0] : children } }),
  useState: (initial) => [initial, () => {}],
  useEffect: (effect) => effect(),
};
const componentStubs = {
  'expo-image': { Image: 'Image', useImage: () => { imageLoadCount += 1; return imageState; } },
  'expo-symbols': { SymbolView: 'SymbolView' },
  'react-native': { View: 'View' },
  '@/features/places/types': {},
};
const moduleCache = new Map();
function loadModule(file) {
  const absolute = path.resolve(file);
  if (moduleCache.has(absolute)) return moduleCache.get(absolute).exports;
  const source = fs.readFileSync(absolute, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  moduleCache.set(absolute, module);
  const localRequire = (request) => {
    if (request === 'react') return React;
    if (componentStubs[request]) return componentStubs[request];
    if (request.startsWith('./assets/')) return request;
    if (request.startsWith('@/')) return {};
    const resolved = request.startsWith('.') ? path.resolve(path.dirname(absolute), request) : request;
    if (resolved.endsWith('/constants')) return loadModule(`${resolved}.ts`);
    if (resolved.endsWith('/styles')) return { styles: loadModule(`${resolved}/map.ts`).mapStyles };
    if (resolved.endsWith('/style-primitives')) return { colors: { surface: '#FFFFFF', primary: '#FE6A20' }, radius: { full: 333 }, borderWidth: { 2: 2 }, spacing: { 16: 16 }, text: () => ({}) };
    return require(resolved);
  };
  vm.runInNewContext(output, { require: localRequire, exports: module.exports, module, console, React });
  return module.exports;
}
const { getPlaceCategoryMeta } = loadModule(path.join(root, 'src/features/home/constants.ts'));
assert.equal(getPlaceCategoryMeta('UNKNOWN_CATEGORY'), getPlaceCategoryMeta('DEFAULT'));
assert.equal(getPlaceCategoryMeta('__proto__'), getPlaceCategoryMeta('DEFAULT'));
const { PlaceMarker } = loadModule(path.join(root, 'src/features/home/components/place-marker.tsx'));
const place = { ...fixture.places[0], tags: [], tagCodes: [], isOfficial: false, isLiked: false };
const toPlace = (fixturePlace) => ({ ...fixturePlace, tags: [], tagCodes: [], isOfficial: false, isLiked: false });
function renderMarker(overrides = {}) {
  const tapped = [];
  const onSelect = (value) => tapped.push(value);
  const loader = PlaceMarker({ MarkerOverlay: 'MarkerOverlay', onSelect, place, ...overrides });
  const overlay = resolveElement(loader);
  const bubble = overlay.props.children;
  const iconElement = bubble.props.children;
  const child = resolveElement(iconElement);
  return { loader, overlay, bubble, child, tapped, onSelect };
}
function flattenStyle(style) {
  return Object.assign({}, ...style.filter(Boolean));
}
function resolveElement(element) {
  let current = element;
  while (typeof current.type === 'function') current = current.type(current.props);
  return current;
}
const pending = renderMarker();
const pendingStyle = flattenStyle(pending.bubble.props.style);
assert.equal(pending.child.type, 'SymbolView');
assert.match(pending.bubble.props.key, /RESTAURANT-fallback-default/);
assert.equal(pending.overlay.props.caption.color, '#333D4B');
assert.equal(pending.overlay.props.caption.haloColor, '#FFFFFF');
assert.equal(pending.overlay.props.caption.textSize, 11);
assert.equal(pending.overlay.props.width, 42);
assert.equal(pending.overlay.props.height, 42);
assert.equal(pendingStyle.backgroundColor, '#FE6A20');
assert.equal(pendingStyle.height, 32);
assert.equal(pendingStyle.width, 32);
assert.equal(pendingStyle.borderWidth, 2);
assert.equal(pendingStyle.shadowOffset.height, 0);
assert.equal(pendingStyle.shadowOffset.width, 0);
assert.equal(pendingStyle.shadowRadius, 6);
assert.equal(pendingStyle.shadowOpacity, 0.3);
assert.equal(pending.child.props.tintColor, '#FFFFFF');
const normal = pending;
assert.equal(normal.overlay.props.anchor.x, 0.5);
assert.equal(normal.overlay.props.anchor.y, 1);
assert.equal(normal.overlay.props.latitude, place.latitude);
assert.equal(normal.overlay.props.longitude, place.longitude);
assert.equal(normal.overlay.props.width, 42);
assert.equal(normal.overlay.props.height, 42);
assert.equal(normal.overlay.props.caption.requestedWidth, 84);
assert.equal(normal.overlay.props.caption.text, place.name);
normal.overlay.props.onTap();
assert.equal(normal.tapped[0], place);
assert.equal(normal.overlay.props.zIndex, 1);
assert.equal(normal.child.type, 'SymbolView');
assert.equal(normal.child.props.tintColor, '#FFFFFF');
const selected = renderMarker({ selectedPlaceId: place.id, selectedCategory: { code: 'CAFE' } });
assert.equal(selected.overlay.props.zIndex, 30);
assert.equal(selected.child.props.tintColor, '#FFFFFF');
assert.equal(flattenStyle(selected.bubble.props.style).backgroundColor, '#000000');
const selectedWithoutFilter = renderMarker({ selectedPlaceId: place.id });
assert.equal(selectedWithoutFilter.overlay.props.zIndex, 30);
assert.equal(selectedWithoutFilter.child.props.tintColor, '#FFFFFF');
const matching = renderMarker({ selectedCategory: { code: 'RESTAURANT' } });
assert.equal(matching.overlay.props.zIndex, 20);
assert.equal(flattenStyle(matching.bubble.props.style).transform[0].scale, 1.12);
const selectedMatching = renderMarker({ selectedPlaceId: place.id, selectedCategory: { code: 'RESTAURANT' } });
assert.equal(selectedMatching.overlay.props.zIndex, 30);
assert.equal(flattenStyle(selectedMatching.bubble.props.style).backgroundColor, '#000000');
const dimmed = renderMarker({ selectedCategory: { code: 'CAFE' } });
assert.equal(dimmed.overlay.props.zIndex, 1);
assert.equal(dimmed.child.props.tintColor, '#333D4B');
const dimmedStyle = flattenStyle(dimmed.bubble.props.style);
assert.equal(dimmedStyle.backgroundColor, '#F1F5F9');
assert.equal(dimmedStyle.opacity, 0.5);
assert.equal(dimmedStyle.transform[0].scale, 0.88);
assert.equal(dimmed.overlay.props.caption.color, '#8B95A1');
const selectedMismatch = renderMarker({ selectedPlaceId: 999, selectedCategory: { code: 'CAFE' } });
assert.equal(selectedMismatch.overlay.props.zIndex, 1);
assert.equal(selectedMismatch.child.props.tintColor, '#333D4B');
const expectedAssets = Object.fromEntries(categories.map((category) => [category, `${category.toLowerCase()}.${category === 'HOSPITAL' ? 'svg' : 'webp'}`]));
for (const category of categories) {
  const meta = getPlaceCategoryMeta(category);
  assert.equal(meta.kind, 'image');
  assert.match(meta.icon, new RegExp(`${expectedAssets[category]}$`));
}
for (const fixturePlace of fixture.places) {
  const item = toPlace(fixturePlace);
  const rendered = renderMarker({ place: item });
  assert.equal(rendered.overlay.props.latitude, item.latitude);
  assert.equal(rendered.overlay.props.longitude, item.longitude);
  rendered.overlay.props.onTap();
  assert.equal(rendered.tapped[0], item);
}
const loadCountBeforeUnknown = imageLoadCount;
const unknown = renderMarker({ place: toPlace(fixture.places.find((item) => item.category === 'UNKNOWN_CATEGORY')) });
assert.equal(unknown.child.type, 'SymbolView');
assert.equal(unknown.child.props.name.ios, 'pawprint.fill');
assert.equal(imageLoadCount, loadCountBeforeUnknown);
imageState = { width: 20, height: 20, uri: 'prepared://restaurant' };
const ready = renderMarker();
assert.equal(ready.child.type, 'Image');
assert.equal(ready.child.props.source, imageState);
assert.equal(ready.loader.type, pending.loader.type);
assert.equal(ready.loader.props.key, pending.loader.props.key);
assert.notEqual(ready.bubble.props.key, pending.bubble.props.key);
for (const fixturePlace of fixture.places.filter((item) => categories.includes(item.category))) {
  const rendered = renderMarker({ place: toPlace(fixturePlace) });
  assert.equal(rendered.child.type, 'Image');
  assert.equal(rendered.child.props.source, imageState);
  assert.equal(rendered.child.props.tintColor, '#FFFFFF');
  if (fixturePlace.category === 'GROOMING') assert.equal(rendered.child.props.style[1].transform[0].rotate, '-90deg');
}
imageState = null;
const failure = renderMarker();
assert.equal(failure.child.type, 'SymbolView');
assert.equal(failure.child.props.name.ios, 'pawprint.fill');
console.log(`map icon verification passed (${categories.length} categories, fallback, states, identity/anchor/caption/z-index contracts)`);
