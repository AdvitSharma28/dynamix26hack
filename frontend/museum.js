const FRAME_RATE = 24;
const ASSET_PATH = "asset/museum%20anim/";
const FORWARD_VIDEO = `${ASSET_PATH}syntax%20museum.webm`;

const video = document.getElementById("museum-video");
const still = document.getElementById("museum-still");
const hint = document.querySelector(".museum-hint");
const hotspotsLayer = document.getElementById("museum-hotspots");
const openingUi = document.getElementById("museum-opening-ui");
const detailUi = document.getElementById("museum-detail-ui");
const detailClose = document.getElementById("museum-detail-close");
const openingTitle = document.getElementById("museum-opening-title");
const detailTitle = document.getElementById("museum-detail-title");
const detailSubtitle = document.getElementById("museum-detail-subtitle");
const detailBody = document.getElementById("museum-detail-body");
const monumentsUi = document.getElementById("museum-monuments-ui");
const paintingsUi = document.getElementById("museum-paintings-ui");
const artifactsUi = document.getElementById("museum-artifacts-ui");
const frameUis = [openingUi, monumentsUi, paintingsUi, artifactsUi];

const holds = [
    `${ASSET_PATH}0001.png`,
    `${ASSET_PATH}0049.png`,
    `${ASSET_PATH}0095.png`,
    `${ASSET_PATH}0129.png`
];

const segments = [
    { from: 2, to: 48 },
    { from: 50, to: 94 },
    { from: 96, to: 128 }
];

const reverseClips = [
    `${ASSET_PATH}reverse_048_002.webm`,
    `${ASSET_PATH}reverse_094_050.webm`,
    `${ASSET_PATH}reverse_128_096.webm`
];

const holdHotspots = [
    [
        { x: 51.1, y: 52.2, detail: "qutub" }
    ],
    [
        { x: 21.2, y: 67.6, detail: "taj" },
        { x: 81.0, y: 67.6, detail: "konark" }
    ],
    [
        { x: 50.3, y: 73.3, detail: "painting" }
    ],
    [
        { x: 26.5, y: 72.2, detail: "ashoka" },
        { x: 73.2, y: 72.2, detail: "priest" }
    ]
];

