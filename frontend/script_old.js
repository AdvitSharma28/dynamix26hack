const API_URL = 'http://localhost:5000/api';

const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value || 'Rs 0';
    return `Rs ${amount.toLocaleString('en-IN')}`;
};

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const getTripDays = () => {
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    if (!departDate || !returnDate) return 0;
    const diff = new Date(returnDate) - new Date(departDate);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const updateOverview = () => {
    const source = document.getElementById('source').value || 'Gurgaon';
    const destination = document.getElementById('destination').value || 'Mumbai';
    const budgetMin = document.getElementById('budgetMin').value || 5000;
    const budgetMax = document.getElementById('budgetMax').value || 15000;
    const travelers = document.getElementById('travelers').value || 2;
    const transport = document.getElementById('preferredTransport');
    const transportLabel = transport.options[transport.selectedIndex]?.text || 'AI Recommendation (Any)';
    const days = getTripDays();
    const nights = Math.max(0, days - 1);

    document.getElementById('hero-meta').textContent =
        `${travelers} Travelers  -  ${formatDate(document.getElementById('departDate').value)} - ${formatDate(document.getElementById('returnDate').value)}  -  ${source} -> ${destination}  -  Transport: ${transportLabel}`;
};

document.addEventListener('DOMContentLoaded', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);

    document.getElementById('departDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('returnDate').value = nextWeek.toISOString().split('T')[0];

    document.querySelectorAll('#planner-form input, #planner-form select').forEach((field) => {
        field.addEventListener('input', updateOverview);
        field.addEventListener('change', updateOverview);
    });

    initializeMap();
    updateOverview();
});

function initializeMap() {
    const map = L.map('map', {
        attributionControl: false,
        zoomControl: false
    }).setView([20.5937, 78.9629], 5);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=en&gl=IN&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps'
    }).addTo(map);

    const createIcon = (color) => L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const greenIcon = createIcon('green');
    const redIcon = createIcon('red');
    let sourceMarker = null;
    let destMarker = null;
    let routeLine = null;

    const updateLine = () => {
        if (routeLine) map.removeLayer(routeLine);
        if (sourceMarker && destMarker) {
            routeLine = L.polyline([sourceMarker.getLatLng(), destMarker.getLatLng()], {
                color: '#ed2a08',
                weight: 4,
                dashArray: '8, 10'
            }).addTo(map);
        }
    };

    const handleDrag = (marker, inputId) => {
        const { lat, lng } = marker.getLatLng();
        document.getElementById(inputId).value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        updateLine();
        updateOverview();
    };

    const handleDragEnd = async (marker, inputId) => {
        const { lat, lng } = marker.getLatLng();
        document.getElementById(inputId).value = 'Locating...';
        const city = await getCityFromCoords(lat, lng);
        document.getElementById(inputId).value = city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        updateOverview();
    };

    const initMarkers = async (sourceLat, sourceLng) => {
        sourceMarker = L.marker([sourceLat, sourceLng], { icon: greenIcon, draggable: true, title: 'Source' }).addTo(map);
        destMarker = L.marker([19.0760, 72.8777], { icon: redIcon, draggable: true, title: 'Destination' }).addTo(map);

        sourceMarker.on('drag', () => handleDrag(sourceMarker, 'source'));
        sourceMarker.on('dragend', () => handleDragEnd(sourceMarker, 'source'));
        destMarker.on('drag', () => handleDrag(destMarker, 'destination'));
        destMarker.on('dragend', () => handleDragEnd(destMarker, 'destination'));

        updateLine();
        map.fitBounds(routeLine.getBounds(), { padding: [55, 55] });
        handleDragEnd(sourceMarker, 'source');
        handleDragEnd(destMarker, 'destination');
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => initMarkers(pos.coords.latitude, pos.coords.longitude),
            () => initMarkers(28.4595, 77.0266)
        );
    } else {
        initMarkers(28.4595, 77.0266);
    }
}

async function getCityFromCoords(lat, lng) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
        const data = await res.json();
        return data.address.city || data.address.town || data.address.county || data.address.state || 'Unknown Location';
    } catch (error) {
        console.error(error);
        return null;
    }
}

