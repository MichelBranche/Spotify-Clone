/* ═══════════════════════════════════════════
   SPOTIFY CLONE — FULL LOGIC
   ═══════════════════════════════════════════ */

const API = "https://striveschool-api.herokuapp.com/api/deezer/";

// DOM References
const contentArea = document.getElementById('content-area');
const mainView = document.getElementById('main-view');
const audioEngine = document.getElementById('audio-engine');
const playerBar = document.getElementById('player-bar');
const searchInput = document.getElementById('search-input');

// Player DOM
const nowCover = document.getElementById('now-cover');
const nowTitle = document.getElementById('now-title');
const nowArtist = document.getElementById('now-artist');
const nowLike = document.getElementById('now-like');
const playIcon = document.getElementById('play-icon');
const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnShuffle = document.getElementById('btn-shuffle');
const btnRepeat = document.getElementById('btn-repeat');
const progressFill = document.getElementById('progress-fill');
const progressWrapper = document.getElementById('progress-wrapper');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const volFill = document.getElementById('vol-fill');
const volWrapper = document.getElementById('vol-wrapper');
const btnVolIcon = document.getElementById('btn-vol-icon');

// State
let currentQueue = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0 = off, 1 = all, 2 = one
let likedSongs = JSON.parse(localStorage.getItem('spotify-likes')) || [];
let currentVolume = parseFloat(localStorage.getItem('spotify-volume')) || 1;
let navHistory = [];
let navIndex = -1;
let searchTimeout;

// Auth & Playlists State
let currentUser = localStorage.getItem('spotify_user') || null;
let userPlaylists = JSON.parse(localStorage.getItem('spotify_playlists')) || [];
let trackToAdd = null;

// SVG Icons
const SVG = {
    play: '<svg class="play-icon" viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>',
    pause: '<svg viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>',
    playCard: '<svg viewBox="0 0 24 24"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/></svg>',
    heartOutline: '<svg viewBox="0 0 16 16"><path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2zm3.158.252A3.082 3.082 0 0 0 2.49 7.23l.005.005 5.303 6.32c.069.084.207.084.276 0l5.308-6.325A3.042 3.042 0 0 0 14.056 3.7 3.117 3.117 0 0 0 11.882 2.3a3.073 3.073 0 0 0-2.276.921L8.8 4.028a1.13 1.13 0 0 1-1.6 0l-.804-.806A3.073 3.073 0 0 0 4.848 2.252z"/></svg>',
    heartFilled: '<svg viewBox="0 0 16 16"><path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.38 5.602l5.307 6.327c.497.594 1.39.594 1.886 0l5.307-6.327a4.18 4.18 0 0 0 .174-3.326z"/></svg>',
    clock: '<svg viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/><path fill="currentColor" d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"/></svg>',
    moreH: '<svg viewBox="0 0 16 16"><path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>',
    verified: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#3d91f4" d="M10.814.5a1.658 1.658 0 0 1 2.372 0l1.616 1.616a1.658 1.658 0 0 0 1.178.487h2.284a1.658 1.658 0 0 1 1.657 1.658v2.284c0 .44.175.862.487 1.177l1.093 1.94a1.658 1.658 0 0 1 0 2.372L20.408 13.65a1.658 1.658 0 0 0-.487 1.177v2.284a1.658 1.658 0 0 1-1.657 1.658h-2.284a1.658 1.658 0 0 0-1.178.487l-1.616 1.616a1.658 1.658 0 0 1-2.372 0l-1.616-1.616a1.658 1.658 0 0 0-1.177-.487H5.737A1.658 1.658 0 0 1 4.08 17.11v-2.284c0-.44-.176-.862-.487-1.177L1.977 12a1.658 1.658 0 0 1 0-2.372l1.616-1.616c.311-.315.487-.737.487-1.177V4.551A1.658 1.658 0 0 1 5.737 2.893h2.284c.44 0 .862-.176 1.177-.487L10.814.5z"/><path fill="#fff" d="M16.023 7.643a.75.75 0 0 1 .084 1.057l-5.5 6.5a.75.75 0 0 1-1.097.044l-2.5-2.5a.75.75 0 0 1 1.06-1.061l1.928 1.929 4.968-5.885a.75.75 0 0 1 1.057-.084z"/></svg>',
    playSmall: '<svg viewBox="0 0 16 16" width="16" height="16"><path fill="white" d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>',
    plus: '<svg viewBox="0 0 16 16"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>',
    playlist: '<svg viewBox="0 0 24 24"><path d="M14.516 4H3v2h11.516V4zm0 5H3v2h11.516V9zm-5.5 5H3v2h5.516v-2zm7.146-2.146a.5.5 0 0 1 .708.708l-5.5 5.5a.5.5 0 0 1-.708 0l-2.5-2.5a.5.5 0 0 1 .708-.708l2.146 2.147 5.146-5.147z"/></svg>'
};

