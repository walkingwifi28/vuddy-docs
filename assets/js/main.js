(() => {
    "use strict";

    if (document.getElementById("page-toc")) {
        return;
    }

    const headings = Array.from(
        document.querySelectorAll("main h1, main h2, main h3"),
    );

    if (headings.length === 0) {
        return;
    }

    const usedIds = new Set(["page-toc", "page-toc-toggle"]);
    document.querySelectorAll("[id]").forEach((element) => {
        if (!headings.includes(element)) {
            usedIds.add(element.id);
        }
    });

    headings.forEach((heading, index) => {
        const baseId = heading.id || "section-" + (index + 1);
        let id = baseId;
        let suffix = 2;

        while (usedIds.has(id)) {
            id = baseId + "-" + suffix;
            suffix += 1;
        }

        heading.id = id;
        usedIds.add(id);
    });

    const nav = document.createElement("nav");
    nav.id = "page-toc";
    nav.className = "page-toc";
    nav.setAttribute("aria-label", "ページ内目次");

    const header = document.createElement("div");
    header.className = "page-toc-header";

    const title = document.createElement("span");
    title.className = "page-toc-title";
    title.textContent = "目次";

    const closeButton = document.createElement("button");
    closeButton.className = "page-toc-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "目次を閉じる");
    closeButton.textContent = "閉じる";

    const list = document.createElement("ul");
    list.className = "page-toc-list";

    const links = new Map();
    headings.forEach((heading) => {
        const item = document.createElement("li");
        item.className = "page-toc-item";

        const link = document.createElement("a");
        link.className =
            "page-toc-link page-toc-link--" +
            heading.tagName.toLowerCase();
        link.href = "#" + encodeURIComponent(heading.id);
        link.textContent = heading.textContent.trim();

        item.append(link);
        list.append(item);
        links.set(heading, link);
    });

    header.append(title, closeButton);
    nav.append(header, list);

    const toggle = document.createElement("button");
    toggle.id = "page-toc-toggle";
    toggle.className = "page-toc-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-controls", nav.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "目次";

    const overlay = document.createElement("div");
    overlay.className = "page-toc-overlay";
    overlay.setAttribute("aria-hidden", "true");

    document.body.append(overlay, nav, toggle);

    const setOpen = (open, restoreFocus = true) => {
        document.body.classList.toggle("page-toc-open", open);
        toggle.setAttribute("aria-expanded", String(open));

        if (open) {
            requestAnimationFrame(() => closeButton.focus());
        } else if (restoreFocus) {
            toggle.focus();
        }
    };

    const setActive = (activeHeading) => {
        links.forEach((link, heading) => {
            const isActive = heading === activeHeading;
            link.classList.toggle("is-active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    let navigationTarget = null;
    let navigationReleaseTimer = null;

    const releaseNavigationLock = () => {
        navigationTarget = null;

        if (navigationReleaseTimer !== null) {
            clearTimeout(navigationReleaseTimer);
            navigationReleaseTimer = null;
        }
    };

    const lockActiveDuringNavigation = (heading) => {
        navigationTarget = heading;

        if (navigationReleaseTimer !== null) {
            clearTimeout(navigationReleaseTimer);
        }

        navigationReleaseTimer = setTimeout(releaseNavigationLock, 1500);
    };

    toggle.addEventListener("click", () => {
        setOpen(!document.body.classList.contains("page-toc-open"));
    });
    closeButton.addEventListener("click", () => setOpen(false));
    overlay.addEventListener("click", () => setOpen(false));
    links.forEach((link, heading) => {
        link.addEventListener("click", () => {
            lockActiveDuringNavigation(heading);
            setActive(heading);
            setOpen(false, false);
        });
    });
    window.addEventListener("scrollend", releaseNavigationLock);
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            document.body.classList.contains("page-toc-open")
        ) {
            setOpen(false);
        }
    });

    setActive(headings[0]);

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            () => {
                const threshold = window.innerHeight * 0.18;
                const atPageEnd =
                    window.scrollY + window.innerHeight >=
                    document.documentElement.scrollHeight - 2;

                if (navigationTarget) {
                    setActive(navigationTarget);
                    return;
                }

                const activeHeading =
                    (atPageEnd
                        ? headings.at(-1)
                        : headings
                              .filter(
                                  (heading) =>
                                      heading.getBoundingClientRect().top <=
                                      threshold,
                              )
                              .at(-1)) || headings[0];
                setActive(activeHeading);
            },
            {
                rootMargin: "-20% 0px -70% 0px",
                threshold: 0,
            },
        );

        headings.forEach((heading) => observer.observe(heading));
    }
})();
