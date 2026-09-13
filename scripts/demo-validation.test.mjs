import test from "node:test";
import assert from "node:assert/strict";
import { validateRenderInput } from "./demo-validation.mjs";
const make = () => ({
  name: "朝雾",
  shots: Array.from({ length: 5 }, (_, i) => ({
    id: `s${i + 1}`,
    asset: "morning",
    duration: 4,
    caption: "清晨",
  })),
});
test("edited order, half-second timing and Chinese captions survive export validation", () => {
  const p = make();
  p.shots.reverse();
  p.shots[0].duration = 5.5;
  p.shots[0].caption = "为自己，留一杯咖啡。";
  const out = validateRenderInput(p);
  assert.equal(out.shots[0].id, "s5");
  assert.equal(out.shots[0].duration, 5.5);
  assert.equal(out.shots[0].caption, p.shots[0].caption);
});
test("missing media cannot silently disappear from final video", () => {
  const p = make();
  p.shots[2].asset = null;
  assert.throws(() => validateRenderInput(p), /补齐素材/);
});
test("untrusted filenames and remote URLs cannot enter renderer", () => {
  for (const asset of [
    "../../secret",
    "https://example.com/a.png",
    "file:///C:/secret",
  ]) {
    const p = make();
    p.shots[0].asset = asset;
    assert.throws(() => validateRenderInput(p), /演示素材库/);
  }
});
test("duplicate shots and excessive rendering durations are rejected", () => {
  const p = make();
  p.shots[1].id = "s1";
  assert.throws(() => validateRenderInput(p), /不同/);
  for (const d of [0, -1, 500, NaN, Infinity, 2.3]) {
    const p = make();
    p.shots[0].duration = d;
    assert.throws(() => validateRenderInput(p), /时长/);
  }
});
test("unknown payload fields do not become renderer options", () => {
  const p = make();
  p.outputLocation = "C:/bad";
  p.imageSources = { morning: "https://example.com" };
  const out = validateRenderInput(p);
  assert.equal(out.outputLocation, undefined);
  assert.equal(out.imageSources, undefined);
});