const detailContent = {
    qutub: {
        hold: 0,
        layout: "qutub",
        closeX: 50.2,
        closeY: 59.5,
        title: "qutub minar",
        subtitle: "",
        body: "the qutab minar is a unesco world heritage site located in delhi, india, and is the world's tallest brick minaret,<br>standing about 72.5 meters (238 feet) high. construction began in 1192 ce by qutb-ud-din aibak, the founder of the delhi sultanate,<br>and was completed by his successor iltutmish, with later repairs by firoz shah tughlaq. built from red sandstone and marble, the tower is adorned with intricate carvings<br>and quranic inscriptions. it is surrounded by historic monuments, including the quwwat-ul-islam mosque and the famous iron pillar."
    },
    taj: {
        hold: 1,
        layout: "taj",
        closeX: 88.8,
        closeY: 12.5,
        title: "taj mahal",
        subtitle: "UNESCO world heritage site and<br>Seven wonders of the world",
        body: "the taj mahal, located in agra, india, is a breathtaking 17th-century white marble mausoleum built by<br>mughal emperor shah jahan in memory of his beloved wife, mumtaz mahal. renowned worldwide for<br>its exquisite symmetry, intricate marble inlay work, and majestic central dome, it stands as a timeless<br>masterpiece of mughal architecture. declared a unesco world heritage site and one of the new seven<br>wonders of the world, this iconic monument symbolizes eternal love and attracts millions of visitors<br>across the globe. reflecting softly in the waters of the yamuna river, its appearance changes<br>gracefully with the shifting light of the sun and moon."
    },
    konark: {
        hold: 1,
        layout: "konark",
        closeX: 90.6,
        closeY: 12.3,
        title: "konark<br>sun<br>temple",
        subtitle: "",
        body: "the konark sun temple, located in odisha, india, is a magnificent 13th-century monument dedicated<br>to the sun god,<br>surya. built by king narasimhadeva i of the eastern ganga dynasty, it is renowned for its<br>extraordinary architecture shaped like a giant stone chariot. the temple features 24 intricately<br>carved wheels drawn by seven horses,<br>symbolically depicting the movement of time and seasons. its walls are adorned with detailed<br>sculptures depicting life, mythology, and erotic art,<br>showcasing the high level of craftsmanship of ancient indian artisans. recognized as a unesco<br>world heritage site."
    },
    painting: {
        hold: 2,
        layout: "painting",
        closeX: 80.8,
        closeY: 34.8,
        title: "passing of shah jahan",
        subtitle: "(1902)",
        body: "the passing of shah jahan is a famous 1902 miniature painting<br>created by indian artist abanindranath tagore. it poignantly depicts the final<br>moments of the imprisoned mughal emperor shah jahan as he lies on his deathbed, gazing longingly at the<br>taj mahal in the distance while his devoted daughter, jahanara, sits grief-stricken at his feet. blending traditional mughal<br>miniature aesthetics with british watercolor and japanese wash techniques, the artwork vividly captures the emotional concept of bhava<br>(deep sentiment and melancholy). this masterpiece won major awards, helped revive indigenous indian artistic styles during the swadeshi movement,<br>and established tagore as a pioneering figure in modern indian art, portraying shah jahan's final gaze toward the distant taj mahal before he dies."
    },
    ashoka: {
        hold: 3,
        layout: "ashoka",
        closeX: 26.5,
        closeY: 72.2,
        title: "ashoka pillar",
        subtitle: "",
        body: "A timeless symbol of peace, wisdom, and righteous leadership.<br><br>Commissioned by Emperor Ashoka in the 3rd century BCE, the Ashoka Pillar stands as one of India's greatest architectural achievements, carrying messages of harmony, justice, and compassion that continue to inspire generations."
    },
    priest: {
        hold: 3,
        layout: "priest",
        closeX: 73.2,
        closeY: 72.2,
        title: "priest king",
        subtitle: "indus valley",
        body: "The Priest-King of Mohenjo-daro is among the most iconic artifacts of the Indus Valley Civilization, offering a glimpse into one of the world's earliest urban societies. Carved from steatite around 2000–1900 BCE, the sculpture is celebrated for its intricate craftsmanship, composed expression, and finely detailed robe adorned with trefoil patterns.<br><br>Although its popular title suggests royalty or religious authority, no archaeological evidence confirms the figure's true identity. Today, it stands as a timeless symbol of Harappan artistry, sophistication, and the enduring mystery of an ancient civilization."
    }
};

const HOTSPOT_TRIGGER_RADIUS = 58;
const TYPE_OUT_DELAY = 42;
const TYPE_IN_DELAY = 58;

let currentHold = 0;
let isAnimating = false;
let wheelDelta = 0;
let touchStartY = null;
let hotspotElements = [];
let isDetailTransitioning = false;
let activeDetailId = null;
const originalFrameTitles = frameUis.map((ui) => ui.querySelector("h1").textContent);

function frameToTime(frame) {
    return (frame - 1) / FRAME_RATE;
}

function decodeImage(src) {
    const img = new Image();
    img.src = src;

    if (img.decode) {
        return img.decode().catch(() => undefined);
    }

    return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
    });
}

function waitForVideoMetadata() {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        video.addEventListener("loadedmetadata", resolve, { once: true });
    });
}

function waitForVideoFrame() {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        video.addEventListener("loadeddata", resolve, { once: true });
    });
}

function waitForPaintedVideoFrame() {
    return new Promise((resolve) => {
        let resolved = false;
        const finish = () => {
            if (resolved) return;
            resolved = true;
            resolve();
        };

        window.setTimeout(finish, 140);

        if (video.requestVideoFrameCallback) {
            video.requestVideoFrameCallback(() => {
                requestAnimationFrame(finish);
            });
            return;
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(finish);
        });
    });
}

