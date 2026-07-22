document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('p5Player');

    // ── Read config from data-attributes (with sensible defaults) ──
    const cfg = {
        title: player.dataset.title || 'Unknown Track',
        srcM4a: player.dataset.srcM4a || '',
        srcWebm: player.dataset.srcWebm || '',
        defaultVolume: parseFloat(player.dataset.defaultVolume ?? '0.10'),
        autoplay: (player.dataset.autoplay ?? 'true') === 'true',
    };

    // ── DOM refs ──
    const audio = document.getElementById('bgmAudio');
    const playBtn = document.getElementById('playBtn');
    const progress = document.getElementById('p5Progress');
    const progressFill = document.getElementById('p5ProgressFill');
    const progressHandle = document.getElementById('p5ProgressHandle');
    const currentEl = document.getElementById('p5Current');
    const durationEl = document.getElementById('p5Duration');
    const volumeWrap = document.querySelector('.p5-volume');
    const volBtn = document.getElementById('volBtn');
    const volSlider = document.getElementById('volSlider');
    const volFill = document.getElementById('volFill');
    const volHandle = document.getElementById('volHandle');

    // ── Apply config: track title + audio sources ──
    document.getElementById('p5TrackName').textContent = cfg.title;
    document.getElementById('p5TrackName').title = cfg.title;
    if (cfg.srcM4a) {
        const s1 = document.createElement('source');
        s1.src = cfg.srcM4a; s1.type = 'audio/mp4';
        audio.appendChild(s1);
    }
    if (cfg.srcWebm) {
        const s2 = document.createElement('source');
        s2.src = cfg.srcWebm; s2.type = 'audio/webm';
        audio.appendChild(s2);
    }
    audio.load();

    let lastVolume = cfg.defaultVolume; // remember last non-zero for un-mute

    const fmt = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    // Apply a volume (0..1) to audio + UI
    const applyVolume = (v) => {
        v = Math.max(0, Math.min(1, v));
        audio.volume = v;
        const pct = v * 100;
        volFill.style.width = pct + '%';
        volHandle.style.left = pct + '%';
        volumeWrap.classList.remove('low', 'muted');
        if (v === 0) volumeWrap.classList.add('muted');
        else if (v < 0.5) volumeWrap.classList.add('low');
        if (v > 0) lastVolume = v;
    };

    // Initialize to default volume
    applyVolume(cfg.defaultVolume);

    // ── Play / Pause ──
    const togglePlay = () => {
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
    };
    playBtn.addEventListener('click', togglePlay);

    audio.addEventListener('play', () => player.classList.add('playing'));
    audio.addEventListener('pause', () => player.classList.remove('playing'));

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = fmt(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        const pct = (audio.currentTime / audio.duration) * 100 || 0;
        progressFill.style.width = pct + '%';
        progressHandle.style.left = pct + '%';
        currentEl.textContent = fmt(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
        progressFill.style.width = '0%';
        progressHandle.style.left = '0%';
    });

    // Seek by clicking / dragging the progress bar
    let seeking = false;
    const seekFromEvent = (e) => {
        if (!audio.duration) return;
        const rect = progress.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const pct = (clientX - rect.left) / rect.width;
        audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration;
    };
    progress.addEventListener('mousedown', (e) => { seeking = true; seekFromEvent(e); });
    window.addEventListener('mousemove', (e) => { if (seeking) seekFromEvent(e); });
    window.addEventListener('mouseup', () => { seeking = false; });
    progress.addEventListener('touchstart', (e) => { seekFromEvent(e); }, { passive: true });
    progress.addEventListener('touchmove', (e) => { seekFromEvent(e); }, { passive: true });

    // ── Volume Control ──
    volBtn.addEventListener('click', () => {
        if (audio.volume > 0) applyVolume(0);
        else applyVolume(lastVolume || cfg.defaultVolume);
    });

    let draggingVol = false;
    const setVolFromEvent = (e) => {
        const rect = volSlider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        applyVolume((clientX - rect.left) / rect.width);
    };
    volSlider.addEventListener('mousedown', (e) => { draggingVol = true; setVolFromEvent(e); });
    window.addEventListener('mousemove', (e) => { if (draggingVol) setVolFromEvent(e); });
    window.addEventListener('mouseup', () => { draggingVol = false; });
    volSlider.addEventListener('touchstart', (e) => { setVolFromEvent(e); }, { passive: true });
    volSlider.addEventListener('touchmove', (e) => { setVolFromEvent(e); }, { passive: true });

    // ── Autoplay (with first-interaction fallback) ──
    // Browsers block audio-with-sound from autoplaying; start on the first
    // user interaction anywhere on the page, then clean up listeners.
    if (cfg.autoplay) {
        const startAutoplay = () => {
            if (audio.paused) audio.play().catch(() => {});
        };
        startAutoplay(); // try immediately (allowed in some contexts)
        const autoplayOnInteraction = () => {
            startAutoplay();
            document.removeEventListener('click', autoplayOnInteraction);
            document.removeEventListener('keydown', autoplayOnInteraction);
            document.removeEventListener('touchstart', autoplayOnInteraction);
        };
        document.addEventListener('click', autoplayOnInteraction, { once: true });
        document.addEventListener('keydown', autoplayOnInteraction, { once: true });
        document.addEventListener('touchstart', autoplayOnInteraction, { once: true });
    }
});
