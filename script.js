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
// speedIndicator.style.display = 'block';
speedIndicator.style.opacity = '1';

// Сброс предыдущего таймера, если был
if (showSpeed._timer) {
clearTimeout(showSpeed._timer);
}
// showSpeed._timer = setTimeout(() => {
// speedIndicator.style.display = 'none';
// }, 1000); 


// speedIndicator.style.opacity = '1';
// clearTimeout(showSpeed._timer);
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

    // function changeSpeed(delta) {
    //     let newRate = Math.min(Math.max(video.playbackRate + delta, 0.25), 2);
    //     video.playbackRate = newRate;
    //     showSpeed(newRate);
    // }
    // function showSpeed(rate) {
    //     speedIndicator.textContent = rate.toFixed(2) + 'x';
    //     speedIndicator.style.display = 'block';
    //     clearTimeout(speedIndicator.timer);
    //     speedIndicator.timer = setTimeout(() => { speedIndicator.style.display = 'none'; }, 1000);
    // }

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
            requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        if (!isInitialLoad) {
            requestTick();
        }
    });
});