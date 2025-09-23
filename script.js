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

    const swiper2 = new Swiper(".video .slider", {
        spaceBetween: 42,
        slidesPerView: 3,
        loop: true,

        pagination: {
            el: ".video .dots",
            clickable: true,
        },
        navigation: {
            nextEl: ".video .arrow-next",
            prevEl: ".video .arrow-prev",
        },
        on: {
            slideChange: function () {
                setTimeout(changeVideo, 0);
                ytPlayers.forEach(p => { try { p.pauseVideo(); } catch (e) { } });
            },
        },

        breakpoints: {
            320: {
                slidesPerView: 3
            },
            991: {
                slidesPerView: 3
            }
        },
    });

    function changeVideo() {
        const active = document.querySelector('.video .swiper-slide-active');
        const videoEl = document.querySelector('.video .video-player');
        if (!active || !videoEl) return;

        const poster = active.getAttribute('data-poster');
        const src = active.getAttribute('data-video');

        if (!poster && !src) return;

        // Обновляем poster
        if (poster) {
            videoEl.setAttribute('poster', poster);
        }

        // Обновляем <source> внутри <video>
        let sourceEl = videoEl.querySelector('source[type="video/mp4"]')
            || videoEl.querySelector('source');
        if (!sourceEl) {
            sourceEl = document.createElement('source');
            sourceEl.type = 'video/mp4';
            videoEl.appendChild(sourceEl);
        }
        if (src) {
            sourceEl.src = src;
        }

        videoEl.load();
        playToggle.src = "./assets/img/video/play.svg";
    }

    // swiper2.on('slideChange', updateVideoFromActiveSlide);

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
        if (!document.fullscreenElement) {
            player.parentElement.requestFullscreen();
            fullscreenBtn.src = "./assets/img/video/fullscreen-exit.svg";
        } else {
            document.exitFullscreen();
            fullscreenBtn.src = "./assets/img/video/fullscreen.svg";
        }
    });



    function showSpeed(rate) {
        if (!speedIndicator) return;
        speedIndicator.textContent = rate.toFixed(2) + 'x';
        speedIndicator.style.opacity = '1';

        // Сброс предыдущего таймера, если был
        if (showSpeed._timer) {
            clearTimeout(showSpeed._timer);
        }

        showSpeed._timer = setTimeout(() => { speedIndicator.style.opacity = '0'; }, 1000);



    }

    // Изменение скорости (вставь в свой код вместо текущего или обнови)
    function changeSpeed(delta) {
        // Границы как у YouTube: 0.25x–2x (можно 0.25–2, 0.25 шаг)
        const min = 0.25;
        const max = 2.0;
        // Округляем к ближайшему шагу 0.25
        let next = Math.round((video.playbackRate + delta) / 0.25) * 0.25;
        if (next < min) next = min;
        if (next > max) next = max;

        video.playbackRate = next;
        showSpeed(next);
    }



    document.addEventListener('keydown', (e) => {
        const code = e.code.toLowerCase();
        if (code === 'space') { e.preventDefault(); togglePlay(); }
        else if (code === 'keym' || code === 'ь' || code === 'м') { volumeIcon.click(); }
        else if (code === 'keyf' || code === 'а') { fullscreenBtn.click(); }
        else if (e.shiftKey && (e.key === '<' || e.key === 'Б')) { changeSpeed(-0.25); }
        else if (e.shiftKey && (e.key === '>' || e.key === 'Ю')) { changeSpeed(0.25); }
    });

    // Установка начальных значений и заливок
    video.volume = volumeSlider.value / 100;
    updateVolumeBackground();
    updateProgressBackground(0);

    const gallery = document.getElementById('gallery');
    const galleryItems = document.querySelectorAll('.gallery-items .item img');

    let lastScrollY = window.scrollY;
    let isScrollingDown = true;
    let animatedItems = new Set();
    let visibleItems = new Set();
    let isInitialLoad = true;

    // Инициализация состояния элементов
    function initializeItems() {
        galleryItems.forEach((item, index) => {
            item.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
            item.style.transform = 'translateY(60px) scale(0.9)';
            item.style.opacity = '0';
            item.dataset.index = index;
        });
    }

    // Анимация конкретного элемента
    function animateItem(item, delay = 0) {
        const index = parseInt(item.dataset.index);
        setTimeout(() => {
            item.style.transform = 'translateY(0) scale(1)';
            item.style.opacity = '1';
            animatedItems.add(index);
        }, delay);
    }

    // Показать элемент без анимации
    function showItemInstantly(item) {
        const index = parseInt(item.dataset.index);
        item.style.transition = 'none';
        item.style.transform = 'translateY(0) scale(1)';
        item.style.opacity = '1';
        animatedItems.add(index);
        setTimeout(() => {
            item.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
        }, 50);
    }

    // Проверка видимости конкретного элемента
    function isItemVisible(item) {
        const rect = item.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        return rect.top < windowHeight * 0.9 && rect.bottom > 0;
    }

    // Проверка видимости галереи в целом
    function isGalleryInViewport() {
        const rect = gallery.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        return rect.top < windowHeight && rect.bottom > 0;
    }

    // Проверка, находится ли пользователь уже прошел галерею полностью
    function hasPassedGallery() {
        const galleryTop = gallery.offsetTop;
        const galleryHeight = gallery.offsetHeight;
        const currentScrollY = window.scrollY;

        return currentScrollY > galleryTop + galleryHeight;
    }

    // Проверка, находится ли пользователь в пределах секции галереи
    function isWithinGallerySection() {
        const galleryTop = gallery.offsetTop;
        const galleryHeight = gallery.offsetHeight;
        const currentScrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        return currentScrollY + windowHeight > galleryTop &&
            currentScrollY < galleryTop + galleryHeight;
    }

    // Обработчик скролла
    function handleScroll() {
        const currentScrollY = window.scrollY;
        isScrollingDown = currentScrollY > lastScrollY;

        if (isGalleryInViewport()) {
            let animationDelay = 0;

            galleryItems.forEach((item) => {
                const index = parseInt(item.dataset.index);
                const isCurrentlyVisible = isItemVisible(item);
                const wasVisible = visibleItems.has(index);

                if (isCurrentlyVisible) {
                    visibleItems.add(index);

                    if (isScrollingDown && !animatedItems.has(index)) {
                        // Прокручиваем вниз и элемент еще не анимирован
                        animateItem(item, animationDelay);
                        animationDelay += 80;
                    } else if (!isScrollingDown && !animatedItems.has(index)) {
                        // Прокручиваем вверх и элемент не анимирован - показываем сразу
                        showItemInstantly(item);
                    }
                } else {
                    visibleItems.delete(index);
                }
            });
        } else if (currentScrollY < gallery.offsetTop) {
            // Если прокрутили выше галереи, сбрасываем состояние
            animatedItems.clear();
            visibleItems.clear();
            initializeItems();
        }

        lastScrollY = currentScrollY;
        isInitialLoad = false;
    }

    // Инициализация при загрузке страницы
    function initializeOnLoad() {
        // Добавляем индексы к элементам
        galleryItems.forEach((item, index) => {
            item.dataset.index = index;
        });

        if (hasPassedGallery()) {
            // Если страница загружена после галереи, показываем все элементы
            galleryItems.forEach(item => {
                showItemInstantly(item);
            });
        } else if (isWithinGallerySection()) {
            // Если страница загружена в пределах секции галереи - запускаем анимацию
            initializeItems();

            // Небольшая задержка для корректной инициализации
            setTimeout(() => {
                let animationDelay = 0;
                galleryItems.forEach((item) => {
                    if (isItemVisible(item)) {
                        animateItem(item, animationDelay);
                        animationDelay += 80;
                    }
                });
            }, 100);

        } else if (isGalleryInViewport()) {
            // Если галерея видна при загрузке сверху
            galleryItems.forEach((item) => {
                if (isItemVisible(item)) {
                    showItemInstantly(item);
                } else {
                    const index = parseInt(item.dataset.index);
                    item.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
                    item.style.transform = 'translateY(60px) scale(0.9)';
                    item.style.opacity = '0';
                }
            });
        } else {
            // Если галерея не видна, инициализируем все элементы как скрытые
            initializeItems();
        }
    }

    // Запускаем инициализацию
    initializeOnLoad();

    // Добавление обработчика скролла с throttling
    let ticking = false;

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(function () {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

    // Обработчик изменения размера окна
    window.addEventListener('resize', function () {
        if (!isInitialLoad) {
            requestTick();
        }
    });






});

