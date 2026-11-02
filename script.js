// Shared Dark Mode, Mobile Menu, and Global UI Scripts
document.addEventListener('DOMContentLoaded', () => {
    // Lucide Icons initialization
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Dark Mode Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i data-lucide="sun"></i>';
    } else {
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i data-lucide="moon"></i>';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggleBtn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    // Mobile Hamburger Menu Logic
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav-menu');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close menu when clicking nav links on mobile
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }

    // Navbar Scrolled Shadow Effect
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Scroll Fade-In Observer
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => observer.observe(el));
    }
});
