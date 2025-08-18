"use strict";

document.addEventListener("DOMContentLoaded", function () {
    let toggle = document.querySelector(".toggle");
    let nav = document.querySelector("header nav");

    toggle.addEventListener("click", function () {
        this.classList.toggle("active");
        nav.classList.toggle("active");
    });



    function initComparisons() {
        var x, i;
        x = document.getElementsByClassName("img-overlay");
        for (i = 0; i < x.length; i++) {
            compareImages(x[i]);
        }
        function compareImages(img) {
            var slider, img, clicked = 0, w, h, p;
            w = img.offsetWidth;
            h = img.offsetHeight;
            p = (w <= 380) ? 41 : 81;
            img.style.width = (w / 2) + p + "px";
            slider = document.createElement("DIV");
            slider.setAttribute("class", "img-slider");
            img.parentElement.insertBefore(slider, img);
            slider.style.left = (w / 2) - (slider.offsetWidth / 2) + p + "px";
            slider.addEventListener("mousedown", slideReady);
            window.addEventListener("mouseup", slideFinish);
            slider.addEventListener("touchstart", slideReady);
            window.addEventListener("touchstop", slideFinish);
            function slideReady(e) {
                e.preventDefault();
                clicked = 1;
                window.addEventListener("mousemove", slideMove);
                window.addEventListener("touchmove", slideMove);
            }
            function slideFinish() {
                clicked = 0;
            }
            function slideMove(e) {
                var pos;
                if (clicked == 0) return false;
                pos = getCursorPos(e)
                if (pos < 0) pos = 0;
                if (pos > w) pos = w;
                slide(pos);
            }
            function getCursorPos(e) {
                var a, x = 0;
                e = e || window.event;
                a = img.getBoundingClientRect();
                x = e.pageX - a.left;
                x = x - window.pageXOffset;
                return x;
            }
            function slide(x) {
                img.style.width = x + "px";
                slider.style.left = img.offsetWidth - (slider.offsetWidth / 2) + "px";
            }
        }
    }
    initComparisons();

    const swiper = new Swiper(".welcome .slider", {
        spaceBetween: 20,
        slidesPerView: 1,
        loop: true,

        pagination: {
            el: ".welcome .dots",
            clickable: true,
        },
        navigation: {
            nextEl: ".arrows .arrow-right",
            prevEl: ".arrows .arrow-left",
        },
    });

    let activeSlide = document.querySelector('.welcome .counts .active');
    swiper.on('slideChange', function () {
        activeSlide.innerHTML = "0" + (this.realIndex + 1);
    });


    const player = document.querySelector('.player');
    const video = document.querySelector('.video-player');
    const bigPlayBtn = document.querySelector('.big-play');
    const playToggle = document.querySelector('.play-toggle');
    const progressBar = document.querySelector('.progress');
    const volumeIcon = document.querySelector('.icon-volume');
    const volumeSlider = document.querySelector('.volume');
    const fullscreenBtn = document.querySelector('.icon-fullscreen');
    const speedIndicator = document.querySelector('.speed-indicator');
    let lastVolume = 1;
    let rafId;
    let playStartTime = 0;
    let playStartStamp = 0;

    function togglePlay() { video.paused ? video.play() : video.pause(); }
    function updatePlayIcons() {
        if (video.paused) {
            playToggle.src = "./assets/img/video/play.svg";
            bigPlayBtn.style.display = 'block';
        } else {
            playToggle.src = "./assets/img/video/pause.svg";
            bigPlayBtn.style.display = 'none';
        }
    }

    // Обновление градиента прогресса
    function updateProgressBackground(percent) {
        progressBar.style.background =
            `linear-gradient(to right, var(--dark-red) 0%, var(--dark-red) ${percent}%, #C4C4C4 ${percent}%, #C4C4C4 100%)`;
    }
    // Обновление градиента громкости
    function updateVolumeBackground() {
        const val = volumeSlider.value;
        volumeSlider.style.background =
            `linear-gradient(to right, var(--dark-red) 0%, var(--dark-red) ${val}%, #C4C4C4 ${val}%, #C4C4C4 100%)`;
    }

    function renderProgress() {
        let current;
        if (!video.paused && !video.ended) {
            const elapsed = (performance.now() - playStartStamp) / 1000;
            current = playStartTime + elapsed * video.playbackRate;
            if (current > video.duration) current = video.duration;
        } else {
            current = video.currentTime;
        }
        const percent = (current / video.duration) * 100 || 0;
        progressBar.value = percent;
        updateProgressBackground(percent);
        if (!video.paused && !video.ended) rafId = requestAnimationFrame(renderProgress);
    }
    function startProgressLoop() {
        cancelAnimationFrame(rafId);
        playStartTime = video.currentTime;
        playStartStamp = performance.now();
        rafId = requestAnimationFrame(renderProgress);
    }
    function stopProgressLoop() {
        cancelAnimationFrame(rafId);
        renderProgress();
    }

    playToggle.addEventListener('click', togglePlay);
    bigPlayBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    video.addEventListener('play', () => { updatePlayIcons(); startProgressLoop(); });
    video.addEventListener('pause', () => { updatePlayIcons(); stopProgressLoop(); });
    video.addEventListener('ended', () => { updatePlayIcons(); stopProgressLoop(); });

    progressBar.addEventListener('input', () => {
        const percent = parseFloat(progressBar.value);
        video.currentTime = (percent / 100) * video.duration;
        playStartTime = video.currentTime;
        playStartStamp = performance.now();
        updateProgressBackground(percent);
        if (percent >= 100) video.pause();
    });

    volumeSlider.addEventListener('input', () => {
        video.volume = volumeSlider.value / 100;
        if (video.volume === 0) {
            video.muted = true;
            volumeIcon.src = "./assets/img/video/volume-mute.svg";
        } else {
            video.muted = false;
            volumeIcon.src = "./assets/img/video/volume.svg";
        }
        updateVolumeBackground();
    });

    volumeIcon.addEventListener('click', () => {
        if (video.muted) {
            video.muted = false;
            video.volume = lastVolume;
            volumeSlider.value = lastVolume * 100;
            volumeIcon.src = "./assets/img/video/volume.svg";
        } else {
            video.muted = true;
            lastVolume = video.volume;
            volumeSlider.value = 0;
            volumeIcon.src = "./assets/img/video/volume-mute.svg";
        }
        updateVolumeBackground();
    });

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) player.parentElement.requestFullscreen();
        else document.exitFullscreen();
    });

    document.addEventListener('keydown', (e) => {
        const code = e.code.toLowerCase();
        if (code === 'space') { e.preventDefault(); togglePlay(); }
        else if (code === 'keym' || code === 'ь' || code === 'м') { volumeIcon.click(); }
        else if (code === 'keyf' || code === 'а') { fullscreenBtn.click(); }
        else if (e.shiftKey && (e.key === ',' || e.key === 'б')) { changeSpeed(-0.25); }
        else if (e.shiftKey && (e.key === '.' || e.key === 'ю')) { changeSpeed(0.25); }
    });

    function changeSpeed(delta) {
        let newRate = Math.min(Math.max(video.playbackRate + delta, 0.25), 2);
        video.playbackRate = newRate;
        showSpeed(newRate);
    }
    function showSpeed(rate) {
        speedIndicator.textContent = rate.toFixed(2) + 'x';
        speedIndicator.style.display = 'block';
        clearTimeout(speedIndicator.timer);
        speedIndicator.timer = setTimeout(() => { speedIndicator.style.display = 'none'; }, 1000);
    }

    // Установка начальных значений и заливок
    video.volume = volumeSlider.value / 100;
    updateVolumeBackground();
    updateProgressBackground(0);
});