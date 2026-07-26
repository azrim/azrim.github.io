// azrim.my.id interactions.
// Everything animated is gated behind prefers-reduced-motion and feature
// checks; without JS or GSAP the page renders fully static and visible.

document.documentElement.classList.add("js");
document.getElementById("year").textContent = String(new Date().getFullYear());

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- Ambient dot grid ---------- */

(function initDots() {
  const canvas = document.getElementById("dots");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const GAP = 46;
  const pointer = { x: -9999, y: -9999 };
  let dots = [];
  let w = 0;
  let h = 0;
  let rafId = 0;

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    let i = 0;
    for (let y = GAP / 2; y < h; y += GAP) {
      for (let x = GAP / 2; x < w; x += GAP) {
        dots.push({
          x,
          y,
          phase: (x * 7 + y * 13) % 6.28,
          amber: i % 41 === 0,
        });
        i += 1;
      }
    }
  }

  function plot(d, t) {
    let ox = Math.sin(t + d.phase) * 1.6;
    let oy = Math.cos(t * 0.8 + d.phase) * 1.6;
    const dx = d.x - pointer.x;
    const dy = d.y - pointer.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 140 && dist > 0.01) {
      const force = ((140 - dist) / 140) ** 2 * 16;
      ox += (dx / dist) * force;
      oy += (dy / dist) * force;
    }
    const r = d.amber ? 1.4 : 1.1;
    ctx.moveTo(d.x + ox + r, d.y + oy);
    ctx.arc(d.x + ox, d.y + oy, r, 0, 6.2832);
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    const t = time * 0.00045;
    ctx.beginPath();
    for (const d of dots) if (!d.amber) plot(d, t);
    ctx.fillStyle = "rgba(234, 231, 242, 0.1)";
    ctx.fill();
    ctx.beginPath();
    for (const d of dots) if (d.amber) plot(d, t);
    ctx.fillStyle = "rgba(165, 139, 255, 0.45)";
    ctx.fill();
  }

  // Half-rate drift: the +-1.6px sway reads identically at 30fps and
  // halves the standing canvas + backdrop-blur compositing cost.
  let frame = 0;
  function loop(time) {
    if ((frame++ & 1) === 0) draw(time);
    rafId = requestAnimationFrame(loop);
  }

  build();
  if (reduceMotion) {
    draw(0);
  } else {
    rafId = requestAnimationFrame(loop);
    if (finePointer) {
      window.addEventListener("pointermove", (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }, { passive: true });
      // Relax the grid when the cursor leaves the page entirely.
      const resetPointer = () => {
        pointer.x = -9999;
        pointer.y = -9999;
      };
      window.addEventListener("blur", resetPointer);
      document.documentElement.addEventListener("mouseleave", resetPointer);
    }
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(rafId);
      if (!document.hidden) rafId = requestAnimationFrame(loop);
    });
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      if (reduceMotion) draw(0);
    }, 180);
  });
})();

/* ---------- Motion system ---------- */

const header = document.getElementById("site-header");

