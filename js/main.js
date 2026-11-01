(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var isUrl = function (s) { return /^https?:\/\//.test(s); };

  function el(tag, opts, children) {
    var node = document.createElement(tag);
    opts = opts || {};
    if (opts.cls) node.className = opts.cls;
    if (opts.text) node.textContent = opts.text;
    if (opts.attrs) for (var k in opts.attrs) node.setAttribute(k, opts.attrs[k]);
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function link(label, href, external) {
    var a = el("a", { text: label, attrs: { href: href } });
    if (external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    return el("li", {}, [a]);
  }

  function tagList(tags, cls) {
    if (!tags || !tags.length) return null;
    return el("ul", { cls: cls || "tags", attrs: { "aria-label": "Technologies" } },
      tags.map(function (t) { return el("li", { text: t }); }));
  }

  function projectItem(p) {
    var kids = [];
    if (p.badge) kids.push(el("span", { cls: "badge", text: p.badge }));
    kids.push(el("h3", { text: p.title }));
    if (p.subtitle) kids.push(el("p", { cls: "label", text: p.subtitle }));
    (p.description || []).forEach(function (d) { kids.push(el("p", { text: d })); });

    var shots = (p.screenshots || []).filter(Boolean);
    if (shots.length) {
      kids.push(el("div", { cls: "shots" }, shots.map(function (s) {
        var file = typeof s === "string" ? s : s.file;
        var alt = typeof s === "string" ? p.title + " screenshot" : (s.alt || p.title + " screenshot");
        return el("img", { attrs: { src: "assets/projects/" + p.slug + "/" + file, alt: alt, loading: "lazy" } });
      })));
    }
    if (p.video && !isUrl(p.video)) {
      kids.push(el("video", { attrs: { src: "assets/projects/" + p.slug + "/" + p.video, controls: "", preload: "none", "aria-label": p.title + " demo video" } }));
    }
    kids.push(tagList(p.tags));

    var links = [];
    if (p.liveDemo) links.push(link("Live demo", p.liveDemo, true));
    if (p.repo) links.push(link("Source", p.repo, true));
    if (p.video && isUrl(p.video)) links.push(link("Video", p.video, true));
    if (links.length) kids.push(el("ul", { cls: "links" }, links));

    return el("li", { cls: "project reveal" }, kids);
  }

  function render(c) {
    var s = c.site, h = c.hero, l = c.links;
    document.title = s.title;
    $("eyebrow").textContent = h.eyebrow;
    $("hero-name").textContent = h.name;
    $("tagline").textContent = h.tagline;
    $("subhead").textContent = h.subhead;
    h.intro.forEach(function (t) { $("intro").appendChild(el("p", { text: t })); });

    var hl = $("hero-links");
    hl.appendChild(link("GitHub", l.github, true));
    hl.appendChild(link("LinkedIn", l.linkedin, true));
    hl.appendChild(link("Email", "mailto:" + l.email));
    hl.appendChild(link(h.resumeLabel, s.resumeFile));
    hl.lastChild.firstChild.setAttribute("download", "");

    c.projects.forEach(function (p) { $("project-list").appendChild(projectItem(p)); });

    c.experience.forEach(function (j) {
      $("timeline").appendChild(el("li", { cls: "job reveal" }, [
        el("p", { cls: "dates", text: j.dates }),
        el("h3", { text: j.role }),
        el("p", { cls: "org", text: j.org }),
        el("ul", { cls: "points" }, j.bullets.map(function (b) { return el("li", { text: b }); })),
        tagList(j.tags)
      ]));
    });

    c.skills.forEach(function (g) {
      $("skill-groups").appendChild(el("div", {}, [
        el("dt", { text: g.group }),
        el("dd", { text: g.items.join(", ") })
      ]));
    });

    c.education.forEach(function (e) {
      $("education-list").appendChild(el("div", { cls: "edu reveal" }, [
        el("p", { cls: "dates", text: e.dates }),
        el("h3", { text: e.school }),
        el("p", { cls: "label", text: e.place }),
        el("p", { text: e.degree }),
        tagList(e.tags)
      ]));
    });

    var a = el("a", { text: l.email, attrs: { href: "mailto:" + l.email } });
    $("contact-mail").appendChild(a);
    $("contact-text").textContent = c.contact.text;
    $("foot").textContent = "© " + new Date().getFullYear() + " " + h.name;

    reveal();
    spy();
  }

  function reveal() {
    var items = document.querySelectorAll(".reveal");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (n) { io.observe(n); });
  }

  // Underline the nav link for the section currently in view.
  function spy() {
    if (!("IntersectionObserver" in window)) return;
    var links = {};
    document.querySelectorAll(".bar nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        for (var k in links) links[k].classList.toggle("on", k === e.target.id);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section").forEach(function (sec) { io.observe(sec); });
  }

  $("theme").addEventListener("click", function () {
    var dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = dark ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  fetch("content.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () { $("load-error").hidden = false; });
})();
