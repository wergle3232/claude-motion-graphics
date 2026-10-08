# StackEngine native OGraf route card

This is the durable brand-owned source for the approved DaVinci Resolve 21
OGraf HTML route card. It uses only local HTML/CSS/JavaScript and declares
`supportsNonRealTime: true` for deterministic frame-by-frame Resolve playback.

Editable native Inspector controls:

- `Headline` — ordinary text field.
- `Accent Color` — Resolve/Fusion native RGB color picker.

The packaged `stackengine-native-route-card.ograf` file is a standard ZIP-based
dotOgraf bundle containing the manifest and JavaScript. Its declared duration
is 8.6 seconds, matching the planned 258-frame test at 30 fps.

## Resolve test result

On 2026-09-19, Resolve confirmed that Media Pool import is not the placement
route: this package and Blackmagic's official sample import as Geometry with
blank duration and cannot append. Assigning a raw `.ograf.json` manifest through
`OGrafLoader` also caused a blocking file dialog and must not be repeated.

The packaged route passed on `08 OGraf Isolated A-B Test`: insert an empty
Fusion composition, add `OGrafLoader`, connect it to `MediaOut` first, then set
`TemplatePath` to this `.ograf`. Resolve parsed the declared duration as 258
source frames. MCP changed `DynParamText0` and `DynParamColor1` in place, and
Wayne approved the rendered result as visually indistinguishable from
HyperFrames.

Routine use is registered in
[`stackengine-ograf-registry.json`](../../registry/stackengine-ograf-registry.json).
Use the canonical `build-resolve-ograf-executor.mjs` plan/apply builder rather
than recreating Fusion code. The current approved placement is five seconds,
matching Resolve's tested empty-composition insertion duration; the 258-frame
manifest duration remains the source animation envelope.
