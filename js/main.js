/* ============================================================
   FirstChild FERTILITY - MAIN APPLICATION (COMPLETE UPDATED)
   Complete JavaScript with all routes, dashboard bindings & auth
   ============================================================ */

// ============================================================
// 1. STATE MANAGEMENT (Store)
// ============================================================

const Store = {
    state: new Proxy({
        user: JSON.parse(localStorage.getItem('nova_user')) || null,
        theme: localStorage.getItem('nova_theme') || 'light',
        dir: localStorage.getItem('nova_dir') || 'ltr',
        route: 'home',
        isMobileMenuOpen: false,
        dashboardView: 'main'
    }, {
        set(target, key, value) {
            target[key] = value;
            if (key === 'user') localStorage.setItem('nova_user', JSON.stringify(value));
            if (key === 'theme') localStorage.setItem('nova_theme', value);
            if (key === 'dir') localStorage.setItem('nova_dir', value);
            if (key === 'user' || key === 'theme' || key === 'dir') {
                app.syncGlobalUI();
            }
            return true;
        }
    })
};

// ============================================================
// 2. CORE APP CONTROLLER
// ============================================================

const app = {
    init() {
        this.applyTheme();
        this.applyDir();
        this.syncGlobalUI();
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.router = router;
    },
    jumpToTreatment(sectionId) {
    router.navigate('treatments');
    
    // Poll every 50ms until the treatments page content is loaded and the element exists
    const checkInterval = setInterval(() => {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            clearInterval(checkInterval);
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 50);

    // Safety timeout to clear interval after 2 seconds if element isn't found
    setTimeout(() => clearInterval(checkInterval), 2000);
},

    initIntroAnimation() {
        // Animation removed completely
    },

    toggleTheme() {
        Store.state.theme = Store.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    },

    applyTheme() {
        if (Store.state.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    toggleDir() {
        Store.state.dir = Store.state.dir === 'ltr' ? 'rtl' : 'ltr';
        this.applyDir();
    },

    applyDir() {
        document.documentElement.setAttribute('dir', Store.state.dir);
    },

    toggleMobileMenu() {
        Store.state.isMobileMenuOpen = !Store.state.isMobileMenuOpen;
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('translate-x-full', !Store.state.isMobileMenuOpen);
            menu.classList.toggle('translate-x-0', Store.state.isMobileMenuOpen);
        }
    },

    openModal(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('hidden');
            el.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('flex');
            el.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    handleBookingSubmit(e) {
        e.preventDefault();
        this.closeModal('consultation-modal');
        this.toast('Consultation request received. Our care coordinator will contact you within 2 hours.');
        e.target.reset();
    },

    syncGlobalUI() {
        const authZone = document.getElementById('auth-nav-zone');
        const mobileAuthZone = document.getElementById('mobile-auth-zone');

        if (!authZone || !mobileAuthZone) return;

        const authHtml = Store.state.user
            ? `<div class="flex items-center gap-3">
                <button onclick="router.navigate('dashboard')" class="bg-blue-500/50 dark:bg-white text-black px-5 py-2.5 rounded-full text-[13px] font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                    My Dashboard
                </button>
                <button onclick="auth.logout()" class="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                    <i data-lucide="log-out" class="w-5 h-5"></i>
                </button>
               </div>`
            : `<button onclick="router.navigate('login')" class="bg-slate-900 dark:bg-white dark:text-slate-950 text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:shadow-xl transition-all">
                    Patient Portal
               </button>`;

        authZone.innerHTML = authHtml;
        mobileAuthZone.innerHTML = authHtml;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    handleScroll() {
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
                el.classList.add('active');
            }
        });

        const header = document.getElementById('global-header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('py-2');
            } else {
                header.classList.remove('py-2');
            }
        }
    },

    startLiveChat() {
        if (Store.state.user) {
            router.navigate('coming-soon');
            app.toast('🚀 Live Chat feature is coming soon! We\'ll notify you when it\'s ready.', 'info');
        } else {
            app.toast('Please log in to access Live Chat.', 'info');
            router.navigate('login');
        }
    },

    viewCarePlan() {
        if (Store.state.user) {
            this.toast('🔧 Care Plan feature is currently under maintenance. We\'re enhancing your experience!', 'info');
            setTimeout(() => {
                router.navigate('maintenance');
            }, 1500);
        } else {
            this.toast('Please log in to access your Care Plan.', 'info');
            setTimeout(() => {
                router.navigate('login');
            }, 1200);
        }
    },
    
    toast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        const borderColor = type === 'success' ? 'border-emerald-500' : 'border-blue-500';
        const textColor = type === 'success' ? 'text-emerald-500' : 'text-blue-500';

        toast.className = `glass px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-l-4 animate-in ${borderColor}`;
        toast.innerHTML = `
            <div class="${textColor}"><i data-lucide="${icon}"></i></div>
            <span class="text-sm font-bold">${msg}</span>
        `;

        container.appendChild(toast);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 300ms ease';
            setTimeout(() => toast.remove(), 350);
        }, 3500);
    }
};

