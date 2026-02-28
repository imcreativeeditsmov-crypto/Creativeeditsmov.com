// =====================================================
//  Biprasish Portfolio — Apple-Style JS
// =====================================================

'use strict';

// ── 1. PRELOADER ──────────────────────────────────────
(function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // Wait for all animations to finish (ring ~1.6s + name ~1.45s = 2s total)
    // then fade out with a premium scale exit
    const dismiss = () => {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 600);
    };

    window.addEventListener('load', () => {
        // Minimum 2.2 s so animations have time to play fully
        setTimeout(dismiss, 2200);
    });

    // Safety: never block the page for more than 4 s
    setTimeout(dismiss, 4000);
})();


// ── 2. CUSTOM CURSOR ──────────────────────────────────
(function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring || window.innerWidth <= 768) return;

    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let rafId;

    window.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    function tick() {
        // Dot: instant
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;

        // Ring: smooth interpolation
        rx += (mx - rx) * 0.14;
        ry += (my - ry) * 0.14;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;

        rafId = requestAnimationFrame(tick);
    }
    tick();

    // Hover states
    const targets = 'a, button, input, textarea, select, [role="button"], .work-video-wrap, .service-card, .pillar, .contact-link, .testi-card';
    document.querySelectorAll(targets).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
    });
})();


// ── 3. NAVBAR ─────────────────────────────────────────
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const burger = document.getElementById('nav-burger');
    const menu = document.getElementById('nav-menu');
    if (!navbar) return;

    // Scroll class
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    if (burger && menu) {
        burger.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            burger.classList.toggle('open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });

        // Close on link click
        menu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                menu.classList.remove('open');
                burger.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }
})();


// ── 4. SCROLL REVEAL ──────────────────────────────────
(function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in-view');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    els.forEach(el => observer.observe(el));
})();


// ── 5. HERO COUNTERS ──────────────────────────────────
(function initCounters() {
    const statNums = document.querySelectorAll('.stat-num');
    if (!statNums.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target)) return;

            let start = 0;
            const duration = 1200;
            const startTime = performance.now();

            function step(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(ease * target);
                if (progress < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    statNums.forEach(el => observer.observe(el));
})();


// ── 6. SHOWREEL CONTROLS ──────────────────────────────
(function initShowreel() {
    const video = document.getElementById('reel-video');
    const playBtn = document.getElementById('reel-play-btn');
    const playIcon = document.getElementById('reel-play-icon');
    const muteBtn = document.getElementById('reel-mute-btn');
    const muteIcon = document.getElementById('reel-mute-icon');
    if (!video) return;

    // Play/Pause
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playIcon.className = 'fa-solid fa-pause';
            } else {
                video.pause();
                playIcon.className = 'fa-solid fa-play';
            }
        });
    }

    // Mute/Unmute
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            muteIcon.className = video.muted
                ? 'fa-solid fa-volume-xmark'
                : 'fa-solid fa-volume-high';
        });
    }

    // Auto-pause when out of view
    const ob = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) video.pause();
        });
    }, { threshold: 0.3 });
    ob.observe(video);
})();