document.getElementById('planner-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const submitBtn = document.getElementById('submit-btn');

    loadingDiv.hidden = false;
    resultDiv.innerHTML = '';
    resultDiv.className = '';
    submitBtn.disabled = true;

    const payload = {
        source: document.getElementById('source').value,
        destination: document.getElementById('destination').value,
        departDate: document.getElementById('departDate').value,
        returnDate: document.getElementById('returnDate').value,
        budgetMin: Number(document.getElementById('budgetMin').value),
        budgetMax: Number(document.getElementById('budgetMax').value),
        travelers: Number(document.getElementById('travelers').value),
        interests: ['culture', 'forts', 'food'],
        preferredTransport: document.getElementById('preferredTransport').value
    };

    try {
        const response = await fetch(`${API_URL}/plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!result.success) {
            resultDiv.innerHTML = `<div class="error-box"><strong>Error:</strong> ${result.error?.message || 'Something went wrong'}</div>`;
        } else {
            resultDiv.innerHTML = renderItinerary(result, payload);
            setupResultTabs();
            document.querySelector('.result-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        console.error('Error generating plan', error);
        resultDiv.innerHTML = `<div class="error-box"><strong>Network Error:</strong> ${error.message}</div>`;
    } finally {
        loadingDiv.hidden = true;
        submitBtn.disabled = false;
    }
});

function renderItinerary(data, payload) {
    const trip = data.data;
    if (!trip) return '<div class="error-box">Failed to load itinerary data.</div>';

    const budget = trip.budgetBreakdown || { transport: 0, stay: 0, food: 0, activities: 0 };
    const totalBreakdown = Object.values(budget).reduce((sum, value) => sum + Number(value || 0), 0) || 1;
    const allTransport = [
        ...(trip.transport?.flight?.options || []).map((item) => ({ mode: 'Flight', title: `${item.airline || 'Airline'} ${item.flightNo || ''}`.trim(), meta: item.duration, fare: item.fareEstimate })),
        ...(trip.transport?.train?.options || []).map((item) => ({ mode: 'Train', title: item.trainName, meta: `${item.class || 'Class'} - ${item.duration || ''}`, fare: item.fareEstimate })),
        ...(trip.transport?.bus?.options || []).map((item) => ({ mode: 'Bus', title: item.operatorName, meta: `${item.busType || 'Bus'} - ${item.duration || ''}`, fare: item.fareEstimate }))
    ];
    const placesCount = Math.max(1, new Set((trip.dailyPlan || []).flatMap((day) => [
        day.morning?.activity,
        day.afternoon?.activity,
        day.evening?.activity
    ].filter(Boolean))).size);
    const bestTravelTime = allTransport[0]?.meta || 'Approx.';
    const aiScore = Math.min(98, Math.max(82, Math.round(88 + placesCount / 2)));
    const days = trip.durationDays || getTripDays();
    const nights = Math.max(0, days - 1);

    return `
        <div class="result-panel">
            <div class="result-top">
                <div>
                    <p class="eyebrow"><span>/02</span> result overview</p>
                    <h2>Plan Highlights</h2>
                    <p class="hero-meta">AI has analysed destination, travel mode, budget, stay, food and daily activities for your route.</p>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <span>View</span>
                        <div class="segmented" role="tablist" aria-label="Plan views">
                            <button class="tab-button active" type="button" data-tab="summary">Summary</button>
                            <button class="tab-button" type="button" data-tab="itinerary">Itinerary</button>
                            <button class="tab-button" type="button" data-tab="cost">Cost Breakup</button>
                            <button class="tab-button" type="button" data-tab="transport">Transport</button>
                        </div>
                    </div>
                    <div class="control-group">
                        <span>Sort by</span>
                        <div class="segmented">
                            <button class="sort-button active" type="button">Recommended</button>
                            <button class="sort-button" type="button">Budget</button>
                            <button class="sort-button" type="button">Duration</button>
                            <button class="sort-button" type="button">Rating</button>
                        </div>
                    </div>
                </div>
            </div>

            <aside class="trip-overview result-overview" aria-label="Trip overview">
                <h2>Trip Overview</h2>
                <dl>
                    <div>
                        <dt>Duration</dt>
                        <dd>${days} Days / ${nights} Nights</dd>
                    </div>
                    <div>
                        <dt>Destination</dt>
                        <dd>${payload.destination}</dd>
                    </div>
                    <div>
                        <dt>Travelers</dt>
                        <dd>${payload.travelers}</dd>
                    </div>
                    <div>
                        <dt>Budget Range</dt>
                        <dd>${formatCurrency(payload.budgetMin)} - ${formatCurrency(payload.budgetMax)}</dd>
                    </div>
                </dl>
            </aside>

            <div class="metrics-grid">
                ${metricCard('Total Estimated Cost', formatCurrency(trip.totalEstimatedCost), 'for full trip', 'wallet')}
                ${metricCard('AI Recommended Score', aiScore.toFixed(1), 'out of 100', 'star', true)}
                ${metricCard('Travel Time', bestTravelTime, 'approx.', 'clock')}
                ${metricCard('Places To Visit', placesCount, 'top attractions', 'map')}
                ${metricCard('AI Confidence', '95%', 'high confidence', 'trend')}
                ${metricCard('Average Rating', '4.6', 'out of 5', 'rating')}
            </div>

            <div class="tab-content active" data-panel="summary">
                <div class="detail-grid">
                    <article class="detail-card">
                        <h3>Trip Snapshot</h3>
                        <p><strong>${payload.source}</strong> to <strong>${payload.destination}</strong></p>
                        <p>${trip.durationDays} days, ${payload.travelers} travelers, ${trip.budgetTier || 'mid'} budget.</p>
                        <p>Recommended transport: ${trip.transport?.recommendedMode || 'AI recommendation'}.</p>
                    </article>
                    <article class="detail-card">
                        <h3>Local Food To Try</h3>
                        <div class="tag-list">
                            ${(trip.foodRecommendations || []).map((food) => `<span class="tag">${food}</span>`).join('') || '<p>No food recommendations found.</p>'}
                        </div>
                    </article>
                    <article class="detail-card">
                        <h3>Stay Suggestions</h3>
                        ${(trip.stay?.hotelSuggestions || []).slice(0, 3).map((hotel) => `<p><strong>${hotel.name}</strong> - ${formatCurrency(hotel.pricePerNight)} / night - Rating ${hotel.rating}</p>`).join('') || '<p>No stay suggestions found.</p>'}
                    </article>
                    <article class="detail-card">
                        <h3>Budget Fit</h3>
                        <p>Total estimate: <strong>${formatCurrency(trip.totalEstimatedCost)}</strong></p>
                        <p>Requested range: ${formatCurrency(payload.budgetMin)} - ${formatCurrency(payload.budgetMax)}</p>
                    </article>
                </div>
            </div>

            <div class="tab-content" data-panel="itinerary">
                <div class="day-list">
                    ${(trip.dailyPlan || []).map((day) => `
                        <article class="day-card">
                            <h3>Day ${day.day} - ${day.date}</h3>
                            ${activityRow('Morning', day.morning)}
                            ${activityRow('Afternoon', day.afternoon)}
                            ${activityRow('Evening', day.evening)}
                        </article>
                    `).join('') || '<div class="detail-card"><p>No daily plan found.</p></div>'}
                </div>
            </div>

            <div class="tab-content" data-panel="cost">
                <div class="cost-grid">
                    ${costCard('Transport', budget.transport)}
                    ${costCard('Stay', budget.stay)}
                    ${costCard('Food', budget.food)}
                    ${costCard('Activities', budget.activities)}
                </div>
                <div class="budget-bar-container">
                    <div class="budget-segment" style="width: ${(budget.transport / totalBreakdown) * 100}%; background: #111;"></div>
                    <div class="budget-segment" style="width: ${(budget.stay / totalBreakdown) * 100}%; background: #ed2a08;"></div>
                    <div class="budget-segment" style="width: ${(budget.food / totalBreakdown) * 100}%; background: #7f7b72;"></div>
                    <div class="budget-segment" style="width: ${(budget.activities / totalBreakdown) * 100}%; background: #d8d4cc;"></div>
                </div>
            </div>

            <div class="tab-content" data-panel="transport">
                <div class="transport-grid">
                    ${allTransport.map((item) => `
                        <article class="transport-card">
                            <h3>${item.mode}</h3>
                            <p><strong>${item.title || 'Option'}</strong></p>
                            <p>${item.meta || 'Duration unavailable'}</p>
                            <p>${formatCurrency(item.fare)}</p>
                        </article>
                    `).join('') || '<div class="detail-card"><p>No transport options found.</p></div>'}
                </div>
            </div>
        </div>

        <div class="next-steps">
            <div>
                <p class="eyebrow"><span>/03</span> next steps</p>
                <h2>What's Next?</h2>
                <p>You can review, edit, or regenerate your plan.</p>
            </div>
            <button class="primary-action" type="button" data-show-itinerary>View Detailed Itinerary -></button>
        </div>
    `;
}

function metricCard(label, value, note, icon, hot = false) {
    const icons = {
        wallet: '&#9634;',
        star: '&#9734;',
        clock: '&#9716;',
        map: '&#9633;',
        trend: '&#8764;',
        rating: '&#9734;'
    };

    return `
        <article class="metric-card ${hot ? 'hot' : ''}">
            <div>
                <span class="metric-label">${label}</span>
                <strong class="metric-value">${value}</strong>
                <span class="metric-note">${note}</span>
            </div>
            <span class="metric-icon" aria-hidden="true">${icons[icon] || '+'}</span>
        </article>
    `;
}

function activityRow(time, activity) {
    return `
        <div class="activity-row">
            <span class="activity-time">${time}</span>
            <span>${activity?.activity || 'Open exploration time'}</span>
            <span class="activity-cost">${formatCurrency(activity?.cost || 0)}</span>
        </div>
    `;
}

function costCard(label, value) {
    return `
        <article class="cost-card">
            <span class="cost-label">${label}</span>
            <strong class="cost-value">${formatCurrency(value)}</strong>
        </article>
    `;
}

function setupResultTabs() {
    const result = document.getElementById('result');
    const tabButtons = result.querySelectorAll('.tab-button');
    const panels = result.querySelectorAll('.tab-content');

    const showTab = (tab) => {
        tabButtons.forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
        panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === tab));
    };

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => showTab(button.dataset.tab));
    });

    result.querySelectorAll('.sort-button').forEach((button) => {
        button.addEventListener('click', () => {
            result.querySelectorAll('.sort-button').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
        });
    });

    const itineraryButton = document.querySelector('[data-show-itinerary]');
    if (itineraryButton) {
        itineraryButton.addEventListener('click', () => {
            showTab('itinerary');
            result.querySelector('[data-panel="itinerary"]').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
}