// ============================================================
// 3. AUTHENTICATION
// ============================================================

const auth = {
    login(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto"></i>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        setTimeout(() => {
            Store.state.user = {
                name: 'Sarah McAllister',
                id: 'NC-7721',
                cycle: 'Ovarian Stimulation & Monitoring',
                progress: 65,
                specialist: 'Dr. Julianna Thorne',
                nextAppt: 'Oct 14, 2026 - 10:30 AM'
            };

            app.toast('Secure Login Successful. Welcome back.');
            router.navigate('dashboard');

            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }, 1200);
    },

    socialLogin(provider) {
        app.toast(`Connecting with ${provider}...`);
        
        setTimeout(() => {
            Store.state.user = {
                name: provider === 'Google' ? 'Sarah McAllister (Google)' : 'Sarah McAllister (Apple)',
                id: 'NC-7721',
                cycle: 'Ovarian Stimulation & Monitoring',
                progress: 65,
                specialist: 'Dr. Julianna Thorne',
                nextAppt: 'Oct 14, 2026 - 10:30 AM'
            };

            app.toast(`Successfully signed in with ${provider}!`);
            router.navigate('dashboard');
        }, 1000);
    },

    logout() {
        Store.state.user = null;
        app.toast('You have been securely logged out.');
        router.navigate('home');
    }
};

// ============================================================
// 4. VIEW RENDERERS & DASHBOARD TEMPLATE BINDINGS
// ============================================================

const Views = {
    async loadPage(pageName) {
        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            console.warn(`Failed to load ${pageName}.html:`, error);
            return this.getFallbackContent(pageName);
        }
    },
    

    getFallbackContent(pageName) {
        const fallbacks = {
            home: `<section class="max-w-7xl mx-auto px-6 py-12 lg:py-24 text-center"><h1 class="text-6xl md:text-8xl font-serif font-bold mb-8">Science Meets <span class="text-brand-blue italic">Deep</span> Care.</h1><p class="text-lg text-slate-500 max-w-2xl mx-auto">FirstChild integrates breakthrough reproductive technology with a human-centric approach.</p><button onclick="router.navigate('treatments')" class="mt-8 px-10 py-5 bg-brand-blue text-white rounded-full font-black text-sm uppercase tracking-widest">Explore Treatments</button></section>`,
            treatments: `<section class="max-w-5xl mx-auto px-6 py-12"><h2 class="text-5xl font-serif font-bold text-center mb-12">Advanced Protocols</h2><div class="space-y-6"><div class="glass p-8 rounded-[40px] border-l-8 border-l-brand-blue"><h3 class="text-2xl font-bold mb-4">IVF</h3><p>Our flagship IVF program combines state-of-the-art technology with personalized care.</p></div></div></section>`,
            doctors: `<section class="max-w-7xl mx-auto px-6 py-12"><h2 class="text-5xl font-serif font-bold text-center mb-6">The Elite Faculty</h2></section>`,
            stories: `<section class="max-w-7xl mx-auto px-6 py-12"><h2 class="text-5xl font-serif font-bold text-center mb-6">Success Narratives</h2></section>`,
            login: `<div class="max-w-md mx-auto px-6 py-20"><div class="glass p-10 rounded-5xl shadow-3xl border-2 border-brand-blue/20"><h2 class="text-4xl font-serif font-bold mb-2 text-center">Patient Gateway</h2><form onsubmit="auth.login(event)" class="space-y-6"><div><label class="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Email</label><input type="email" required value="sarah@mcallister.com" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800"></div><button type="submit" class="w-full py-5 bg-brand-blue text-white rounded-full">Login</button></form></div></div>`,
            signup: `<div class="max-w-md mx-auto px-6 py-20"><div class="glass p-10 rounded-5xl shadow-3xl border-2 border-brand-blue/20"><h2 class="text-4xl font-serif font-bold mb-2 text-center">Sign Up</h2></div></div>`,
            dashboard: `<div class="max-w-7xl mx-auto px-6 py-12"><h2 class="text-3xl font-serif font-bold text-center">Dashboard</h2></div>`,
            '404': `<section class="min-h-[70vh] flex items-center justify-center px-6"><div class="text-center"><h1 class="text-8xl font-serif font-bold text-brand-blue">404</h1><h2 class="text-3xl font-bold mt-4">Page Not Found</h2><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-brand-blue text-white rounded-full">Return Home</button></div></section>`,
            'coming-soon': `<section class="min-h-[70vh] flex items-center justify-center px-6"><div class="text-center"><h1 class="text-6xl font-serif font-bold">Coming Soon</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-brand-blue text-white rounded-full">Return Home</button></div></section>`,
            'maintenance': `<section class="min-h-[70vh] flex items-center justify-center px-6"><div class="text-center"><h1 class="text-6xl font-serif font-bold">Under Maintenance</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-brand-blue text-white rounded-full">Return Home</button></div></section>`
        };
        return fallbacks[pageName] || `<p>Page not found: ${pageName}</p>`;
    },

    dashboardMain(user) {
        return `
            <div class="glass p-10 rounded-5xl border-2 border-brand-blue/10">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div><h3 class="text-2xl font-bold">Cycle Status: <span class="text-brand-blue italic">${user.cycle}</span></h3><p class="text-xs text-slate-500 font-medium mt-1">Lead Specialist: ${user.specialist}</p></div>
                    <div><span class="px-4 py-1.5 bg-blue-50 text-brand-blue rounded-full text-xs font-black uppercase tracking-widest">Day 09 of 14</span></div>
                </div>
                <div class="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8 shadow-inner">
                    <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-blue to-brand-violet rounded-full transition-all duration-1000" style="width: ${user.progress}%"></div>
                </div>
                <div class="grid grid-cols-5 text-[10px] font-black uppercase tracking-widest text-center">
                    <div class="text-brand-blue">Suppression</div><div class="text-brand-blue">Stimulation</div>
                    <div class="text-slate-400">Retrieval</div><div class="text-slate-400">Fertilization</div><div class="text-slate-400">Transfer</div>
                </div>
            </div>
            <div class="glass p-6 rounded-4xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-4"><div class="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center shrink-0"><i data-lucide="calendar" class="w-6 h-6"></i></div><div><h4 class="font-bold text-sm">Next Scheduled Ultrasound & Bloodwork</h4><p class="text-xs text-slate-500">${user.nextAppt} at FirstChild Main Clinic, Suite 400</p></div></div>
                <button onclick="app.toast('Appointment confirmation details sent to your registered email.')" class="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-full text-xs font-bold shrink-0">View Details</button>
            </div>
        `;
    },

