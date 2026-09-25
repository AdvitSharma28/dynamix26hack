const API_URL = 'http://localhost:5000/api';
let map;
let sourceMarker = null;
let destMarker = null;
let routeLine = null;

const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value || 'Rs 0';
    return `Rs ${amount.toLocaleString('en-IN')}`;
};

document.addEventListener('DOMContentLoaded', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);

    document.getElementById('departDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('returnDate').value = nextWeek.toISOString().split('T')[0];

    initializeMap();
    setupForm();
});

function initializeMap() {
    map = L.map('map', {
        zoomControl: false
    }).setView([22.5937, 78.9629], 5);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&hl=en&gl=IN&x={x}&y={y}&z={z}', {
        subdomains: '0123',
        updateWhenIdle: false,
        updateWhenZooming: true,
        keepBuffer: 12,
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

    const updateLine = () => {
        if (routeLine) map.removeLayer(routeLine);
        if (sourceMarker && destMarker) {
            routeLine = L.polyline([sourceMarker.getLatLng(), destMarker.getLatLng()], {
                color: '#2d5a27',
                weight: 4,
                dashArray: '8, 10'
            }).addTo(map);
            map.fitBounds(routeLine.getBounds(), { padding: [55, 55] });
        }
    };

    map.on('click', async (e) => {
        const { lat, lng } = e.latlng;

        if (!sourceMarker || (sourceMarker && destMarker)) {

            if (sourceMarker) map.removeLayer(sourceMarker);
            if (destMarker) map.removeLayer(destMarker);
            if (routeLine) map.removeLayer(routeLine);
            destMarker = null;
            routeLine = null;

            sourceMarker = L.marker([lat, lng], { icon: greenIcon }).addTo(map);
            document.getElementById('source').value = 'Locating...';
            const city = await getCityFromCoords(lat, lng);
            document.getElementById('source').value = city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } else {

            destMarker = L.marker([lat, lng], { icon: redIcon }).addTo(map);
            document.getElementById('destination').value = 'Locating...';
            const city = await getCityFromCoords(lat, lng);
            document.getElementById('destination').value = city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            updateLine();
        }
    });
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

function setupForm() {
    const form = document.getElementById('planner-form');
    const submitBtn = document.getElementById('btn-submit');
    const indicator = document.getElementById('status-indicator');
    const rightPanel = document.getElementById('right-panel');
    const resultContainer = document.getElementById('result-container');

    document.getElementById('close-results').addEventListener('click', () => {
        rightPanel.classList.add('closed');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        indicator.className = 'status-indicator loading';
        indicator.textContent = 'AI is crafting your journey...';
        rightPanel.classList.add('closed');

        const payload = {
            source: document.getElementById('source').value,
            destination: document.getElementById('destination').value,
            departDate: document.getElementById('departDate').value,
            returnDate: document.getElementById('returnDate').value,
            budgetMin: Number(document.getElementById('budgetMin').value),
            budgetMax: Number(document.getElementById('budgetMax').value),
            travelers: Number(document.getElementById('travelers').value),
            interests: ['culture', 'sightseeing'],
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
                indicator.className = 'status-indicator error';
                indicator.textContent = result.error?.message || 'Something went wrong.';
            } else {
                indicator.className = 'status-indicator';
                resultContainer.innerHTML = renderItinerary(result.data, payload);
                rightPanel.classList.remove('closed');
            }
        } catch (error) {
            console.error('Error generating plan', error);
            indicator.className = 'status-indicator error';
            indicator.textContent = `Error: ${error.message}`;
        } finally {
            submitBtn.disabled = false;
        }
    });
}

function renderItinerary(trip, payload) {
    if (!trip) return '<p>Failed to parse itinerary.</p>';

    const budget = trip.budgetBreakdown || { transport: 0, stay: 0, food: 0, activities: 0 };

    let daysHtml = (trip.dailyPlan || []).map(day => `
        <div class="timeline-day">
            <h3 class="day-title">Day ${day.day}</h3>

            <div class="day-activity">
                <strong>Morning:</strong> ${day.morning?.activity || 'Free time'}
                <span class="cost-tag">(${formatCurrency(day.morning?.cost)})</span>
            </div>

            <div class="day-activity">
                <strong>Afternoon:</strong> ${day.afternoon?.activity || 'Free time'}
                <span class="cost-tag">(${formatCurrency(day.afternoon?.cost)})</span>
            </div>

            <div class="day-activity">
                <strong>Evening:</strong> ${day.evening?.activity || 'Free time'}
                <span class="cost-tag">(${formatCurrency(day.evening?.cost)})</span>
            </div>
        </div>
    `).join('');

    return `
        <div class="budget-card">
            <h3>Trip Overview</h3>
            <div class="budget-row">
                <span>Estimated Total:</span>
                <strong>${formatCurrency(trip.totalEstimatedCost)}</strong>
            </div>
            <div class="budget-row">
                <span>Travelers:</span>
                <strong>${payload.travelers}</strong>
            </div>
            <div class="budget-row">
                <span>Best Transport:</span>
                <strong style="text-transform: capitalize;">${trip.transport?.recommendedMode || 'Unknown'}</strong>
            </div>
        </div>

        <div class="budget-card">
            <h3>Budget Breakdown</h3>
            <div class="budget-row"><span>Transport</span> <strong>${formatCurrency(budget.transport)}</strong></div>
            <div class="budget-row"><span>Stay</span> <strong>${formatCurrency(budget.stay)}</strong></div>
            <div class="budget-row"><span>Food</span> <strong>${formatCurrency(budget.food)}</strong></div>
            <div class="budget-row"><span>Activities</span> <strong>${formatCurrency(budget.activities)}</strong></div>
        </div>

        <h3 class="section-title" style="margin-top: 20px; font-size: 1.5rem;">Daily Plan</h3>
        <div class="timeline">
            ${daysHtml}
        </div>

        <div class="budget-card" style="margin-top: 20px;">
            <h3>Food & Stay</h3>
            <p style="margin-bottom: 10px;"><strong>Hotels:</strong> ${(trip.stay?.hotelSuggestions || []).map(h => h.name).join(', ') || 'N/A'}</p>
            <p><strong>Food:</strong> ${(trip.foodRecommendations || []).join(', ') || 'N/A'}</p>
        </div>
    `;
}