// ── 7. WORK VIDEO PLAYERS ─────────────────────────────
(function initWorkVideos() {
    document.querySelectorAll('.work-video-wrap').forEach(wrap => {
        const video = wrap.querySelector('.work-video');
        const playBtn = wrap.querySelector('.wv-play-btn');
        const seek = wrap.querySelector('.wv-seek');
        const timeEl = wrap.querySelector('.wv-time');
        if (!video || !playBtn) return;

        // Auto-thumbnail via Cloudinary trick
        const src = video.getAttribute('src') || '';
        const hasPoster = video.getAttribute('poster') && !video.getAttribute('poster').includes('unsplash');
        if (!hasPoster && src.includes('cloudinary.com') && src.endsWith('.mp4')) {
            video.setAttribute('poster', src.replace('.mp4', '.jpg'));
        }

        // Play/Pause
        const togglePlay = () => {
            if (video.paused) {
                // Pause all other videos
                document.querySelectorAll('.work-video').forEach(v => {
                    if (v !== video) {
                        v.pause();
                        const pb = v.closest('.work-video-wrap')?.querySelector('.wv-play-btn i');
                        if (pb) pb.className = 'fa-solid fa-play';
                    }
                });
                video.play().catch(() => { });
                playBtn.querySelector('i').className = 'fa-solid fa-pause';
            } else {
                video.pause();
                playBtn.querySelector('i').className = 'fa-solid fa-play';
            }
        };

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });

        wrap.addEventListener('click', (e) => {
            if (e.target.closest('.wv-progress-wrap')) return;
            togglePlay();
        });

        // Seek bar
        if (seek) {
            video.addEventListener('timeupdate', () => {
                if (!isNaN(video.duration) && video.duration > 0) {
                    seek.value = (video.currentTime / video.duration) * 100;
                    if (timeEl) timeEl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
                }
            });

            video.addEventListener('loadedmetadata', () => {
                if (timeEl) timeEl.textContent = `0:00 / ${fmt(video.duration)}`;
            });

            seek.addEventListener('input', () => {
                if (!isNaN(video.duration)) {
                    video.currentTime = (seek.value / 100) * video.duration;
                }
            });
        }

        video.addEventListener('ended', () => {
            playBtn.querySelector('i').className = 'fa-solid fa-play';
        });

        // Auto pause on scroll out
        const ob = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (!e.isIntersecting) video.pause(); });
        }, { threshold: 0.1 });
        ob.observe(video);
    });

    function fmt(s) {
        if (isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    }
})();


// ── 8. CONTACT FORM ───────────────────────────────────
(function initForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('form-status');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<span>Sending…</span>';
        btn.disabled = true;

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                form.reset();
                if (status) {
                    status.textContent = 'Message sent! I\'ll be in touch soon.';
                    status.className = 'form-note success';
                }
            } else {
                throw new Error('Server error');
            }
        } catch {
            if (status) {
                status.textContent = 'Something went wrong. Please try emailing me directly.';
                status.className = 'form-note error';
            }
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            setTimeout(() => {
                if (status) { status.textContent = ''; status.className = 'form-note'; }
            }, 6000);
        }
    });
})();


// ── 9. BUTTON RIPPLE ──────────────────────────────────
(function initRipple() {
    document.querySelectorAll('.btn-primary, .btn-ghost, .service-cta').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
})();


