// Creates an element with an optional class and text (textContent avoids HTML injection)
function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    return element;
}

// Only allow http(s) links coming from the API
function isSafeUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
        return false;
    }
}

// Formats an ISO date as "Sep 30, 2026"
function formatDate(rawDate) {
    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        timeZone: "UTC"
    });
}

// Wraps an element in a link to the event page when one is available
function linkTo(url, child) {
    if (!url) {
        return child;
    }

    const link = createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.appendChild(child);

    return link;
}

function createEventCard(nasaEvent) {
    const eventUrl = nasaEvent.newsUrl && isSafeUrl(nasaEvent.newsUrl) ? nasaEvent.newsUrl : null;
    const card = createElement("article", "event-card");

    // Image column (or placeholder when the API provides none)
    const imageColumn = createElement("div", "card-image-column");
    const imageWrapper = createElement("div", "card-image-wrapper");

    if (nasaEvent.image && isSafeUrl(nasaEvent.image)) {
        const image = createElement("img", "card-image");
        image.src = nasaEvent.image;
        image.alt = "";
        image.loading = "lazy";

        // Blurred copy of the image behind it, for the colored shadow effect
        const coloredShadow = createElement("img", "colored-shadow");
        coloredShadow.src = nasaEvent.image;
        coloredShadow.alt = "";
        coloredShadow.loading = "lazy";

        imageWrapper.appendChild(linkTo(eventUrl, image));
        imageWrapper.appendChild(coloredShadow);
    } else {
        imageWrapper.classList.add("card-image-placeholder");
    }

    imageColumn.appendChild(imageWrapper);

    // Content column
    const content = createElement("div", "card-content");

    const meta = createElement("div", "card-meta");
    meta.appendChild(createElement("h6", "card-category text-info", nasaEvent.type));
    meta.appendChild(createElement("h6", "card-category", formatDate(nasaEvent.date)));
    content.appendChild(meta);

    const title = createElement("h3", "card-title");
    title.appendChild(linkTo(eventUrl, document.createTextNode(nasaEvent.name || "")));
    content.appendChild(title);

    if (nasaEvent.location) {
        content.appendChild(createElement("span", "badge badge-pill badge-primary", nasaEvent.location));
    }

    content.appendChild(createElement("p", "card-description", nasaEvent.description));

    if (eventUrl) {
        const exploreLink = createElement("a", "btn-explore");
        exploreLink.href = eventUrl;
        exploreLink.target = "_blank";
        exploreLink.rel = "noopener noreferrer";
        exploreLink.appendChild(createElement("i", "material-icons", "calendar_today"));
        exploreLink.appendChild(document.createTextNode("Explore"));
        content.appendChild(exploreLink);
    }

    card.appendChild(imageColumn);
    card.appendChild(content);

    return card;
}

function showStatus(container, message) {
    container.replaceChildren(createElement("p", "events-status", message));
}

function displayNasaEvents(nasaEvents, containerSelector) {
    const nasaEventsContainer = document.querySelector(containerSelector);

    // 1. Validation Checks
    if (!nasaEventsContainer) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }

    if (!Array.isArray(nasaEvents)) {
        console.error("The received data is not an array:", nasaEvents);
        showStatus(nasaEventsContainer, "Unable to display events.");
        return;
    }

    if (nasaEvents.length === 0) {
        showStatus(nasaEventsContainer, "No upcoming events.");
        return;
    }

    // 2. Render event cards
    const eventsList = createElement("div", "events-list");
    nasaEvents.forEach((nasaEvent) => eventsList.appendChild(createEventCard(nasaEvent)));

    nasaEventsContainer.replaceChildren(eventsList);
}

// 3. Load Data From The Space Devs API
// Static version (no Express server): the browser calls the API directly.
// The free tier allows ~15 requests per hour, so responses are cached locally.
const API_URL = "https://ll.thespacedevs.com/2.3.0/events/upcoming/?limit=50";
const CACHE_KEY = "space-events-cache";
const CACHE_DURATION_MS = 15 * 60 * 1000;

function readCache() {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch {
        return null;
    }
}

function writeCache(events) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ events, cachedAt: Date.now() }));
    } catch {
        // Storage unavailable (private mode): ignore
    }
}

async function fetchEvents() {
    const cache = readCache();
    const cacheIsFresh = cache && Date.now() - cache.cachedAt < CACHE_DURATION_MS;

    if (cacheIsFresh) {
        return cache.events;
    }

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`The Space Devs API returned ${response.status}`);
        }

        const data = await response.json();

        const events = data.results.map((event) => {
            return {
                id: event.id,
                name: event.name,
                description: event.description,
                date: event.date,
                type: event.type?.name || "Unknown",
                location: event.location || null,
                image: event.image?.image_url || null,
                newsUrl: event.news_url || event.info_urls?.[0]?.url || null
            };
        });

        writeCache(events);
        return events;
    } catch (error) {
        // Serve stale data rather than nothing if the API is unavailable
        if (cache) {
            return cache.events;
        }
        throw error;
    }
}

async function loadNasaEvents() {
    const containerSelector = "#events-container";

    try {
        const nasaEventsData = await fetchEvents();

        displayNasaEvents(nasaEventsData, containerSelector);
    } catch (error) {
        console.error("Error loading NASA events:", error);

        const container = document.querySelector(containerSelector);
        if (container) {
            showStatus(container, "Unable to load events. Please try again later.");
        }
    }
}

// 4. Initialize application
loadNasaEvents();