async function setVideoSource(src) {
    if (video.dataset.src === src) return;

    video.pause();
    video.classList.remove("is-visible");
    video.dataset.src = src;
    video.src = src;
    video.load();
    await waitForVideoMetadata();
}

function seekVideo(time) {
    return new Promise((resolve) => {
        if (Math.abs(video.currentTime - time) < 0.002) {
            requestAnimationFrame(resolve);
            return;
        }

        const onSeeked = () => resolve();
        video.addEventListener("seeked", onSeeked, { once: true });
        video.currentTime = Math.max(0, time);
    });
}

async function showStill(index) {
    await decodeImage(holds[index]);
    video.pause();
    still.src = holds[index];
    renderHotspots(index);
    still.classList.add("is-visible");
    hotspotsLayer.classList.add("is-visible");
    updateFrameUi(index);
    video.classList.remove("is-visible");
    currentHold = index;
}

async function revealVideoWithoutFlash() {
    video.classList.add("is-visible");
    await waitForPaintedVideoFrame();
    hotspotsLayer.classList.remove("is-visible");
    openingUi.classList.remove("is-visible");
    detailUi.classList.remove("is-visible");
    monumentsUi.classList.remove("is-visible");
    paintingsUi.classList.remove("is-visible");
    artifactsUi.classList.remove("is-visible");
    still.classList.remove("is-visible");
}

function renderHotspots(index) {
    const hotspots = holdHotspots[index] || [];
    hotspotsLayer.replaceChildren();
    hotspotElements = hotspots.map((hotspot) => {
        const dot = document.createElement("span");
        dot.className = "museum-hotspot";
        dot.style.setProperty("--x", hotspot.x);
        dot.style.setProperty("--y", hotspot.y);
        if (hotspot.detail) {
            dot.dataset.detail = hotspot.detail;
        }
        hotspotsLayer.append(dot);
        return dot;
    });
}

function updateHotspotProximity(clientX, clientY) {
    if (!hotspotsLayer.classList.contains("is-visible") || isAnimating) return;

    hotspotElements.forEach((dot) => {
        dot.classList.toggle("is-active", isWithinHotspotRadius(dot, clientX, clientY));
    });
}

function clearHotspotProximity() {
    hotspotElements.forEach((dot) => dot.classList.remove("is-active"));
}

function sleep(duration) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, duration);
    });
}

async function typeText(element, text, delay = TYPE_IN_DELAY) {
    element.replaceChildren();
    const parts = text.split(/(<br\s*\/?>)/i);

    for (const part of parts) {
        if (!part) continue;

        if (/^<br\s*\/?>$/i.test(part)) {
            element.append(document.createElement("br"));
            continue;
        }

        const textNode = document.createTextNode("");
        element.append(textNode);

        for (const character of part) {
            textNode.textContent += character;
            await sleep(delay);
        }
    }
}

async function eraseText(element, delay = TYPE_OUT_DELAY) {
    while (element.textContent.length > 0 || element.querySelector("br")) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let lastText = null;
        let currentNode = walker.nextNode();

        while (currentNode) {
            if (currentNode.textContent.length > 0) {
                lastText = currentNode;
            }
            currentNode = walker.nextNode();
        }

        if (lastText) {
            lastText.textContent = lastText.textContent.slice(0, -1);
        } else {
            const lastBreak = Array.from(element.querySelectorAll("br")).pop();
            if (lastBreak) lastBreak.remove();
        }

        await sleep(delay);
    }
}

function splitRevealWords(element) {
    let wordIndex = 0;

    Array.from(element.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;

        const fragment = document.createDocumentFragment();
        const parts = node.textContent.split(/(\s+)/);

        parts.forEach((part) => {
            if (!part) return;

            if (/^\s+$/.test(part)) {
                fragment.append(document.createTextNode(part));
                return;
            }

            const span = document.createElement("span");
            span.className = "museum-reveal-word";
            span.style.setProperty("--word-index", wordIndex);
            span.textContent = part;
            fragment.append(span);
            wordIndex += 1;
        });

        node.replaceWith(fragment);
    });
}