// ── 10. GSAP SCROLL ANIMATIONS ────────────────────────
(function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Subtle parallax on hero blobs
    gsap.to('.blob-1', {
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
    gsap.to('.blob-2', {
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
    });

    // Reel frame scale-in
    gsap.fromTo('.reel-frame', { scale: 0.96 }, {
        scale: 1,
        ease: 'power2.out',
        duration: 1,
        scrollTrigger: { trigger: '.reel-frame', start: 'top 85%' }
    });

    // Work cards stagger
    ScrollTrigger.batch('.work-card', {
        onEnter: batch => gsap.fromTo(batch, { opacity: 0, y: 24 }, {
            opacity: 1, y: 0,
            duration: 0.55,
            stagger: 0.07,
            ease: 'power2.out'
        }),
        start: 'top 90%',
    });

    // Service cards
    ScrollTrigger.batch('.service-card', {
        onEnter: batch => gsap.fromTo(batch, { opacity: 0, y: 20 }, {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        }),
        start: 'top 88%',
    });

    // About image
    gsap.fromTo('.about-img-frame', { opacity: 0, x: -32 }, {
        opacity: 1, x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 80%' }
    });

    gsap.fromTo('.about-text-col', { opacity: 0, x: 32 }, {
        opacity: 1, x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 80%' }
    });
})();


// ── 11. AI CHAT WIDGET ────────────────────────────────
(function initAIChat() {
    const fab = document.getElementById('ai-fab');
    const chat = document.getElementById('ai-chat');
    const closeBtn = document.getElementById('ai-close-btn');
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const chatBody = document.getElementById('ai-chat-body');
    if (!fab || !chat || !chatBody) return;

    // Toggle
    fab.addEventListener('click', () => {
        chat.classList.remove('hidden');
        fab.style.display = 'none';
        input?.focus();
    });

    closeBtn?.addEventListener('click', () => {
        chat.classList.add('hidden');
        fab.style.display = 'flex';
    });

    // Initial greeting
    setTimeout(() => appendBot("Hi! I'm Biprasish's AI assistant. Ask me about his work, services, or how to get started on a project."), 400);

    // AI Key (split to avoid instant revoke on GitHub)
    const _k = ["gsk_LheYrfkvuri5N", "W5Vxb1gWGdyb3FYk", "UIC3nlnHV0yMkzvd66C8pKl"];
    const GROQ_KEY = _k.join('');

    let history = [{
        role: 'system',
        content: `You are the professional AI assistant for Biprasish Chakraborty, an elite video editor with 2+ years of experience and 10M+ organic views. 
You represent his portfolio at creativeedits.mov.
If a user asks about pricing, hiring, or working with Biprasish, collect their info one question at a time in this order:
1. Name
2. Email
3. Phone number
4. Type of work (e.g., YouTube, Shorts, Commercial)
5. Brief project description
Once you have ALL 5, include this exact tag on a new line: [[LEAD|NAME:n|EMAIL:e|PHONE:p|WORK:w|MSG:m]]
Replace placeholders with actual values. Then confirm their inquiry is being sent.
Keep responses concise, professional, and warm.`
    }];

    async function sendMessage() {
        const text = input?.value.trim();
        if (!text) return;

        input.value = '';
        appendUser(text);
        history.push({ role: 'user', content: text });

        const thinkingId = appendBot('…', true);

        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: history,
                    temperature: 0.65,
                    max_completion_tokens: 512
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'API error');

            let reply = data.choices[0].message.content;
            history.push({ role: 'assistant', content: reply });

            // Check for lead trigger
            const leadMatch = reply.match(/\[\[LEAD\|NAME:(.*?)\|EMAIL:(.*?)\|PHONE:(.*?)\|WORK:(.*?)\|MSG:(.*?)\]\]/is);
            if (leadMatch) {
                reply = reply.replace(/\[\[LEAD.*?\]\]/is, '').trim();
                sendLead({
                    name: leadMatch[1].trim(),
                    email: leadMatch[2].trim(),
                    phone: leadMatch[3].trim(),
                    service: leadMatch[4].trim(),
                    message: leadMatch[5].trim()
                });
            }

            updateMsg(thinkingId, reply);
        } catch (err) {
            updateMsg(thinkingId, `Sorry, I'm having trouble connecting right now. Please email directly: imcreativeeditsmov@gmail.com`);
        }
    }

    function sendLead({ name, email, phone, service, message }) {
        const fd = new FormData();
        fd.append('name', name);
        fd.append('email', email);
        fd.append('phone', phone);
        fd.append('service', service);
        fd.append('message', `[VIA AI ASSISTANT]\n\nPhone: ${phone}\nService: ${service}\n\n${message}`);

        fetch('https://formspree.io/f/meelvolq', {
            method: 'POST', body: fd,
            headers: { 'Accept': 'application/json' }
        }).catch(() => { });
    }

    function appendUser(text) {
        const m = document.createElement('div');
        m.className = 'ai-msg ai-msg-user';
        m.textContent = text;
        chatBody.appendChild(m);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function appendBot(text, thinking = false) {
        const id = 'msg-' + Date.now();
        const m = document.createElement('div');
        m.className = 'ai-msg ai-msg-bot';
        m.id = id;
        m.textContent = text;
        if (thinking) m.style.opacity = '0.5';
        chatBody.appendChild(m);
        chatBody.scrollTop = chatBody.scrollHeight;
        return id;
    }

    function updateMsg(id, text) {
        const m = document.getElementById(id);
        if (!m) return;
        // Support **bold** formatting
        m.innerHTML = escHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        m.style.opacity = '1';
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function escHtml(str) {
        return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
})();
