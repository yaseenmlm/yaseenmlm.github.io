(function () {
  "use strict";
  // Interactive blueprint grid: the cursor lights up the grid lines around it.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var CELL = 28, R = 240;
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.className = "bg-glow";
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext("2d");
  var w, h, dpr, raf = 0;
  var target = { x: -1e4, y: -1e4 }, pos = { x: -1e4, y: -1e4 }, strength = 0, goal = 0;

  function accent() {
    return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#1d6b3a";
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + "px"; cv.style.height = h + "px";
    draw();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (strength < 0.01) return;
    var color = accent(), x0 = pos.x - R, x1 = pos.x + R, y0 = pos.y - R, y1 = pos.y + R;
    var oy = -(window.scrollY % CELL);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.55;
    var x, y;
    for (x = Math.floor(x0 / CELL) * CELL; x <= x1; x += CELL) ctx.fillRect(x, y0, 1, R * 2);
    for (y = Math.floor((y0 - oy) / CELL) * CELL + oy; y <= y1; y += CELL) ctx.fillRect(x0, y, R * 2, 1);
    // Dots at the intersections for a bit of texture.
    ctx.globalAlpha = 0.9;
    for (x = Math.floor(x0 / CELL) * CELL; x <= x1; x += CELL)
      for (y = Math.floor((y0 - oy) / CELL) * CELL + oy; y <= y1; y += CELL) ctx.fillRect(x - 1, y - 1, 3, 3);
    ctx.globalAlpha = 1;
    // Fade everything out away from the pointer.
    var g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, R);
    g.addColorStop(0, "rgba(0,0,0," + strength + ")");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }

  function tick() {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;
    strength += (goal - strength) * 0.12;
    draw();
    var moving = Math.abs(target.x - pos.x) > 0.5 || Math.abs(target.y - pos.y) > 0.5 || Math.abs(goal - strength) > 0.01;
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  window.addEventListener("pointermove", function (e) {
    if (pos.x < -1e3) { pos.x = e.clientX; pos.y = e.clientY; }
    target.x = e.clientX; target.y = e.clientY; goal = 1; kick();
  }, { passive: true });
  document.addEventListener("pointerleave", function () { goal = 0; kick(); });
  window.addEventListener("scroll", function () { if (goal) kick(); }, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch") { target.x = pos.x = e.clientX; target.y = pos.y = e.clientY; goal = 1; kick(); }
  }, { passive: true });
  resize();
})();