/* ═══════════════════════════════════════════
   AUTH & PLAYLISTS
   ═══════════════════════════════════════════ */
function updateAuthUI() {
    const authSect = document.getElementById('auth-section');
    if (currentUser) {
        authSect.innerHTML = `<div class="user-profile-badge" onclick="logout()" title="Logout">${currentUser.charAt(0).toUpperCase()}</div>`;
    } else {
        authSect.innerHTML = `
            <button class="btn-signup" onclick="openLoginModal()">Iscriviti</button>
            <button class="btn-login" id="btn-login" onclick="openLoginModal()">Accedi</button>
        `;
    }
}

function renderSidebarPlaylists() {
    const sbContent = document.querySelector('.sidebar-content');
    if (userPlaylists.length === 0) {
        sbContent.innerHTML = `
            <div class="sidebar-card">
                <h4>Crea la tua prima playlist</h4>
                <p>È facile, ti aiuteremo</p>
                <button class="sidebar-card-btn" onclick="openLoginModal()">Crea playlist</button>
            </div>
            <div class="sidebar-card">
                <h4>Cerca qualche podcast da seguire</h4>
                <p>Ti aggiorneremo sui nuovi episodi</p>
                <button class="sidebar-card-btn">Sfoglia i podcast</button>
            </div>`;
    } else {
        let html = '';
        userPlaylists.forEach(pl => {
            html += `
                <div class="playlist-item">
                    ${SVG.playlist}
                    <span style="color:white;font-weight:700;font-size:14px;">${escapeHtml(pl.name)}</span>
                    <span style="color:var(--text-secondary);font-size:12px;margin-left:auto;">${pl.tracks.length} brani</span>
                </div>`;
        });
        sbContent.innerHTML = html;
    }
}

// Login
function openLoginModal() { document.getElementById('login-modal').classList.add('active'); }
function closeLoginModal() { 
    document.getElementById('login-modal').classList.remove('active'); 
    document.getElementById('login-username').value = '';
}
function handleLogin() {
    const name = document.getElementById('login-username').value.trim();
    if (name) {
        currentUser = name;
        localStorage.setItem('spotify_user', name);
        closeLoginModal();
        updateAuthUI();
    }
}
function logout() {
    currentUser = null;
    localStorage.removeItem('spotify_user');
    updateAuthUI();
}

// Playlist Modal
function openPlaylistModal(trackStr) {
    if (!currentUser) return openLoginModal();
    trackToAdd = JSON.parse(trackStr);
    
    const list = document.getElementById('playlist-list');
    list.innerHTML = '';
    
    if (userPlaylists.length === 0) {
        list.innerHTML = '<div style="color:var(--text-secondary);font-size:14px;">Nessuna playlist. Creane una nuova.</div>';
    } else {
        userPlaylists.forEach((pl, i) => {
            list.innerHTML += `
                <div class="playlist-item" onclick="addToPlaylist(${i})">
                    ${SVG.playlist} ${escapeHtml(pl.name)}
                </div>`;
        });
    }
    document.getElementById('playlist-modal').classList.add('active');
}
function closePlaylistModal() {
    document.getElementById('playlist-modal').classList.remove('active');
    document.getElementById('new-playlist-name').value = '';
    trackToAdd = null;
}
function createPlaylist() {
    const name = document.getElementById('new-playlist-name').value.trim();
    if (name && trackToAdd) {
        userPlaylists.push({ id: Date.now(), name: name, tracks: [trackToAdd] });
        localStorage.setItem('spotify_playlists', JSON.stringify(userPlaylists));
        renderSidebarPlaylists();
        closePlaylistModal();
    }
}
function addToPlaylist(idx) {
    if (trackToAdd) {
        // Prevent duplicates
        if (!userPlaylists[idx].tracks.some(t => t.id === trackToAdd.id)) {
            userPlaylists[idx].tracks.push(trackToAdd);
            localStorage.setItem('spotify_playlists', JSON.stringify(userPlaylists));
            renderSidebarPlaylists();
        }
        closePlaylistModal();
    }
}

/* ═══════════════════════════════════════════
   API CALLS
   ═══════════════════════════════════════════ */