function updateCheckedInput() {
    let GROUP = 'radio';
    let saved = localStorage.getItem('ticketTypeValue');
    if (!saved) return;
    let toCheck = document.querySelector(`input[type="radio"][name="${GROUP}"][value="${CSS.escape(saved)}"]`);
    if (toCheck) {
        toCheck.checked = true;
    }
}

updateCheckedInput();


let ticketTypeValue = document.querySelector('.tickets .inner input[type="radio"]').value;

document.addEventListener('change', function (e) {
    if (e.target.matches('input[type="radio"][name="radio"]')) {
        localStorage.setItem('ticketTypeValue', e.target.value);
    }
});



let ytPlayers = [];

// Инициализация YT API
function onYouTubeIframeAPIReady() {
    const frames = document.querySelectorAll('.slider .swiper-slide iframe[src*="youtube.com/embed"]');
    frames.forEach((iframe) => {
        // гарантируем enablejsapi=1
        const url = new URL(iframe.src);
        if (url.searchParams.get('enablejsapi') !== '1') {
            url.searchParams.set('enablejsapi', '1');
            iframe.src = url.toString();
        }
        const player = new YT.Player(iframe, {
            events: {
                onStateChange: handleStateChange
            }
        });
        ytPlayers.push(player);
    });
}

function pauseAllExcept(target) {
    ytPlayers.forEach(p => {
        if (p !== target) {
            try { p.pauseVideo(); } catch (e) { }
        }
    });
}

