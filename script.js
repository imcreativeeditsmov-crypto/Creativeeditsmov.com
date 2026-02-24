// Elite Portfolio Logic

// --- 1. Preloader & Scramble Text Logic ---
class TextScrambler {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // PRELOADER
    const preloader = document.querySelector('.preloader');
    const loaderPercentage = document.querySelector('.loader-percentage');
    const loaderBar = document.querySelector('.loader-bar');
    const scrambleElements = document.querySelectorAll('.scramble-text');

    // Scramble texts initially
    scrambleElements.forEach(el => {
        const fx = new TextScrambler(el);
        const text = el.getAttribute('data-text');
        fx.setText(text);
    });

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) progress = 100;

        if (loaderPercentage) loaderPercentage.innerText = progress + '%';
        if (loaderBar) loaderBar.style.width = progress + '%';

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(preloader, {
                        yPercent: -100,
                        duration: 1.2,
                        ease: "power4.inOut",
                        onComplete: initHeroAnimations
                    });
                } else {
                    preloader.style.display = 'none';
                    initHeroAnimations();
                }
            }, 800);
        }
    }, 100);

    function initHeroAnimations() {
        // --- Counter Animation ---
        const counters = document.querySelectorAll('.counter-up');
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / 50;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 40);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });

        // --- GSAP Scroll Reveal Initialization ---
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);

            // Hero Elements Reveal
            gsap.fromTo('.animate-in', {
                y: 40, opacity: 0
            }, {
                y: 0, opacity: 1, duration: 1.0, stagger: 0.1, ease: "power3.out"
            });

            // General Section Reveals
            gsap.utils.toArray('.pt-elem').forEach((elem) => {
                gsap.fromTo(elem, {
                    y: 40, opacity: 0
                }, {
                    y: 0, opacity: 1, duration: 1.0, ease: "power3.out",
                    scrollTrigger: { trigger: elem, start: "top 85%" }
                });
            });

            // Parallax
            gsap.utils.toArray('.parallax-elem').forEach((elem) => {
                const speed = elem.getAttribute('data-speed') || 0.2;
                gsap.to(elem, {
                    y: () => -(elem.parentElement.offsetHeight * speed),
                    ease: "none",
                    scrollTrigger: { trigger: elem.parentElement, start: "top bottom", end: "bottom top", scrub: 1 }
                });
            });
        } else {
            document.querySelectorAll('.animate-in, .pt-elem').forEach(el => {
                el.style.opacity = '1'; el.style.transform = 'none';
            });
        }

        // 3D and Particles disabled for ultra-minimal premium look
    }

    // --- 2. Custom Cursor & Hover States ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            cursorDot.style.left = `${e.clientX}px`; cursorDot.style.top = `${e.clientY}px`;
            cursorOutline.style.left = `${e.clientX}px`; cursorOutline.style.top = `${e.clientY}px`;
        });

        document.querySelectorAll('.hover-target, a, button, input, textarea, select').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    } else {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorOutline) cursorOutline.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // --- 3. Magnetic Buttons ---
    document.querySelectorAll('.magnetic').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const position = btn.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // --- 4. Dynamic Spotlight Cards ---
    document.querySelectorAll('.spotlight-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- 5. Mobile Menu & Navbar Scroll ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.replace(navLinks.classList.contains('active') ? 'ph-list' : 'ph-x', navLinks.classList.contains('active') ? 'ph-x' : 'ph-list');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('ph-x', 'ph-list');
        });
    });

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    });

    // --- 6. HTML5 Video Custom Player Controls (Ultra Premium) ---
    const showreelVideo = document.getElementById('video-showreel');
    const portfolioVideo = document.getElementById('video-portfolio');

    function setupNativeVideoControls(videoEl, playBtnId, muteBtnId) {
        if (!videoEl) return;
        const playBtn = document.getElementById(playBtnId);
        const muteBtn = document.getElementById(muteBtnId);

        // Custom Play/Pause logic
        const togglePlay = () => {
            if (videoEl.paused) {
                videoEl.play();
                if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-pause"></i>';
            } else {
                videoEl.pause();
                if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-play"></i>';
            }
        };

        if (playBtn) playBtn.addEventListener('click', togglePlay);

        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (videoEl.muted) {
                    videoEl.muted = false;
                    muteBtn.innerHTML = '<i class="ph-bold ph-speaker-high"></i>';
                } else {
                    videoEl.muted = true;
                    muteBtn.innerHTML = '<i class="ph-bold ph-speaker-slash"></i>';
                }
            });
        }

        // Auto-preview logic (Intersection Observer)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Video is in view, play it automatically (apne aap preview)
                    videoEl.play().then(() => {
                        if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-pause"></i>';
                    }).catch(() => {
                        // Browser might block autoplay without interaction
                        if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-play"></i>';
                    });
                } else {
                    // Video out of view, pause to save resources
                    videoEl.pause();
                    if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-play"></i>';
                }
            });
        }, { threshold: 0.3 });

        observer.observe(videoEl);
    }

    setupNativeVideoControls(showreelVideo, 'showreel-play-btn', 'showreel-mute-btn');
    setupNativeVideoControls(portfolioVideo, 'portfolio-play-btn', 'portfolio-mute-btn');

    // --- 7. Hover Preview for Portfolio Images ---
    const hoverPreviewContainers = document.querySelectorAll('.hover-preview-container');
    hoverPreviewContainers.forEach(container => {
        const video = container.querySelector('.hover-video');
        if (video) {
            container.addEventListener('mouseenter', () => {
                video.currentTime = 0; // Reset to start
                video.play().catch(e => console.log("Hover autoplay restricted: ", e));
            });
            container.addEventListener('mouseleave', () => {
                video.pause();
            });
        }
    });

    // Make sure main videos play on mouseenter too if paused
    const videoContainers = document.querySelectorAll('.video-ratio, .card-image-placeholder');
    videoContainers.forEach(container => {
        container.addEventListener('mouseenter', () => {
            const vid = container.querySelector('video');
            if (vid && vid.paused) {
                vid.play().then(() => {
                    const pb = container.querySelector('[id$="-play-btn"]');
                    if (pb) pb.innerHTML = '<i class="ph-bold ph-pause"></i>';
                }).catch(e => { });
            }
        });
    });

    // --- 8. Premium Particle Background (LanderX Style) ---
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];

        // LanderX colors for particles
        const colors = ['#ffffff', '#4D76FD', '#3b5bdb'];

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > width || this.x < 0) this.speedX *= -1;
                if (this.y > height || this.y < 0) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Optimize particle count based on screen size
            const numberOfParticles = Math.floor((width * height) / 12000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Draw connecting lines if close
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = '#4D76FD';
                        // Line opacity based on distance
                        ctx.globalAlpha = (120 - distance) / 1200;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1; // reset
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        });
    }

    // --- 9. Premium Button Click Glow/Shine ---
    const interactiveButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline, .btn-primary-sm, .submit-btn, button, .ctrl-btn');
    interactiveButtons.forEach(btn => {
        // Ensure relative positioning for ripple containment
        if (window.getComputedStyle(btn).position === 'static') {
            btn.style.position = 'relative';
        }
        btn.style.overflow = 'hidden';

        btn.addEventListener('click', function (e) {
            // Remove the class if it exists to restart animation
            this.classList.remove('btn-clicked');

            // Force browser reflow to apply the class reset
            void this.offsetWidth;

            // Add the animation class
            this.classList.add('btn-clicked');

            // Add the internal shining ripple
            let rect = this.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            let ripple = document.createElement('span');
            ripple.className = 'click-ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            // Cleanup animation elements
            setTimeout(() => {
                ripple.remove();
                this.classList.remove('btn-clicked');
            }, 600);
        });
    });
});