async function api(endpoint) {
    try {
        const r = await fetch(API + endpoint);
        if (!r.ok) throw new Error('API error');
        return await r.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
window.onload = () => {
    updateAuthUI();
    renderSidebarPlaylists();
    audioEngine.volume = currentVolume;
    updateVolUI();
    loadHome();
    setupEventListeners();
};

function setupEventListeners() {
    // Player controls
    btnPlay.addEventListener('click', togglePlay);
    btnPrev.addEventListener('click', prevTrack);
    btnNext.addEventListener('click', nextTrack);
    btnShuffle.addEventListener('click', toggleShuffle);
    btnRepeat.addEventListener('click', toggleRepeat);
    nowLike.addEventListener('click', toggleCurrentLike);

    // Progress bar seeking
    progressWrapper.addEventListener('click', seekTo);
    progressWrapper.addEventListener('mousedown', startDrag);

    // Volume
    volWrapper.addEventListener('click', setVolume);
    volWrapper.addEventListener('mousedown', startVolDrag);
    btnVolIcon.addEventListener('click', toggleMute);

    // Audio events
    audioEngine.addEventListener('timeupdate', updateProgress);
    audioEngine.addEventListener('ended', onTrackEnd);
    audioEngine.addEventListener('loadedmetadata', () => {
        timeTotal.textContent = formatTime(audioEngine.duration);
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const q = e.target.value.trim();
        if (q.length >= 2) {
            searchTimeout = setTimeout(() => searchQuery(q), 400);
        } else if (q.length === 0) {
            loadHome();
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            const q = e.target.value.trim();
            if (q) searchQuery(q);
        }
    });

    // Home navigation
    document.getElementById('btn-home').addEventListener('click', () => {
        searchInput.value = '';
        loadHome();
    });
    document.getElementById('logo-home').addEventListener('click', () => {
        searchInput.value = '';
        loadHome();
    });
}

/* ═══════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════ */
function pushHistory(fn, ...args) {
    navHistory = navHistory.slice(0, navIndex + 1);
    navHistory.push({ fn, args });
    navIndex = navHistory.length - 1;
}

function setContent(html) {
    contentArea.innerHTML = html;
    contentArea.classList.remove('content-fade-in');
    void contentArea.offsetWidth;
    contentArea.classList.add('content-fade-in');
    mainView.scrollTop = 0;
}

/* ═══════════════════════════════════════════
   HOMEPAGE
   ═══════════════════════════════════════════ */
async function loadHome() {
    pushHistory(loadHome);
    mainView.className = 'home-bg';
    mainView.style.background = '';

    setContent('<div class="loading-spinner"><div class="spinner"></div></div>');

    // Fetch data for all homepage sections in parallel
    const [trendingData, artistsData, albumsData, radioData, chartsData] = await Promise.all([
        api('search?q=hit italia 2025'),
        api('search?q=sfera ebbasta geolier lazza marracash'),
        api('search?q=album rap italiano'),
        api('search?q=radio italiana pop'),
        api('search?q=top 50 italia')
    ]);

    let html = '<div class="section-container content-fade-in">';

    // ── Section 1: Brani di tendenza ──
    if (trendingData && trendingData.data) {
        html += buildSongSection('Brani di tendenza', trendingData.data.slice(0, 20));
    }

    // ── Section 2: Artisti più popolari ──
    if (artistsData && artistsData.data) {
        const uniqueArtists = [];
        const seen = new Set();
        artistsData.data.forEach(t => {
            if (!seen.has(t.artist.id)) {
                seen.add(t.artist.id);
                uniqueArtists.push(t.artist);
            }
        });
        html += buildArtistSection('Artisti più popolari', uniqueArtists.slice(0, 20));
    }

    // ── Section 3: Album e singoli popolari ──
    if (albumsData && albumsData.data) {
        const uniqueAlbums = [];
        const seenAlbums = new Set();
        albumsData.data.forEach(t => {
            if (!seenAlbums.has(t.album.id)) {
                seenAlbums.add(t.album.id);
                uniqueAlbums.push({...t.album, artist: t.artist});
            }
        });
        html += buildAlbumSection('Album e singoli popolari', uniqueAlbums.slice(0, 20));
    }

    // ── Section 4: Stazioni radio più popolari ──
    if (radioData && radioData.data) {
        const radioArtists = [];
        const seenRadio = new Set();
        radioData.data.forEach(t => {
            if (!seenRadio.has(t.artist.id)) {
                seenRadio.add(t.artist.id);
                radioArtists.push(t.artist);
            }
        });
        html += buildRadioSection('Stazioni radio più popolari', radioArtists.slice(0, 20));
    }

    // ── Section 5: Classifiche in primo piano ──
    if (chartsData && chartsData.data) {
        html += buildSongSection('Classifiche in primo piano', chartsData.data.slice(0, 20));
    }

    html += '</div>';
    setContent(html);
}

function buildSongSection(title, tracks) {
    let html = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">${title}</h2>
                <span class="section-show-all">Mostra tutto</span>
            </div>
            <div class="cards-row">`;

    tracks.forEach(track => {
        html += `
            <div class="sp-card" onclick="handleCardPlay(event, ${track.album.id})">
                <div class="sp-card-cover-wrapper">
                    <img class="sp-card-cover" src="${track.album.cover_medium}" alt="${escapeHtml(track.title_short)}" loading="lazy">
                    <button class="sp-card-play" onclick="event.stopPropagation(); quickPlay(${track.id})">${SVG.playCard}</button>
                </div>
                <div class="sp-card-title" title="${escapeHtml(track.title_short)}">${escapeHtml(track.title_short)}</div>
                <div class="sp-card-subtitle">
                    <span class="artist-link" onclick="event.stopPropagation(); loadArtist(${track.artist.id})">${escapeHtml(track.artist.name)}</span>
                </div>
            </div>`;
    });

    html += '</div></div>';
    return html;
}

function buildArtistSection(title, artists) {
    let html = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">${title}</h2>
                <span class="section-show-all">Mostra tutto</span>
            </div>
            <div class="cards-row">`;

    artists.forEach(artist => {
        html += `
            <div class="sp-card artist-card" onclick="loadArtist(${artist.id})">
                <div class="sp-card-cover-wrapper">
                    <img class="sp-card-cover" src="${artist.picture_medium}" alt="${escapeHtml(artist.name)}" loading="lazy">
                    <button class="sp-card-play" onclick="event.stopPropagation(); playArtistTop(${artist.id})">${SVG.playCard}</button>
                </div>
                <div class="sp-card-title">${escapeHtml(artist.name)}</div>
                <div class="sp-card-subtitle">Artista</div>
            </div>`;
    });

    html += '</div></div>';
    return html;
}

function buildAlbumSection(title, albums) {
    let html = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">${title}</h2>
                <span class="section-show-all">Mostra tutto</span>
            </div>
            <div class="cards-row">`;

    albums.forEach(album => {
        const year = album.release_date ? album.release_date.split('-')[0] : '';
        html += `
            <div class="sp-card" onclick="loadAlbum(${album.id})">
                <div class="sp-card-cover-wrapper">
                    <img class="sp-card-cover" src="${album.cover_medium}" alt="${escapeHtml(album.title)}" loading="lazy">
                    <button class="sp-card-play" onclick="event.stopPropagation(); playAlbumDirect(${album.id})">${SVG.playCard}</button>
                </div>
                <div class="sp-card-title" title="${escapeHtml(album.title)}">${escapeHtml(album.title)}</div>
                <div class="sp-card-subtitle">${year ? year + ' • ' : ''}${album.artist ? escapeHtml(album.artist.name) : 'Album'}</div>
            </div>`;
    });

    html += '</div></div>';
    return html;
}

function buildRadioSection(title, artists) {
    let html = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">${title}</h2>
                <span class="section-show-all">Mostra tutto</span>
            </div>
            <div class="cards-row">`;

    artists.forEach(artist => {
        html += `
            <div class="sp-card" onclick="playArtistTop(${artist.id})">
                <div class="sp-card-cover-wrapper">
                    <img class="sp-card-cover radio-cover" src="${artist.picture_medium}" alt="${escapeHtml(artist.name)} Radio" loading="lazy">
                    <div class="radio-badge">RADIO</div>
                    <button class="sp-card-play" onclick="event.stopPropagation(); playArtistTop(${artist.id})">${SVG.playCard}</button>
                </div>
                <div class="sp-card-title">${escapeHtml(artist.name)} Radio</div>
                <div class="sp-card-subtitle">Di ${escapeHtml(artist.name)} e artisti simili</div>
            </div>`;
    });

    html += '</div></div>';
    return html;
}

/* ═══════════════════════════════════════════
   ARTIST PAGE
   ═══════════════════════════════════════════ */
async function loadArtist(id) {
    pushHistory(loadArtist, id);
    setContent('<div class="loading-spinner"><div class="spinner"></div></div>');

    const [artist, topTracks, albumsData] = await Promise.all([
        api('artist/' + id),
        api(`artist/${id}/top?limit=10`),
        api(`artist/${id}/albums?limit=20`)
    ]);

    if (!artist) {
        setContent('<div style="padding:32px;color:var(--text-secondary)">Artista non trovato.</div>');
        return;
    }

    // Extract dominant color from artist name for gradient (simple hash)
    const hue = hashStringToHue(artist.name);
    mainView.className = '';
    mainView.style.background = `linear-gradient(to bottom, hsl(${hue}, 40%, 25%) 0%, var(--sp-surface) 400px)`;

    let html = `
        <div class="artist-hero" style="background-image: linear-gradient(transparent 40%, rgba(0,0,0,0.7)), url('${artist.picture_xl || artist.picture_big}')">
            <div class="artist-hero-info">
                <div class="artist-verified">${SVG.verified} Artista verificato</div>
                <h1>${escapeHtml(artist.name)}</h1>
                <div class="artist-listeners">${parseInt(artist.nb_fan).toLocaleString('it-IT')} ascoltatori mensili</div>
            </div>
        </div>
        <div class="artist-gradient-bg">
            <div class="artist-controls">
                <button class="btn-play-big" onclick="playArtistTop(${id})">${SVG.playCard}</button>
                <button class="btn-follow">Segui</button>
                <button class="btn-more">${SVG.moreH}</button>
            </div>
            <div class="popular-tracks">
                <h2>Popolari</h2>`;

    if (topTracks && topTracks.data) {
        const tracks = topTracks.data.slice(0, 5);
        tracks.forEach((track, i) => {
            const isLiked = likedSongs.some(s => s.id === track.id);
            html += `
                <div class="track-row" onclick="playQueue(${JSON.stringify(topTracks.data).replace(/"/g, '&quot;')}, ${i})" style="cursor:pointer">
                    <div class="track-number">
                        <span class="track-number-text">${i + 1}</span>
                        ${SVG.playSmall.replace('class="', 'class="track-play-icon ')}
                    </div>
                    <div class="track-info">
                        <img class="track-cover" src="${track.album.cover_small}" alt="">
                        <div class="track-details">
                            <div class="track-name">${escapeHtml(track.title)}</div>
                        </div>
                    </div>
                    <div class="track-plays">${track.rank ? parseInt(track.rank).toLocaleString('it-IT') : ''}</div>
                    <div class="track-duration-cell">
                        <button class="track-like-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLikeTrack(${track.id}, this, ${JSON.stringify(track).replace(/"/g, '&quot;')})">
                            ${isLiked ? SVG.heartFilled : SVG.heartOutline}
                        </button>
                        <button class="track-add-btn" onclick="event.stopPropagation(); openPlaylistModal('${JSON.stringify(track).replace(/"/g, '&quot;')}')" title="Aggiungi alla playlist">
                            ${SVG.plus}
                        </button>
                        <span class="track-duration">${formatTime(track.duration)}</span>
                    </div>
                </div>`;
        });

        if (topTracks.data.length > 5) {
            html += `<button class="show-more-btn" onclick="toggleMoreTracks(this, ${JSON.stringify(topTracks.data).replace(/"/g, '&quot;')})">Mostra altro</button>`;
        }
    }

    html += '</div>';

    // Discography
    if (albumsData && albumsData.data && albumsData.data.length > 0) {
        html += `
            <div class="discography-section">
                <div class="disco-header">
                    <h2>Discografia</h2>
                    <span class="section-show-all">Mostra tutto</span>
                </div>
                <div class="disco-filters">
                    <button class="disco-filter active">Uscite popolari</button>
                    <button class="disco-filter">Album</button>
                    <button class="disco-filter">Singoli ed EP</button>
                </div>
                <div class="disco-grid">`;

        albumsData.data.slice(0, 6).forEach(album => {
            const year = album.release_date ? album.release_date.split('-')[0] : '';
            const type = album.record_type || 'Album';
            const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
            html += `
                <div class="sp-card" onclick="loadAlbum(${album.id})">
                    <div class="sp-card-cover-wrapper">
                        <img class="sp-card-cover" src="${album.cover_medium}" alt="${escapeHtml(album.title)}" loading="lazy">
                        <button class="sp-card-play" onclick="event.stopPropagation(); playAlbumDirect(${album.id})">${SVG.playCard}</button>
                    </div>
                    <div class="sp-card-title" title="${escapeHtml(album.title)}">${escapeHtml(album.title)}</div>
                    <div class="sp-card-subtitle">${year}${year ? ' • ' : ''}${typeLabel}</div>
                </div>`;
        });

        html += '</div></div>';
    }

    html += '</div>';
    setContent(html);
}

/* ═══════════════════════════════════════════
   ALBUM PAGE
   ═══════════════════════════════════════════ */
async function loadAlbum(id) {
    pushHistory(loadAlbum, id);
    setContent('<div class="loading-spinner"><div class="spinner"></div></div>');

    const album = await api('album/' + id);
    if (!album) {
        setContent('<div style="padding:32px;color:var(--text-secondary)">Album non trovato.</div>');
        return;
    }

    const hue = hashStringToHue(album.title);
    mainView.className = '';
    mainView.style.background = `linear-gradient(to bottom, hsl(${hue}, 30%, 20%) 0%, var(--sp-surface) 400px)`;

    const year = album.release_date ? album.release_date.split('-')[0] : '';
    const totalDur = album.tracks ? album.tracks.data.reduce((a, t) => a + t.duration, 0) : 0;
    const totalMin = Math.floor(totalDur / 60);
    const totalSec = totalDur % 60;

    let html = `
        <div class="album-header" style="background: linear-gradient(to bottom, hsl(${hue}, 30%, 30%), hsl(${hue}, 20%, 12%))">
            <img class="album-cover-large" src="${album.cover_big || album.cover_medium}" alt="${escapeHtml(album.title)}">
            <div class="album-meta">
                <div class="album-type">${album.record_type || 'Album'}</div>
                <h1 class="album-title">${escapeHtml(album.title)}</h1>
                <div class="album-details">
                    <img src="${album.artist.picture_small}" alt="">
                    <span class="album-artist-link" onclick="loadArtist(${album.artist.id})">${escapeHtml(album.artist.name)}</span>
                    ${year ? `<span class="album-dot">•</span><span>${year}</span>` : ''}
                    <span class="album-dot">•</span>
                    <span>${album.nb_tracks} brani, ${totalMin} min ${totalSec} sec</span>
                </div>
            </div>
        </div>
        <div class="artist-gradient-bg" style="--gradient-color: hsl(${hue}, 30%, 20%)">
            <div class="album-controls">
                <button class="btn-play-big" onclick="playAlbumFromStart(${id})">${SVG.playCard}</button>
                <button class="btn-more">${SVG.moreH}</button>
            </div>
            <div class="album-tracklist">
                <div class="tracklist-header">
                    <div style="text-align:center">#</div>
                    <div>Titolo</div>
                    <div style="display:flex;justify-content:flex-end">${SVG.clock}</div>
                </div>`;

    if (album.tracks && album.tracks.data) {
        album.tracks.data.forEach((track, i) => {
            const isLiked = likedSongs.some(s => s.id === track.id);
            // Build track object with album info for the queue
            const trackWithAlbum = {...track, album: { id: album.id, title: album.title, cover_small: album.cover_small, cover_medium: album.cover_medium }};

            html += `
                <div class="album-track-row" onclick="playQueue(${JSON.stringify(album.tracks.data.map(t => ({...t, album: { id: album.id, title: album.title, cover_small: album.cover_small, cover_medium: album.cover_medium }, artist: album.artist }))).replace(/"/g, '&quot;')}, ${i})" style="cursor:pointer">
                    <div class="track-number" style="text-align:center">
                        <span class="track-number-text">${i + 1}</span>
                        ${SVG.playSmall.replace('class="', 'class="track-play-icon ')}
                    </div>
                    <div class="album-track-info">
                        <div class="album-track-name">${escapeHtml(track.title)}</div>
                        <div class="album-track-artists">
                            <a onclick="event.stopPropagation(); loadArtist(${album.artist.id})">${escapeHtml(track.artist ? track.artist.name : album.artist.name)}</a>
                        </div>
                    </div>
                    <div class="track-duration-cell">
                        <button class="track-like-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLikeTrack(${track.id}, this, ${JSON.stringify(trackWithAlbum).replace(/"/g, '&quot;')})">
                            ${isLiked ? SVG.heartFilled : SVG.heartOutline}
                        </button>
                        <button class="track-add-btn" onclick="event.stopPropagation(); openPlaylistModal('${JSON.stringify(trackWithAlbum).replace(/"/g, '&quot;')}')" title="Aggiungi alla playlist">
                            ${SVG.plus}
                        </button>
                        <span class="track-duration">${formatTime(track.duration)}</span>
                    </div>
                </div>`;
        });
    }

    html += `
            </div>
        </div>
        <div style="padding:24px 32px;color:var(--text-secondary);font-size:14px;">
            <div style="font-size:14px;color:var(--text-secondary)">${album.release_date || ''}</div>
            <div style="margin-top:8px;font-size:11px;color:var(--text-subdued)">&copy; ${year} ${escapeHtml(album.artist.name)}</div>
        </div>`;

    setContent(html);
}

/* ═══════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════ */
async function searchQuery(query) {
    pushHistory(searchQuery, query);
    setContent('<div class="loading-spinner"><div class="spinner"></div></div>');

    mainView.className = '';
    mainView.style.background = 'var(--sp-surface)';

    const results = await api('search?q=' + encodeURIComponent(query));
    if (!results || !results.data || results.data.length === 0) {
        setContent(`<div class="search-results"><h2>Nessun risultato per "${escapeHtml(query)}"</h2></div>`);
        return;
    }

    let html = '<div class="section-container content-fade-in">';

    // Songs section
    html += buildSongSection(`Risultati per "${escapeHtml(query)}"`, results.data.slice(0, 10));

    // Unique artists from results
    const uniqueArtists = [];
    const seenA = new Set();
    results.data.forEach(t => {
        if (!seenA.has(t.artist.id)) {
            seenA.add(t.artist.id);
            uniqueArtists.push(t.artist);
        }
    });
    if (uniqueArtists.length > 0) {
        html += buildArtistSection('Artisti', uniqueArtists.slice(0, 6));
    }

    // Unique albums from results
    const uniqueAlbums = [];
    const seenAl = new Set();
    results.data.forEach(t => {
        if (!seenAl.has(t.album.id)) {
            seenAl.add(t.album.id);
            uniqueAlbums.push({...t.album, artist: t.artist});
        }
    });
    if (uniqueAlbums.length > 0) {
        html += buildAlbumSection('Album', uniqueAlbums.slice(0, 6));
    }

    html += '</div>';
    setContent(html);
}

/* ═══════════════════════════════════════════
   PLAYER LOGIC
   ═══════════════════════════════════════════ */
function playQueue(list, index) {
    currentQueue = list;
    currentIndex = index;
    updatePlayer();
}

function updatePlayer() {
    const track = currentQueue[currentIndex];
    if (!track) return;

    audioEngine.src = track.preview;
    audioEngine.play().catch(() => {});
    isPlaying = true;

    // Show player bar
    playerBar.classList.add('active');

    // Update now playing
    const coverUrl = track.album ? (track.album.cover_small || track.album.cover_medium) : '';
    if (coverUrl) {
        nowCover.src = coverUrl;
        nowCover.classList.remove('hidden');
    }
    nowTitle.textContent = track.title || track.title_short || '';
    nowArtist.textContent = track.artist ? track.artist.name : '';
    nowArtist.onclick = () => { if (track.artist) loadArtist(track.artist.id); };

    updatePlayIcon();
    updateLikeBtn();
}

function togglePlay() {
    if (!currentQueue.length) return;
    if (audioEngine.paused) {
        audioEngine.play().catch(() => {});
        isPlaying = true;
    } else {
        audioEngine.pause();
        isPlaying = false;
    }
    updatePlayIcon();
}

function updatePlayIcon() {
    btnPlay.innerHTML = isPlaying ? SVG.pause : SVG.play;
}

function nextTrack() {
    if (!currentQueue.length) return;
    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * currentQueue.length);
    } else if (currentIndex < currentQueue.length - 1) {
        currentIndex++;
    } else if (repeatMode === 1) {
        currentIndex = 0;
    } else {
        return;
    }
    updatePlayer();
}