if (!reduceMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scrolling, wired into ScrollTrigger's update cycle.
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // In-page anchors go through Lenis; the skip link keeps native behavior
  // so keyboard focus lands on <main> immediately. Hash and focus are
  // preserved so deep links, history, and tab order behave natively.
  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      const target = document.querySelector(href);
      if (target && lenis) {
        e.preventDefault();
        history.pushState(null, "", href);
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        lenis.scrollTo(target, { offset: -10 });
      }
    });
  });

  // Intro: curtain lift, then the hero builds itself line by line.
  const curtain = document.querySelector(".curtain");
  gsap.set(curtain, { display: "block" });
  // Drop the pre-paint CSS hook BEFORE gsap reads any transforms: the CSS
  // translateY(115%) would otherwise be parsed into gsap's pixel channel
  // and survive the yPercent tween, leaving the title stuck off-mask.
  // Same synchronous tick as the sets below, so nothing flashes.
  document.documentElement.classList.remove("intro");
  gsap.set(".hero-line", { y: 0, yPercent: 115 });
  gsap.set(".hero-eyebrow, .hero-sub, .hero-actions", { autoAlpha: 0, y: 24 });
  gsap.set(".hero-card", { autoAlpha: 0, y: 44, rotate: 2 });

  gsap.timeline({ defaults: { ease: "power4.out" } })
    .to(curtain, { yPercent: -100, duration: 0.75, ease: "power3.inOut", delay: 0.15 })
    .set(curtain, { display: "none" })
    .to(".hero-eyebrow", { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.5")
    .to(".hero-line", { yPercent: 0, duration: 0.9, stagger: 0.1 }, "<0.05")
    .to(".hero-sub, .hero-actions", { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.55")
    .to(".hero-card", { autoAlpha: 1, y: 0, rotate: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");

  // Header: border once scrolled, hide on the way down, return on the way up.
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const y = self.scroll();
      header.classList.toggle("scrolled", y > 8);
      header.classList.toggle("hidden", self.direction === 1 && y > 140);
    },
  });

  // Generic scroll reveals (section heads, history rows, link rows).
  // opacity, not autoAlpha: visibility:hidden would drop links from the
  // tab order and accessibility tree. Focus completes the tween instantly.
  gsap.utils.toArray(".reveal").forEach((el) => {
    const tween = gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    el.addEventListener("focusin", () => tween.progress(1), { once: true });
  });

  // Selected work: pinned section, vertical scroll drives a horizontal pan.
  // Only on wide viewports; narrow ones keep the vertical stack.
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px)", () => {
    document.body.classList.add("pan-enabled");
    const track = document.querySelector(".work-track");
    const pin = document.querySelector(".work-pin");
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: () => "+=" + dist(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onToggle: (self) =>
          gsap.set(track, { willChange: self.isActive ? "transform" : "auto" }),
      },
    });

    // Keyboard support: tabbing into an off-screen panel jumps the page
    // scroll to the pan position that brings that panel into view.
    const onFocusIn = (e) => {
      // Keyboard only: mouse clicks also focus links, and jumping the
      // scroll mid-click would slide the link out from under the cursor.
      if (!e.target.matches(":focus-visible")) return;
      const panel = e.target.closest(".panel");
      if (!panel) return;
      const st = tween.scrollTrigger;
      const maxX = dist();
      if (!maxX) return;
      const targetX = Math.min(maxX, Math.max(0, panel.offsetLeft - 80));
      const y = st.start + (targetX / maxX) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };
    // The browser also tries to reveal focused elements by scrolling the
    // overflow-hidden pin container; undo that so the layout never shifts.
    const onPinScroll = () => {
      pin.scrollLeft = 0;
      pin.scrollTop = 0;
    };
    track.addEventListener("focusin", onFocusIn);
    pin.addEventListener("scroll", onPinScroll, { passive: true });

    return () => {
      track.removeEventListener("focusin", onFocusIn);
      pin.removeEventListener("scroll", onPinScroll);
      document.body.classList.remove("pan-enabled");
    };
  });

  // Re-measure pin distances once webfonts land (the giant type shifts metrics).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  // History: the rail line draws itself as the era rows pass.
  const tlLine = document.querySelector(".tl-line");
  if (tlLine) {
    gsap.from(tlLine, {
      scaleY: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".timeline",
        start: "top 78%",
        end: "bottom 55%",
        scrub: true,
      },
    });
  }

  if (finePointer) {
    // Magnetic pull on primary controls.
    document.querySelectorAll(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      el.addEventListener("pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });

    // Profile card tilt.
    const card = document.querySelector(".hero-card");
    const tilt = document.querySelector(".hero-card-tilt");
    if (card && tilt) {
      gsap.set(tilt, { transformPerspective: 700 });
      const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.5, ease: "power2.out" });
      const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.5, ease: "power2.out" });
      card.addEventListener("pointermove", (e) => {
        const r = tilt.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(((e.clientY - r.top) / r.height - 0.5) * -10);
      });
      card.addEventListener("pointerleave", () => {
        rx(0);
        ry(0);
      });
    }
  }
} else {
  // Static fallback: un-hide anything the pre-paint intro hook hid and
  // keep the header readable over content from the start.
  document.documentElement.classList.remove("intro");
  if (header) header.classList.add("scrolled");
}