function resetRevealCopy(element) {
    element.classList.remove("is-revealed");
    element.classList.remove("is-hiding");
}

function revealCopy(element) {
    resetRevealCopy(element);
    requestAnimationFrame(() => {
        element.classList.add("is-revealed");
    });
}

function hideRevealCopy(element) {
    element.classList.add("is-hiding");
    element.classList.remove("is-revealed");
}

function isWithinHotspotRadius(dot, clientX, clientY) {
    const rect = dot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(clientX - centerX, clientY - centerY);

    return distance <= HOTSPOT_TRIGGER_RADIUS;
}

function updateFrameUi(index) {
    activeDetailId = null;
    resetDetailUi();

    openingUi.classList.toggle("is-visible", index === 0);
    monumentsUi.classList.toggle("is-visible", index === 1);
    paintingsUi.classList.toggle("is-visible", index === 2);
    artifactsUi.classList.toggle("is-visible", index === 3);
}

function resetFrameTitles() {
    frameUis.forEach((ui, index) => {
        ui.querySelector("h1").textContent = originalFrameTitles[index];
        ui.classList.remove("is-typing-out");
    });
}

function resetDetailUi() {
    detailUi.className = "museum-detail-ui";
    detailUi.classList.remove("is-visible");
    detailUi.style.removeProperty("--close-x");
    detailUi.style.removeProperty("--close-y");
    detailTitle.textContent = "";
    detailSubtitle.textContent = "";
    detailBody.textContent = "";
    resetRevealCopy(detailBody);
    resetFrameTitles();
}

function sourceUiForDetail(detail) {
    return frameUis[detail.hold];
}

function sourceTitleForDetail(detail) {
    return sourceUiForDetail(detail).querySelector("h1");
}

function prepareDetail(detail) {
    detailUi.className = `museum-detail-ui museum-detail--${detail.layout}`;
    detailUi.style.setProperty("--close-x", detail.closeX);
    detailUi.style.setProperty("--close-y", detail.closeY);
    detailTitle.textContent = "";
    detailSubtitle.textContent = "";
    detailBody.innerHTML = detail.body;
    splitRevealWords(detailBody);
    resetRevealCopy(detailBody);
}

async function showDetail(detailId) {
    const detail = detailContent[detailId];
    if (!detail || detail.hold !== currentHold || isAnimating || isDetailTransitioning || activeDetailId) return;

    isAnimating = true;
    isDetailTransitioning = true;
    activeDetailId = detailId;
    clearHotspotProximity();
    hotspotsLayer.classList.remove("is-visible");

    const sourceUi = sourceUiForDetail(detail);
    const sourceTitle = sourceTitleForDetail(detail);

    prepareDetail(detail);
    sourceUi.classList.add("is-typing-out");
    await eraseText(sourceTitle);
    sourceUi.classList.remove("is-visible");
    sourceUi.classList.remove("is-typing-out");

    detailUi.classList.add("is-visible");
    await sleep(120);
    await typeText(detailTitle, detail.title);
    if (detail.subtitle) {
        await typeText(detailSubtitle, detail.subtitle, TYPE_IN_DELAY * 0.8);
    }
    revealCopy(detailBody);

    isDetailTransitioning = false;
    isAnimating = false;
}

async function hideActiveDetail() {
    const detail = detailContent[activeDetailId];
    if (!detail || isAnimating || isDetailTransitioning) return;

    isAnimating = true;
    isDetailTransitioning = true;
    hideRevealCopy(detailBody);
    await sleep(180);
    await eraseText(detailSubtitle, TYPE_OUT_DELAY * 0.8);
    await eraseText(detailTitle);
    detailUi.classList.remove("is-visible");

    const sourceUi = sourceUiForDetail(detail);
    const sourceTitle = sourceTitleForDetail(detail);
    sourceTitle.textContent = "";
    sourceUi.classList.add("is-visible");
    await sleep(120);
    await typeText(sourceTitle, originalFrameTitles[detail.hold]);

    activeDetailId = null;
    resetDetailUi();
    hotspotsLayer.classList.add("is-visible");
    isDetailTransitioning = false;
    isAnimating = false;
}