function prevTrack() {
    if (!currentQueue.length) return;
    if (audioEngine.currentTime > 3) {
        audioEngine.currentTime = 0;
        return;
    }
    if (currentIndex > 0) {
        currentIndex--;
    } else if (repeatMode === 1) {
        currentIndex = currentQueue.length - 1;
    }
    updatePlayer();
}

function onTrackEnd() {
    if (repeatMode === 2) {
        audioEngine.currentTime = 0;
        audioEngine.play().catch(() => {});
        return;
    }
    nextTrack();
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    btnRepeat.classList.toggle('active', repeatMode > 0);
    if (repeatMode === 2) {
        btnRepeat.innerHTML = '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L7.461 13.28l2.306-2.311a.75.75 0 0 1 1.061 1.06l-1.018 1.018h2.44a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/><text x="8" y="10" text-anchor="middle" font-size="7" fill="currentColor" font-weight="700">1</text></svg>';
    } else {
        btnRepeat.innerHTML = '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L7.461 13.28l2.306-2.311a.75.75 0 0 1 1.061 1.06l-1.018 1.018h2.44a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/></svg>';
    }
}

/* ═══════════════════════════════════════════
   PROGRESS & VOLUME
   ═══════════════════════════════════════════ */
function updateProgress() {
    if (!audioEngine.duration) return;
    const pct = (audioEngine.currentTime / audioEngine.duration) * 100;
    progressFill.style.width = pct + '%';
    timeCurrent.textContent = formatTime(audioEngine.currentTime);
    timeTotal.textContent = formatTime(audioEngine.duration);
}

