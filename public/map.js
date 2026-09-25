const API_URL = '/api/pins';

document.addEventListener('DOMContentLoaded', () => {

    let allPins = [];
    let mapMarkers = {};
    let activeFilter = 'all';
    let searchQuery = '';

    let selectedCategory = '';
    let base64Image = null;
    let placementMarker = null;

    const southwest = L.latLng(0.0, 58.0);
    const northeast = L.latLng(46.0, 106.0);
    const indiaBounds = L.latLngBounds(southwest, northeast);

    const map = L.map('map', {
        attributionControl: false,
        zoomControl: false,
        maxBounds: indiaBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 5,
        maxZoom: 18
    });

    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
    const leftToggleBtn = document.getElementById('left-toggle-btn');
    const rightToggleBtn = document.getElementById('right-toggle-btn');

    function centerMapOnIndia() {
        const isLeftOpen = leftPanel && !leftPanel.classList.contains('closed');
        const isRightOpen = rightPanel && !rightPanel.classList.contains('closed');

        if (window.innerWidth > 980) {
            const padLeft = isLeftOpen ? 410 : 40;
            const padRight = isRightOpen ? 440 : 40;
            map.fitBounds(indiaBounds, {
                paddingTopLeft: [padLeft, 40],
                paddingBottomRight: [padRight, 40]
            });
        } else {
            map.fitBounds(indiaBounds, {
                padding: [20, 20]
            });
        }
    }

    centerMapOnIndia();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(centerMapOnIndia, 250);
    });

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&hl=en&gl=IN&x={x}&y={y}&z={z}', {
        subdomains: '0123',
        updateWhenIdle: false,
        updateWhenZooming: true,
        keepBuffer: 12,
        attribution: '&copy; Google Maps'
    }).addTo(map);

    const createSvgMarker = (color) => {
        const svgTemplate = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="30" height="38">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12zm0 17c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z" fill="${color}"/>
                <circle cx="12" cy="12" r="4" fill="#ffffff" />
            </svg>
        `;
        return L.divIcon({
            html: svgTemplate,
            className: 'custom-svg-marker',
            iconSize: [30, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -34]
        });
    };

    const categoryHexColors = {
        landscape: '#2d5a27',
        moment: '#9e2a2b',
        hidden_gem: '#b8860b',
        food: '#d97706',
        heritage: '#582f60'
    };

    function getLikedPins() {
        const name = "liked_pins=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                try {
                    return JSON.parse(c.substring(name.length, c.length));
                } catch (e) {
                    return [];
                }
            }
        }
        return [];
    }

    function addLikedPin(pinId) {
        const liked = getLikedPins();
        if (!liked.includes(pinId)) {
            liked.push(Number(pinId));
            const d = new Date();
            d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
            document.cookie = "liked_pins=" + JSON.stringify(liked) + ";expires=" + d.toUTCString() + ";path=/";
        }
    }

    const pinForm = document.getElementById('pin-form');
    const titleInput = document.getElementById('title');
    const latInput = document.getElementById('lat');
    const lngInput = document.getElementById('lng');
    const coordsText = document.getElementById('coords-text');
    const captionTextarea = document.getElementById('caption');
    const categoryChips = document.querySelectorAll('#category-chips .chip');
    const categoryInput = document.getElementById('category-input');
    const pinColorInput = document.getElementById('pin-color');
    const colorPickerValue = document.getElementById('color-picker-value');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('preview-img');
    const removePreviewBtn = document.getElementById('btn-remove-preview');
    const submitBtn = document.getElementById('btn-submit');
    const statusIndicator = document.getElementById('status-indicator');

    function updateCoordsDisplay(lat, lng) {
        if (lat !== undefined && lng !== undefined) {
            const latVal = typeof lat === 'number' ? lat : parseFloat(lat);
            const lngVal = typeof lng === 'number' ? lng : parseFloat(lng);
            latInput.value = latVal.toFixed(6);
            lngInput.value = lngVal.toFixed(6);
            if (coordsText) {
                coordsText.textContent = `${latVal.toFixed(4)}, ${lngVal.toFixed(4)}`;
            }
        } else {
            latInput.value = '';
            lngInput.value = '';
            if (coordsText) {
                coordsText.textContent = 'No location selected (Click map)';
            }
        }
    }

    map.on('click', async (e) => {
        const { lat, lng } = e.latlng;

        updateCoordsDisplay(lat, lng);

        if (placementMarker) {
            placementMarker.setLatLng(e.latlng);
        } else {
            placementMarker = L.marker(e.latlng, {
                icon: createSvgMarker(pinColorInput.value),
                draggable: true
            }).addTo(map);

            placementMarker.on('drag', () => {
                const pos = placementMarker.getLatLng();
                updateCoordsDisplay(pos.lat, pos.lng);
            });

            placementMarker.on('dragend', () => {
                const pos = placementMarker.getLatLng();
                fetchLocationName(pos.lat, pos.lng);
            });
        }

        fetchLocationName(lat, lng);
    });

    async function fetchLocationName(lat, lng) {
        titleInput.value = "Locating...";
        try {
            const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                const parts = data.display_name.split(',');

                const cleanName = parts.slice(0, 3).map(p => p.trim()).join(', ');
                titleInput.value = cleanName;
            } else if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.suburb || data.address.village || data.address.county || data.address.state || "";
                titleInput.value = city;
            } else {
                titleInput.value = "";
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
            titleInput.value = "";
        }
    }

    let debounceTimeout = null;
    titleInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const val = titleInput.value.trim();
            if (val.length >= 3) {
                geocodeDestination(val);
            }
        }, 1000);
    });

    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(debounceTimeout);
            const val = titleInput.value.trim();
            if (val.length >= 3) {
                geocodeDestination(val);
            }
        }
    });

    async function geocodeDestination(name) {
        showStatus(`Locating coordinates for: ${name}...`, 'loading');
        try {
            const res = await fetch(`/api/geocode/forward?q=${encodeURIComponent(name)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);

                updateCoordsDisplay(lat, lng);

                const latlng = [lat, lng];
                if (placementMarker) {
                    placementMarker.setLatLng(latlng);
                } else {
                    placementMarker = L.marker(latlng, {
                        icon: createSvgMarker(pinColorInput.value),
                        draggable: true
                    }).addTo(map);

                    placementMarker.on('drag', () => {
                        const pos = placementMarker.getLatLng();
                        updateCoordsDisplay(pos.lat, pos.lng);
                    });

                    placementMarker.on('dragend', () => {
                        const pos = placementMarker.getLatLng();
                        fetchLocationName(pos.lat, pos.lng);
                    });
                }

                map.flyTo(latlng, 17, { duration: 2.0 });
                showStatus('Located destination on map!', 'success');
            } else {
                showStatus('Could not resolve coordinates for this place. Feel free to click map directly.', 'error');
                setTimeout(() => {
                    statusIndicator.className = 'status-indicator';
                    statusIndicator.textContent = '';
                }, 3000);
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
            showStatus('Error looking up location coordinates.', 'error');
        }
    }

    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            selectedCategory = chip.dataset.category;
            categoryInput.value = selectedCategory;

            const catColor = categoryHexColors[selectedCategory];
            if (catColor && pinColorInput) {
                pinColorInput.value = catColor;
                if (colorPickerValue) {
                    colorPickerValue.textContent = catColor;
                }
                if (placementMarker) {
                    placementMarker.setIcon(createSvgMarker(catColor));
                }
            }
        });
    });

    if (pinColorInput) {
        pinColorInput.addEventListener('input', (e) => {
            const chosenColor = e.target.value;
            if (colorPickerValue) {
                colorPickerValue.textContent = chosenColor;
            }
            if (placementMarker) {
                placementMarker.setIcon(createSvgMarker(chosenColor));
            }
        });
    }

    uploadZone.addEventListener('click', (e) => {
        if (e.target !== removePreviewBtn) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showStatus('File is too large. Enforce a 5MB limit.', 'error');
                fileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                base64Image = event.target.result;
                previewImg.src = base64Image;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    removePreviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        base64Image = null;
        fileInput.value = '';
        previewContainer.style.display = 'none';
        previewImg.src = '';
    });

    pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const latVal = latInput.value;
        const lngVal = lngInput.value;
        const category = categoryInput.value;
        const caption = captionTextarea.value.trim();

        if (!latVal || !lngVal) {
            showStatus('Please click on the map or type a valid location to get coordinates first.', 'error');
            return;
        }

        const lat = Number(latVal);
        const lng = Number(lngVal);

        if (!category) {
            showStatus('Please select a category.', 'error');
            return;
        }

        submitBtn.disabled = true;
        showStatus('Sharing your adventure with the community...', 'loading');

        const payload = {
            title,
            lat,
            lng,
            category,
            caption,
            image: base64Image,
            color: pinColorInput.value
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                showStatus('Your travel experience has been pinned!', 'success');
                resetForm();

                if (placementMarker) {
                    map.removeLayer(placementMarker);
                    placementMarker = null;
                }

                await loadPins();
                document.getElementById('feed-container').scrollTop = 0;
            } else {
                showStatus(data.error?.message || 'Failed to submit pin.', 'error');
                submitBtn.disabled = false;
            }
        } catch (err) {
            console.error('Error submitting pin:', err);
            showStatus('Network error. Failed to save experience.', 'error');
            submitBtn.disabled = false;
        }
    });

    const resetForm = () => {
        pinForm.reset();
        selectedCategory = '';
        categoryInput.value = '';
        categoryChips.forEach(c => c.classList.remove('active'));
        base64Image = null;
        fileInput.value = '';
        previewContainer.style.display = 'none';
        previewImg.src = '';
        submitBtn.disabled = false;
        updateCoordsDisplay();
        if (pinColorInput) {
            pinColorInput.value = '#2d5a27';
        }
        if (colorPickerValue) {
            colorPickerValue.textContent = '#2d5a27';
        }
    };

    function showStatus(text, type) {
        statusIndicator.className = `status-indicator ${type}`;
        statusIndicator.textContent = text;
        if (type === 'success') {
            setTimeout(() => {
                statusIndicator.className = 'status-indicator';
                statusIndicator.textContent = '';
            }, 4000);
        }
    }

    async function loadPins() {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.success) {
                allPins = data.data;
                renderPinsAndFeed();
            } else {
                console.error("Failed to load pins", data.message);
                document.getElementById('feed-container').innerHTML =
                    `<div class="no-pins-placeholder">Error loading adventures: ${data.message}</div>`;
            }
        } catch (err) {
            console.error("Error loading pins:", err);
            document.getElementById('feed-container').innerHTML =
                '<div class="no-pins-placeholder">Could not connect to travel service.</div>';
        }
    }

    const renderPinsAndFeed = () => {
        Object.values(mapMarkers).forEach(marker => map.removeLayer(marker));
        mapMarkers = {};

        const filteredPins = allPins.filter(pin => {
            const matchesCategory = activeFilter === 'all' || pin.category === activeFilter;
            const matchesSearch = pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 pin.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 pin.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        const likedPins = getLikedPins();

        filteredPins.forEach(pin => {
            const markerColor = pin.color || categoryHexColors[pin.category] || '#2d5a27';
            const marker = L.marker([pin.lat, pin.lng], {
                icon: createSvgMarker(markerColor)
            }).addTo(map);

            const popupContent = createPopupContent(pin, likedPins.includes(pin.id));
            marker.bindPopup(popupContent, { offset: L.point(160, 90), closeButton: true });

            mapMarkers[pin.id] = marker;

            marker.on('click', () => {
                map.flyTo([pin.lat, pin.lng], 14, { duration: 1.5 });
            });

            marker.on('popupopen', () => {
                const likeBtn = document.querySelector(`.btn-like[data-id="${pin.id}"]`);
                if (likeBtn && !likedPins.includes(pin.id)) {
                    likeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        likePin(pin.id);
                    });
                }
            });
        });

        const feedContainer = document.getElementById('feed-container');
        if (filteredPins.length === 0) {
            feedContainer.innerHTML = '<div class="no-pins-placeholder">No adventures matching current filters.</div>';
            return;
        }

        feedContainer.innerHTML = filteredPins.map(pin => {
            const imageHtml = pin.image_path
                ? `<img src="${pin.image_path}" alt="${pin.title}">`
                : `<div style="height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #eae3cd, #d4cca7); color:#7d7260; font-size:2rem;"></div>`;

            return `
                <div class="gallery-card" data-id="${pin.id}">
                    <div class="gallery-card-img">
                        ${imageHtml}
                        <span class="card-badge" data-category="${pin.category}">${pin.category.replace('_', ' ')}</span>
                    </div>
                    <div class="card-content">
                        <div class="card-header">
                            <h3 class="card-title">${escapeHTML(pin.title)}</h3>
                            <div class="likes-counter">
                                <span class="likes-text">Likes:</span>
                                <span class="likes-count-${pin.id}">${pin.likes}</span>
                            </div>
                        </div>
                        <p class="card-caption">${escapeHTML(pin.caption)}</p>
                        <div class="card-footer">
                            <span>Coords: ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}</span>
                            <span>${new Date(pin.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.gallery-card').forEach(card => {
            card.addEventListener('click', () => {
                const pinId = card.dataset.id;
                const pin = allPins.find(p => p.id == pinId);
                if (pin && mapMarkers[pinId]) {

                    if (rightPanel && rightToggleBtn) {
                        rightPanel.classList.add('closed');
                        rightToggleBtn.classList.remove('panel-open');
                    }

                    map.flyTo([pin.lat, pin.lng], 14, { duration: 2.0 });

                    setTimeout(() => {
                        mapMarkers[pinId].openPopup();
                    }, 400);
                }
            });
        });
    };

    const createPopupContent = (pin, isLiked) => {
        const imageMarkup = pin.image_path
            ? `<div class="popup-img"><img src="${pin.image_path}" alt="${pin.title}"></div>`
            : '';

        const likeButtonMarkup = isLiked
            ? `<button type="button" class="btn-like" data-id="${pin.id}" style="background:var(--cat-moment); color:white; border-color:var(--cat-moment); cursor:default; opacity:0.85;" disabled>
                 Liked: <span class="likes-count-${pin.id}">${pin.likes}</span>
               </button>`
            : `<button type="button" class="btn-like" data-id="${pin.id}">
                 Like: <span class="likes-count-${pin.id}">${pin.likes}</span>
               </button>`;

        return `
            <div class="popup-card">
                ${imageMarkup}
                <div class="popup-body">
                    <div class="popup-header">
                        <span class="popup-badge" data-category="${pin.category}">${pin.category.replace('_', ' ')}</span>
                        ${likeButtonMarkup}
                    </div>
                    <h3 class="popup-title">${escapeHTML(pin.title)}</h3>
                    <p class="popup-desc">${escapeHTML(pin.caption)}</p>
                    <div class="popup-meta">
                        <span style="color:var(--text-secondary);">By explorer</span>
                        <span style="color:var(--text-secondary); font-size:0.7rem;">${pin.lat.toFixed(3)}, ${pin.lng.toFixed(3)}</span>
                    </div>
                </div>
            </div>
        `;
    };

    async function likePin(pinId) {
        if (getLikedPins().includes(Number(pinId))) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/${pinId}/like`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                const pinIndex = allPins.findIndex(p => p.id == pinId);
                if (pinIndex !== -1) {
                    allPins[pinIndex].likes = data.data.likes;
                }

                addLikedPin(pinId);
                renderPinsAndFeed();

                document.querySelectorAll(`.likes-count-${pinId}`).forEach(el => {
                    el.textContent = data.data.likes;
                    el.parentElement.style.transform = 'scale(1.25)';
                    el.parentElement.style.transition = 'transform 0.15s ease';
                    setTimeout(() => {
                        el.parentElement.style.transform = 'scale(1.0)';
                    }, 150);
                });
            }
        } catch (err) {
            console.error('Failed to register like:', err);
        }
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const filterButtons = document.querySelectorAll('#gallery-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilter = btn.dataset.filter;
            renderPinsAndFeed();
        });
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderPinsAndFeed();
    });

    if (leftToggleBtn && leftPanel) {
        leftToggleBtn.addEventListener('click', () => {
            const isClosed = leftPanel.classList.toggle('closed');
            leftToggleBtn.classList.toggle('panel-open', !isClosed);
        });
    }

    if (rightToggleBtn && rightPanel) {
        rightToggleBtn.addEventListener('click', () => {
            const isClosed = rightPanel.classList.toggle('closed');
            rightToggleBtn.classList.toggle('panel-open', !isClosed);
        });
    }

    const island = document.getElementById('dynamic-island');
    const islandTitle = document.getElementById('island-title');
    const islandZoomIn = document.getElementById('island-zoom-in');
    const islandZoomOut = document.getElementById('island-zoom-out');
    const islandReset = document.getElementById('island-reset');

    if (island) {
        map.on('zoomend', () => {
            const currentZoom = map.getZoom();
            if (currentZoom !== 5) {
                if (islandTitle) {
                    islandTitle.textContent = `Map Zoom: ${currentZoom - 5}`;
                }
                island.classList.add('active');
            } else {
                island.classList.remove('active');
            }
        });

        if (islandZoomIn) {
            islandZoomIn.addEventListener('click', () => {
                map.zoomIn();
            });
        }

        if (islandZoomOut) {
            islandZoomOut.addEventListener('click', () => {
                map.zoomOut();
            });
        }

        if (islandReset) {
            islandReset.addEventListener('click', () => {
                centerMapOnIndia();
            });
        }
    }

    const contextMenu = document.getElementById('custom-context-menu');
    const contextPin = document.getElementById('context-pin');
    const contextCenter = document.getElementById('context-center');
    const contextZoomIn = document.getElementById('context-zoom-in');
    const contextZoomOut = document.getElementById('context-zoom-out');

    let contextLatLng = null;

    map.on('contextmenu', (e) => {
        contextLatLng = e.latlng;
        if (contextMenu) {
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.containerPoint.x}px`;
            contextMenu.style.top = `${e.containerPoint.y}px`;
        }
    });

    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    if (contextPin) {
        contextPin.addEventListener('click', () => {
            if (contextLatLng) {
                const lat = contextLatLng.lat;
                const lng = contextLatLng.lng;

                if (leftPanel && leftToggleBtn && leftPanel.classList.contains('closed')) {
                    leftPanel.classList.remove('closed');
                    leftToggleBtn.classList.add('panel-open');
                }

                updateCoordsDisplay(lat, lng);

                if (placementMarker) {
                    placementMarker.setLatLng(contextLatLng);
                } else {
                    placementMarker = L.marker(contextLatLng, {
                        icon: createSvgMarker(pinColorInput.value),
                        draggable: true
                    }).addTo(map);

                    placementMarker.on('drag', () => {
                        const pos = placementMarker.getLatLng();
                        updateCoordsDisplay(pos.lat, pos.lng);
                    });

                    placementMarker.on('dragend', () => {
                        const pos = placementMarker.getLatLng();
                        fetchLocationName(pos.lat, pos.lng);
                    });
                }

                fetchLocationName(lat, lng);
            }
            if (contextMenu) contextMenu.style.display = 'none';
        });
    }

    if (contextCenter) {
        contextCenter.addEventListener('click', () => {
            centerMapOnIndia();
            if (contextMenu) contextMenu.style.display = 'none';
        });
    }

    if (contextZoomIn) {
        contextZoomIn.addEventListener('click', () => {
            map.zoomIn();
            if (contextMenu) contextMenu.style.display = 'none';
        });
    }

    if (contextZoomOut) {
        contextZoomOut.addEventListener('click', () => {
            map.zoomOut();
            if (contextMenu) contextMenu.style.display = 'none';
        });
    }

    loadPins();
});