bindDashboardNav() {
        const navItems = document.querySelectorAll('#dash-nav .dash-nav-item');
        const content = document.getElementById('dash-content');
        const user = Store.state.user || { name: 'Sarah McAllister', id: 'NC-7721', cycle: 'Ovarian Stimulation & Monitoring', progress: 65, specialist: 'Dr. Julianna Thorne', nextAppt: 'Oct 14, 2026 - 10:30 AM' };

        if (!navItems.length || !content) return;

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;

                navItems.forEach(n => {
                    n.classList.remove('active');
                });
                
                item.classList.add('active');

                if (view === 'main') {
                    content.innerHTML = Views.dashboardMain(user);
                } else {
                    const template = document.getElementById(`template-${view}`);
                    if (template) {
                        content.innerHTML = template.innerHTML;
                    } else {
                        content.innerHTML = `<div class="adaptive-card p-8 rounded-5xl"><p>Section content unavailable or loading error.</p></div>`;
                    }
                }

                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                app.handleScroll();
            });
        });
    }
};

// ============================================================
// 5. SPA ROUTER WITH ENHANCED ANIME.JS PAGE SWITCH TRANSITIONS
// ============================================================

const router = {
    routes: {
        'home': Views.home,
        'treatments': Views.treatments,
        'doctors': Views.doctors,
        'stories': Views.stories,
        'login': Views.login,
        'signup': Views.signup,
        'dashboard': Views.dashboard,
        '404': Views.page404,
        'coming-soon': Views.comingSoon,
        'maintenance': Views.maintenance
    },

    navigate(path) {
        window.location.hash = path;
    },

    updateActiveNav(route) {
        document.querySelectorAll('.nav-link, .mobile-nav-link, .footer-nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.route === route);
        });
    },

    async renderView(viewName) {
        const container = document.getElementById('app-view-container');
        if (!container) return;

        const htmlPages = ['home', 'treatments', 'doctors', 'stories', 'login', 'signup', '404', 'coming-soon', 'maintenance', 'dashboard'];
        
        if (htmlPages.includes(viewName)) {
            if (viewName === 'dashboard') {
                const dashboardHtml = await Views.loadPage('dashboard');
                container.innerHTML = dashboardHtml;
                Views.bindDashboardNav();
                if (typeof lucide !== 'undefined') lucide.createIcons();
                app.handleScroll();
                return;
            }

            try {
                const response = await fetch(`pages/${viewName}.html`);
                if (response.ok) {
                    container.innerHTML = await response.text();
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    
                    if (viewName === 'login') {
                        const form = container.querySelector('form');
                        if (form) form.onsubmit = auth.login;
                    }
                    return;
                }
            } catch (e) {
                console.warn(`Failed to load ${viewName}.html, using fallback`);
            }
        }

        const viewFn = this.routes[viewName] || this.routes['404'];
        if (typeof viewFn === 'function') {
            container.innerHTML = viewFn();
        } else {
            container.innerHTML = await Views.loadPage(viewName) || `<p>Page not found</p>`;
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    async handleRoute() {
        const container = document.getElementById('app-view-container');
        const header = document.getElementById('global-header');
        const footer = document.querySelector('footer');
        if (!container) return;

        let path = window.location.hash.slice(1) || 'home';
        const validRoutes = ['home', 'treatments', 'doctors', 'stories', 'login', 'signup', 'dashboard', '404', 'coming-soon', 'maintenance'];
        
        if (!validRoutes.includes(path)) {
            path = '404';
        }

        if (path === 'dashboard' && !Store.state.user) {
            this.navigate('login');
            return;
        }

        const hideHeaderRoutes = ['login', 'signup', '404', 'coming-soon', 'maintenance'];
        const hideFooterRoutes = ['login', 'signup', '404', 'coming-soon', 'maintenance'];
        
        if (header) {
            header.style.display = hideHeaderRoutes.includes(path) ? 'none' : 'block';
        }
        if (footer) {
            footer.style.display = hideFooterRoutes.includes(path) ? 'none' : 'block';
        }

        this.updateActiveNav(path);

        // High-end Anime.js Page Switch Out Transition
        if (typeof anime !== 'undefined') {
            await anime({
                targets: container,
                opacity: [1, 0],
                translateY: [0, -30],
                scale: [1, 0.96],
                filter: ['blur(0px)', 'blur(10px)'],
                easing: 'easeInOutQuint',
                duration: 300
            }).finished;
        } else {
            container.classList.add('view-exit');
            await new Promise(r => setTimeout(r, 300));
        }

        await this.renderView(path);

        // High-end Anime.js Page Switch In Transition (Cinematic Spring & Blur Clearing)
        if (typeof anime !== 'undefined') {
            anime({
                targets: container,
                opacity: [0, 1],
                translateY: [40, 0],
                scale: [0.96, 1],
                filter: ['blur(10px)', 'blur(0px)'],
                easing: 'spring(1, 80, 12, 0)',
                duration: 650
            });
        } else {
            container.classList.remove('view-exit');
            container.classList.add('view-enter');
            requestAnimationFrame(() => {
                setTimeout(() => container.classList.remove('view-enter'), 450);
            });
        }

        window.scrollTo(0, 0);
        app.handleScroll();
    }
};

// ============================================================
// 6. FALLBACK VIEWS
// ============================================================

Views.page404 = () => `<section class="min-h-[70vh] flex items-center justify-center px-6"><div class="text-center"><h1 class="text-8xl font-serif font-bold text-brand-blue">404</h1><h2 class="text-3xl font-bold mt-4">Page Not Found</h2><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-brand-blue text-white rounded-full">Return Home</button></div></section>`;
Views.comingSoon = () => `<section class="min-h-[70vh] flex items-center justify-center px-6"><div class="text-center"><h1 class="text-6xl font-serif font-bold">Coming Soon</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-brand-blue text-white rounded-full">Return Home</button></div></section>`;
Views.maintenance = () => `<section class="min-h-[70vh] flex items-center justify-center px-6"><div class="text-center"><h1 class="text-6xl font-serif font-bold">Under Maintenance</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-brand-blue text-white rounded-full">Return Home</button></div></section>`;
// ============================================================
// 7. INITIALIZATION
// ============================================================

window.addEventListener('hashchange', () => router.handleRoute());

document.addEventListener('DOMContentLoaded', () => {
    app.init();

    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = 'home';
    } else {
        router.handleRoute();
    }
});

window.addEventListener('error', (e) => {
    console.error('Application error:', e);
});

window.app = app;
window.auth = auth;
window.router = router;
window.Store = Store;
window.Views = Views;