function seekTo(e) {
    if (!audioEngine.duration) return;
    const rect = progressWrapper.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioEngine.currentTime = pct * audioEngine.duration;
}

function startDrag(e) {
    e.preventDefault();
    const onMove = (ev) => seekTo(ev);
    const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

function setVolume(e) {
    const rect = volWrapper.getBoundingClientRect();
    let pct = (e.clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    currentVolume = pct;
    audioEngine.volume = pct;
    localStorage.setItem('spotify-volume', pct);
    updateVolUI();
}

function startVolDrag(e) {
    e.preventDefault();
    const onMove = (ev) => setVolume(ev);
    const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

function toggleMute() {
    if (audioEngine.volume > 0) {
        audioEngine._prevVol = audioEngine.volume;
        audioEngine.volume = 0;
        currentVolume = 0;
    } else {
        audioEngine.volume = audioEngine._prevVol || 1;
        currentVolume = audioEngine.volume;
    }
    updateVolUI();
}

function updateVolUI() {
    const pct = currentVolume * 100;
    volFill.style.width = pct + '%';

    // Update icon based on volume
    const icon = document.getElementById('vol-icon');
    if (currentVolume === 0) {
        icon.innerHTML = '<path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06zM10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-13a.75.75 0 0 0 0-.001zM9.491 13.13 3.81 9.85a2.139 2.139 0 0 1 0-3.7l5.68-3.28v10.26z"/>';
    } else if (currentVolume < 0.5) {
        icon.innerHTML = '<path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.28V2.87L2.817 6.15zm8.683.45a4.138 4.138 0 0 1 0 3.2.75.75 0 0 1-1.399-.54 2.635 2.635 0 0 0 0-2.12.75.75 0 0 1 1.4-.54z"/>';
    } else {
        icon.innerHTML = '<path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.28V2.87L2.817 6.15zm8.683.45a4.138 4.138 0 0 1 0 3.2.75.75 0 0 1-1.399-.54 2.635 2.635 0 0 0 0-2.12.75.75 0 0 1 1.4-.54zm1.3-1.8a6.645 6.645 0 0 1 0 6.2.75.75 0 0 1-1.32-.72 5.145 5.145 0 0 0 0-4.76.75.75 0 0 1 1.32-.72z"/>';
    }
}

/* ═══════════════════════════════════════════
   LIKES
   ═══════════════════════════════════════════ */
function toggleCurrentLike() {
    const track = currentQueue[currentIndex];
    if (!track) return;

    const idx = likedSongs.findIndex(s => s.id === track.id);
    if (idx === -1) likedSongs.push(track);
    else likedSongs.splice(idx, 1);

    localStorage.setItem('spotify-likes', JSON.stringify(likedSongs));
    updateLikeBtn();
}

function updateLikeBtn() {
    const track = currentQueue[currentIndex];
    if (!track) return;
    const isLiked = likedSongs.some(s => s.id === track.id);
    nowLike.classList.toggle('liked', isLiked);
    nowLike.innerHTML = isLiked ? SVG.heartFilled : SVG.heartOutline;
}

function toggleLikeTrack(trackId, btn, trackData) {
    const track = typeof trackData === 'string' ? JSON.parse(trackData) : trackData;
    const idx = likedSongs.findIndex(s => s.id === trackId);

    if (idx === -1) {
        likedSongs.push(track);
        btn.classList.add('liked');
        btn.innerHTML = SVG.heartFilled;
    } else {
        likedSongs.splice(idx, 1);
        btn.classList.remove('liked');
        btn.innerHTML = SVG.heartOutline;
    }

    localStorage.setItem('spotify-likes', JSON.stringify(likedSongs));

    // Update player like button if same track
    if (currentQueue[currentIndex] && currentQueue[currentIndex].id === trackId) {
        updateLikeBtn();
    }
}

/* ═══════════════════════════════════════════
   QUICK PLAY HELPERS
   ═══════════════════════════════════════════ */
async function quickPlay(trackId) {
    const data = await api('track/' + trackId);
    if (data) {
        currentQueue = [data];
        currentIndex = 0;
        updatePlayer();
    }
}

function handleCardPlay(e, albumId) {
    loadAlbum(albumId);
}

async function playArtistTop(artistId) {
    const top = await api(`artist/${artistId}/top?limit=10`);
    if (top && top.data) {
        playQueue(top.data, 0);
    }
}

async function playAlbumDirect(albumId) {
    const album = await api('album/' + albumId);
    if (album && album.tracks && album.tracks.data) {
        const tracks = album.tracks.data.map(t => ({
            ...t,
            album: { id: album.id, title: album.title, cover_small: album.cover_small, cover_medium: album.cover_medium },
            artist: album.artist
        }));
        playQueue(tracks, 0);
    }
}

async function playAlbumFromStart(albumId) {
    await playAlbumDirect(albumId);
}

function toggleMoreTracks(btn, allTracks) {
    const tracks = typeof allTracks === 'string' ? JSON.parse(allTracks) : allTracks;
    const container = btn.parentElement;
    const existingRows = container.querySelectorAll('.track-row');

    if (existingRows.length <= 5) {
        // Show all tracks
        const fragment = document.createDocumentFragment();
        tracks.slice(5).forEach((track, idx) => {
            const i = idx + 5;
            const isLiked = likedSongs.some(s => s.id === track.id);
            const row = document.createElement('div');
            row.className = 'track-row';
            row.style.cursor = 'pointer';
            row.onclick = () => playQueue(tracks, i);
            row.innerHTML = `
                <div class="track-number">
                    <span class="track-number-text">${i + 1}</span>
                    ${SVG.playSmall.replace('class="', 'class="track-play-icon ')}
                </div>
                <div class="track-info">
                    <img class="track-cover" src="${track.album.cover_small}" alt="">
                    <div class="track-details">
                        <div class="track-name">${escapeHtml(track.title)}</div>
                    </div>
                </div>
                <div class="track-plays">${track.rank ? parseInt(track.rank).toLocaleString('it-IT') : ''}</div>
                <div class="track-duration-cell">
                    <button class="track-like-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLikeTrack(${track.id}, this, ${JSON.stringify(track).replace(/"/g, '&quot;')})">
                        ${isLiked ? SVG.heartFilled : SVG.heartOutline}
                    </button>
                    <button class="track-add-btn" onclick="event.stopPropagation(); openPlaylistModal('${JSON.stringify(track).replace(/"/g, '&quot;')}')" title="Aggiungi alla playlist">
                        ${SVG.plus}
                    </button>
                    <span class="track-duration">${formatTime(track.duration)}</span>
                </div>`;
            fragment.appendChild(row);
        });
        container.insertBefore(fragment, btn);
        btn.textContent = 'Mostra meno';
    } else {
        // Remove extra tracks
        const rows = container.querySelectorAll('.track-row');
        for (let i = 5; i < rows.length; i++) rows[i].remove();
        btn.textContent = 'Mostra altro';
    }
}

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hashStringToHue(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 360);
}