function playForward(endTime) {
    return new Promise((resolve) => {
        const stopAtEnd = () => {
            if (video.currentTime >= endTime) {
                video.pause();
                video.removeEventListener("timeupdate", stopAtEnd);
                video.currentTime = endTime;
                resolve();
            }
        };

        video.playbackRate = 1;
        video.addEventListener("timeupdate", stopAtEnd);
        video.play().catch(resolve);
    });
}

function playCurrentClip() {
    return new Promise((resolve) => {
        const cleanup = () => {
            video.removeEventListener("ended", cleanup);
            resolve();
        };

        video.playbackRate = 1;
        video.addEventListener("ended", cleanup, { once: true });
        video.play().catch(() => {
            video.removeEventListener("ended", cleanup);
            resolve();
        });
    });
}

async function transition(direction) {
    if (isAnimating || isDetailTransitioning) return;

    const nextHold = currentHold + direction;
    if (nextHold < 0 || nextHold >= holds.length) return;

    isAnimating = true;
    activeDetailId = null;
    resetDetailUi();
    hint.classList.add("is-hidden");
    clearHotspotProximity();
    hotspotsLayer.classList.remove("is-visible");
    openingUi.classList.remove("is-visible");
    detailUi.classList.remove("is-visible");
    monumentsUi.classList.remove("is-visible");
    paintingsUi.classList.remove("is-visible");
    artifactsUi.classList.remove("is-visible");

    await decodeImage(holds[nextHold]);

    if (direction > 0) {
        const segment = segments[currentHold];
        const startTime = frameToTime(segment.from);
        const endTime = frameToTime(segment.to);

        await setVideoSource(FORWARD_VIDEO);
        await seekVideo(startTime);
        await waitForVideoFrame();
        await revealVideoWithoutFlash();
        await playForward(endTime);
    } else {
        await setVideoSource(reverseClips[nextHold]);
        await seekVideo(0);
        await waitForVideoFrame();
        await revealVideoWithoutFlash();
        await playCurrentClip();
    }

    await showStill(nextHold);
    isAnimating = false;
}

function handleWheel(event) {
    event.preventDefault();
    if (isAnimating || isDetailTransitioning) return;

    wheelDelta += event.deltaY;

    if (Math.abs(wheelDelta) < 30) return;

    const direction = wheelDelta > 0 ? 1 : -1;
    wheelDelta = 0;
    transition(direction);
}

function handleKeydown(event) {
    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        transition(1);
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        transition(-1);
    }
}

window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeydown);
window.addEventListener("pointermove", (event) => {
    updateHotspotProximity(event.clientX, event.clientY);
});
window.addEventListener("click", (event) => {
    const clickedHotspot = hotspotElements.find((dot) => (
        dot.dataset.detail
        && (
            dot.classList.contains("is-active")
            || isWithinHotspotRadius(dot, event.clientX, event.clientY)
        )
    ));

    if (!clickedHotspot) return;
    showDetail(clickedHotspot.dataset.detail);
});
detailClose.addEventListener("click", (event) => {
    event.stopPropagation();
    hideActiveDetail();
});
window.addEventListener("pointerleave", clearHotspotProximity);
window.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0].clientY;
}, { passive: true });
window.addEventListener("touchmove", (event) => {
    event.preventDefault();
}, { passive: false });
window.addEventListener("touchend", (event) => {
    if (touchStartY === null || isAnimating || isDetailTransitioning) return;

    const endY = event.changedTouches[0].clientY;
    const delta = touchStartY - endY;
    touchStartY = null;

    if (Math.abs(delta) < 35) return;
    transition(delta > 0 ? 1 : -1);
});

Promise.all([
    waitForVideoMetadata(),
    ...holds.map(decodeImage)
]).then(() => {
    video.dataset.src = FORWARD_VIDEO;
    video.currentTime = frameToTime(2);
});

renderHotspots(currentHold);
resetDetailUi();
