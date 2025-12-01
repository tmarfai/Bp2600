/* Meglévő Reveal függvények */
const reveals = document.querySelectorAll('.reveal');

function revealOnScroll() {
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 100;

        if (elementTop < windowHeight - revealPoint) {
            reveals[i].classList.add('visible');
        }
    }
}

window.addEventListener('scroll', revealOnScroll);


/* --- AUDIOLEJÁTSZÓ LOGIKA (A KÓD NAGY RÉSZE AZ EREDETI) --- */

const audio = document.getElementById('audio-element');
const playPauseButton = document.getElementById('play-pause-button');
const restartButton = document.getElementById('restart-button');
const progressBar = document.getElementById('progress-bar');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const playPauseIcon = playPauseButton.querySelector('i');

// Segédfüggvény az idő formázására (mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${minutes}:${formattedSeconds}`;
}

// 1. Eseménykezelő a Lejátszás/Szünet gombhoz
playPauseButton.addEventListener('click', () => {
    if (audio.paused || audio.ended) {
        audio.play();
    } else {
        audio.pause();
    }
});

// 2. Események az ikon és a gomb állapotának frissítéséhez
audio.addEventListener('play', () => {
    playPauseIcon.classList.remove('fa-play');
    playPauseIcon.classList.add('fa-pause');
});

audio.addEventListener('pause', () => {
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
});

audio.addEventListener('ended', () => {
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
    audio.currentTime = 0; // Vissza az elejére
    updateProgressAndTimes(); // Frissítjük a kijelzőt
});

// 3. Eseménykezelő az Elölről gombhoz
restartButton.addEventListener('click', () => {
    audio.currentTime = 0;
    // Ha szünetelt, és elölről indítjuk, maradjon szünet
    if (!audio.paused && !audio.ended) { 
        audio.play(); // Ha épp játszott, indítsa újra
    } else {
          updateProgressAndTimes(); // Csak frissíti az időt 0:00-ra
    }
});

// 4. Az audio betöltése utáni inicializálás
audio.addEventListener('loadedmetadata', () => {
    // Beállítjuk a teljes hosszt (duration) a kijelzőn és a progress bar maximumán
    durationDisplay.textContent = formatTime(audio.duration);
    // Átállítjuk a progress bar maximumát a teljes idő másodpercére
    progressBar.max = audio.duration; 
    updateProgressAndTimes();
});

// 5. Frissíti a progress bart és az eltelt időt (folyamatosan, lejátszás közben)
audio.addEventListener('timeupdate', updateProgressAndTimes);

function updateProgressAndTimes() {
    const currentTime = audio.currentTime;
    const duration = audio.duration;
    
    // Frissítjük a sávot (current time is a value)
    progressBar.value = currentTime;
    
    // Frissítjük az eltelt idő kijelzését
    currentTimeDisplay.textContent = formatTime(currentTime);

    // Különleges trükk a progress bar már lejátszott részének színezésére
    if (duration > 0) {
        const percentage = (currentTime / duration) * 100;
        progressBar.style.background = `linear-gradient(to right, white 0%, white ${percentage}%, rgba(255, 255, 255, 0.3) ${percentage}%, rgba(255, 255, 255, 0.3) 100%)`;
    } else {
        // Alapértelmezett háttér, ha nincs még betöltve (0:00)
        progressBar.style.background = 'rgba(255, 255, 255, 0.3)';
    }
}

// 6. Eseménykezelő a progress bar kézi mozgatásához
progressBar.addEventListener('input', () => {
    // Átállítjuk a lejátszási pozíciót a sáv értékére
    audio.currentTime = progressBar.value;
    updateProgressAndTimes(); // Azonnal frissítjük a kijelzést
});


/* --- ÚJ: EGYSZERI TÁJOLÁS ELLENŐRZÉS ÉS EREDETI LOAD FUNKCIÓK ÖSSZEVONÁSA --- */

window.addEventListener('load', () => {
    // 1. Reveal scrollozáskor (eredeti funkció)
    revealOnScroll();
    
    // 2. Tájolás figyelmeztetés (Megjelenik minden betöltésnél, ha álló a mód)
    const orientationWarning = document.getElementById('orientation-warning');

    // Ellenőrizzük, hogy álló (portré) tájolású-e az eszköz
    if (window.matchMedia("(orientation: portrait)").matches) {
        
        // Megmutatjuk a figyelmeztetést
        if (orientationWarning) {
             orientationWarning.classList.remove('hidden');
        }
    }
    
    // 3. Audiolejátszó inicializálása betöltéskor (eredeti funkció)
    // Fontos: a loadedmetadata nem mindig fut le load-kor, de az audio.readyState segít.
    if (audio.readyState >= 2) {
        durationDisplay.textContent = formatTime(audio.duration);
        progressBar.max = audio.duration; 
    }
    updateProgressAndTimes();
});