function handleStateChange(e) {
    // PLAYING = 1
    if (e.data === YT.PlayerState.PLAYING) {
        pauseAllExcept(e.target);
    }
}

mapboxgl.accessToken = 'pk.eyJ1Ijoia3NtMDkwNyIsImEiOiJjbWVyZ29sMXEwN3E5MmxzZHBnbnBzM2l6In0.VMVqwYxl6st5JK133ihvug';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ksm0907/cmeri6vfa00a901qtaicjad5x',
    center: [2.3364, 48.86091],
    zoom: 15.7
});

const marker1 = new mapboxgl.Marker({ color: 'black', scale: 0.85 })
    .setLngLat([2.3364, 48.86091])
    .addTo(map);

const marker2 = new mapboxgl.Marker({ color: '#757575', scale: 0.85 })
    .setLngLat([2.3333, 48.8602])
    .addTo(map);
const marker3 = new mapboxgl.Marker({ color: '#757575', scale: 0.85 })
    .setLngLat([2.3397, 48.8607])
    .addTo(map);
const marker4 = new mapboxgl.Marker({ color: '#757575', scale: 0.85 })
    .setLngLat([2.3330, 48.8619])
    .addTo(map);
const marker5 = new mapboxgl.Marker({ color: '#757575', scale: 0.85 })
    .setLngLat([2.3365, 48.8625])
    .addTo(map);


let ticketsBtn = document.querySelector(".tickets .col-right .btn");
let body = document.querySelector("body");

ticketsBtn.addEventListener("click", function () {
    body.classList.toggle("active-popup");
});

let closeBtn = document.querySelector('.footer .popup .close');
let overlay = document.querySelector('.footer .popup .overlay');

function closePopup() {
    body.classList.toggle("active-popup");
}

closeBtn.addEventListener("click", closePopup);
overlay.addEventListener("click", closePopup);

let date = document.getElementById('date');
let today = new Date().toLocaleDateString('en-CA');
date.setAttribute('min', today);


const dateEl = document.getElementById('date');

function updateFilled() {
    dateEl.classList.toggle('filled', !!dateEl.value);
}

dateEl.addEventListener('input', updateFilled);
dateEl.addEventListener('change', updateFilled);
updateFilled();

let minus = document.querySelectorAll('.minus');
function stepDown() {
    minus.forEach((item) => {
        item.addEventListener('click', () => {
            item.nextElementSibling.stepDown();
            item.nextElementSibling.matches('.basic')
                ? localStorage.setItem('basic', item.nextElementSibling.value)
                : localStorage.setItem('senior', item.nextElementSibling.value);
        });
    });
}
stepDown();

let plus = document.querySelectorAll('.plus');
function stepUp() {
    plus.forEach((item) => {
        item.addEventListener('click', () => {
            item.previousElementSibling.stepUp();
            item.previousElementSibling.matches('.basic')
                ? localStorage.setItem('basic', item.previousElementSibling.value) + document.querySelector('.plus').previousElementSibling.value
                : localStorage.setItem('senior', item.previousElementSibling.value);
        });
    });
}
stepUp();

