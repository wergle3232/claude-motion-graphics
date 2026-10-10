# Recipe: camera dive (a hand-over through a shape)

**Job:** a big hand-over between two scenes, where the first scene's shape becomes part of the next. The camera zooms into a shape until its colour fills the frame, the next scene is set up underneath while the screen is solid colour, then the camera pulls back out of a shape that is now part of the new scene.

**From:** the MORF "shapes" example (`examples/ex-shapes`, 2.85 to 4 s): the red circle dives to a full red frame, and the camera pulls back out of the circle in the MORF mark of the diagram "Idea → MORF → Motion".

This is a technique, not a library item: it moves the whole scene, so it lives in the piece's own `piece.js`. Wrap everything the camera moves in one `#cam` element.

```js
// T.dive: start of the dive; T.red: the moment the frame is one colour.
// hero: the shape the camera dives into, centred at (heroX, Y), size HERO.
// The next scene's shape the camera comes out of sits at (nextX, Y), size NEXT.
gsap.set("#cam", { transformOrigin: heroX + "px " + Y + "px" });
tl.to("#cam", { scale: 14, duration: T.red - T.dive, ease: "power3.in" }, T.dive);  // in: the shape fills the frame

// Under cover of the solid colour: move the hero onto the next scene's shape,
// re-centre the camera there at the matching zoom, and show the new scene.
tl.set("#hero", { x: nextX, scale: NEXT / HERO, rotation: 0 }, T.red);
tl.set("#cam", { transformOrigin: nextX + "px " + Y + "px", scale: 14 * HERO / NEXT }, T.red);
tl.set(["#nodeL", "#nodeR"], { opacity: 1 }, T.red);  // the new scene's other parts

tl.to("#cam", { scale: 1, duration: 1.0, ease: "power3.out" }, T.red + 0.04);  // out: pull back
```

- The swap must happen on a frame where the screen is one solid colour (scale 14 or more for a shape about a fifth of the frame); check that frame in the contact sheet.
- Swap a polygon outline for a true circle (`clip-path: circle(50% at 50% 50%)`) before diving in, or the 48 corners show at scale 14.
- Sound: a short whoosh into the dive, a hit on the solid frame.
- Status: tried (ex-shapes, approved as part of that piece).
