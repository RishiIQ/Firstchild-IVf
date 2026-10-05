/* ============================================================
   FirstChild FERTILITY - MAIN APPLICATION
   Complete with Auth, Routing, Dashboard View Binder, and Theme Sync
   ============================================================ */

// ============================================================
// 1. STATE MANAGEMENT
// ============================================================

const Store = {
    state: new Proxy({
        user: JSON.parse(localStorage.getItem('nova_user')) || {
            id: 'NC-7722',
            email: 'demo@firstchild.com',
            name: 'Demo Patient',
            cycle: 'Pre-Cycle Consultation',
            progress: 15,
            specialist: 'Dr. Sophia Chen',
            nextAppt: 'Oct 20, 2026 • 2:00 PM',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687&auto=format&fit=crop',
            verified: true,
            activeCycle: false,
            messages: 0,
            isAuthenticated: true
        },
        theme: localStorage.getItem('nova_theme') || 'light',
        dir: localStorage.getItem('nova_dir') || 'ltr',
        route: 'home',
        isMobileMenuOpen: false,
        dashboardView: 'main'
    }, {
        set(target, key, value) {
            target[key] = value;
            if (key === 'user') {
                localStorage.setItem('nova_user', JSON.stringify(value));
                if (typeof app !== 'undefined' && app.syncGlobalUI) app.syncGlobalUI();
            }
            if (key === 'theme') localStorage.setItem('nova_theme', value);
            if (key === 'dir') localStorage.setItem('nova_dir', value);
            return true;
        }
    })
};

// ============================================================
// 2. USER DATABASE
// ============================================================

const UserDatabase = {
    _users: [
        {
            id: 'NC-7721',
            email: 'sarah@mcallister.com',
            password: 'password123',
            name: 'Sarah McAllister',
            cycle: 'Ovarian Stimulation & Monitoring',
            progress: 65,
            specialist: 'Dr. Julianna Thorne',
            nextAppt: 'Oct 14, 2026 • 10:30 AM',
            avatar: 'https://images.unsplash.com/photo-1644860704769-c61c84be7836?q=80&w=687&auto=format&fit=crop',
            verified: true,
            activeCycle: true,
            messages: 2
        },
        {
            id: 'NC-7722',
            email: 'demo@firstchild.com',
            password: 'demo123',
            name: 'Demo Patient',
            cycle: 'Pre-Cycle Consultation',
            progress: 15,
            specialist: 'Dr. Sophia Chen',
            nextAppt: 'Oct 20, 2026 • 2:00 PM',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687&auto=format&fit=crop',
            verified: true,
            activeCycle: false,
            messages: 0
        }
    ],

    findUserByEmailAndPassword(email, password) {
        if (!email || !password) return null;
        return this._users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        ) || null;
    },

    emailExists(email) {
        if (!email) return false;
        return this._users.some(u => u.email.toLowerCase() === email.toLowerCase());
    },

    createUser(data) {
        if (!data || !data.email || !data.password) return null;
        const newUser = {
            id: 'NC-' + Math.floor(1000 + Math.random() * 9000),
            ...data,
            verified: false,
            activeCycle: false,
            messages: 0,
            createdAt: new Date().toISOString()
        };
        this._users.push(newUser);
        return newUser;
    }
};

// ============================================================
// 3. AUTHENTICATION SYSTEM
// ============================================================

const auth = {
    login(e) {
        e.preventDefault();
        try {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const submitBtn = document.getElementById('login-submit-btn');
            const btnText = document.getElementById('login-btn-text');
            const spinner = document.getElementById('login-spinner');
            const errorEl = document.getElementById('login-error');
            const errorMsg = document.getElementById('login-error-message');
            const successEl = document.getElementById('login-success');
            const successMsg = document.getElementById('login-success-message');

            const email = emailInput?.value?.trim() || '';
            const password = passwordInput?.value?.trim() || '';

            if (errorEl) errorEl.classList.add('hidden');
            if (successEl) successEl.classList.add('hidden');

            if (!email || !password) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Email and Password are required';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                if (btnText) btnText.textContent = 'Authenticating...';
                if (spinner) spinner.classList.remove('hidden');
            }

            setTimeout(() => {
                const user = UserDatabase.findUserByEmailAndPassword(email, password);
                if (user) {
                    if (successMsg && successEl) {
                        successMsg.textContent = `Welcome back, ${user.name}!`;
                        successEl.classList.remove('hidden');
                    }

                    Store.state.user = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        cycle: user.cycle,
                        progress: user.progress,
                        specialist: user.specialist,
                        nextAppt: user.nextAppt,
                        avatar: user.avatar,
                        verified: user.verified,
                        activeCycle: user.activeCycle,
                        messages: user.messages,
                        isAuthenticated: true
                    };

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        if (btnText) btnText.textContent = 'Authorize & Enter';
                        if (spinner) spinner.classList.add('hidden');
                    }

                    app.toast(`✅ Successfully logged in as ${user.name}!`);
                } else {
                    if (errorMsg && errorEl) {
                        errorMsg.textContent = 'Incorrect email or password.';
                        errorEl.classList.remove('hidden');
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        if (btnText) btnText.textContent = 'Authorize & Enter';
                        if (spinner) spinner.classList.add('hidden');
                    }
                }
            }, 1000);
        } catch (err) {
            app.toast('Login failed. Please try again.', 'error');
        }
    },

    signup(e) {
        e.preventDefault();
        try {
            const nameInput = document.getElementById('signup-name');
            const emailInput = document.getElementById('signup-email');
            const passwordInput = document.getElementById('signup-password');
            const confirmInput = document.getElementById('signup-confirm');
            const submitBtn = document.getElementById('signup-submit-btn');

            const name = nameInput?.value?.trim() || '';
            const email = emailInput?.value?.trim() || '';
            const password = passwordInput?.value?.trim() || '';
            const confirm = confirmInput?.value?.trim() || '';

            if (password !== confirm) {
                app.toast('Passwords do not match.', 'error');
                return;
            }

            if (UserDatabase.emailExists(email)) {
                app.toast('Email is already registered.', 'error');
                return;
            }

            if (submitBtn) submitBtn.disabled = true;

            setTimeout(() => {
                const newUser = UserDatabase.createUser({ name, email, password });
                if (newUser) {
                    Store.state.user = {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        isAuthenticated: true
                    };
                    app.toast(`🎉 Welcome, ${newUser.name}!`);
                    router.navigate('dashboard');
                }
            }, 1000);
        } catch (err) {
            app.toast('Signup failed.', 'error');
        }
    },

    togglePasswordVisibility(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (!input || !icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            icon.setAttribute('data-lucide', 'eye');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    supportHelp() {
        app.toast('Redirecting to Care Directorate...');
        router.navigate('contact');
    },

    logout() {
        Store.state.user = null;
        app.toast('Logged out successfully.');
        router.navigate('home');
    }
};

// ============================================================
// 4. APP CONTROLLER
// ============================================================

const app = {
    init() {
        try {
            this.applyTheme();
            this.applyDir();
            this.syncGlobalUI();
            window.addEventListener('scroll', this.handleScroll.bind(this));
        } catch (err) {
            console.error('Init error:', err);
        }
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
        const dir = Store.state.dir || 'ltr';
        document.documentElement.setAttribute('dir', dir);
        const labelEl = document.getElementById('dir-label');
        if (labelEl) labelEl.textContent = dir === 'rtl' ? 'RTL' : 'LTR';
    },

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        if (!menu) return;
        Store.state.isMobileMenuOpen = !Store.state.isMobileMenuOpen;
        menu.classList.toggle('translate-x-full', !Store.state.isMobileMenuOpen);
        menu.classList.toggle('translate-x-0', Store.state.isMobileMenuOpen);
        document.body.style.overflow = Store.state.isMobileMenuOpen ? 'hidden' : '';
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

    startLiveChat() {
        app.toast('🚀 Care Concierge live stream connecting...');
        router.navigate('contact');
    },

    jumpToTreatment(treatmentId) {
        router.navigate('treatments');
        setTimeout(() => {
            const el = document.getElementById(treatmentId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    },

    handleBookingSubmit(e) {
        e.preventDefault();
        app.toast('✅ Consultation request received! A coordinator will call within 2 hours.');
        app.closeModal('consultation-modal');
        e.target.reset();
    },

    handleStorySubmit(e) {
        e.preventDefault();
        app.toast('🎉 Story submitted successfully! Thank you for sharing.');
        app.closeModal('story-modal');
        e.target.reset();
    },

    handleSaasFormSubmit(e) {
        e.preventDefault();
        const successMsg = document.getElementById('saas-success-msg');
        if (successMsg) successMsg.classList.remove('hidden');
        e.target.reset();
        app.toast('Enterprise collaboration request dispatched!');
    },

    toggleFaq(element) {
        const content = element.querySelector('.faq-content');
        const icon = element.querySelector('.faq-icon');
        if (!content || !icon) return;
        
        content.classList.toggle('hidden');
        icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    },

    videoComingSoon() {
        app.toast('🎬 Full patient video library premiering in Q1 2027.');
    },

    syncGlobalUI() {
        try {
            const authZone = document.getElementById('auth-nav-zone');
            const mobileZone = document.getElementById('mobile-auth-zone');

            const isAuth = Store.state.user && Store.state.user.isAuthenticated;
            const userName = isAuth ? Store.state.user.name.split(' ')[0] : 'Patient';

            const htmlContent = isAuth ? `
                <div class="flex items-center gap-2">
                    <button onclick="router.navigate('dashboard')" class="bg-[#0251B0] dark:bg-[#D1FF42] text-white dark:text-[#111318] px-4 py-2 rounded-full text-[11px] font-bold hover:shadow-xl transition-all whitespace-nowrap flex items-center gap-1.5">
                        <i data-lucide="user" class="w-3.5 h-3.5"></i> ${userName}
                    </button>
                    <button onclick="auth.logout()" class="p-2 rounded-full bg-neutral-100 dark:bg-white/5 hover:bg-red-500/10 text-neutral-600 dark:text-neutral-300 hover:text-red-500 transition-all" title="Logout">
                        <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                    </button>
                </div>` : `
                <div class="flex items-center gap-2">
                    <button onclick="router.navigate('login')" class="bg-[#0251B0] dark:bg-[#D1FF42] text-white dark:text-[#111318] px-4 py-2 rounded-full text-[11px] font-bold hover:shadow-xl transition-all whitespace-nowrap">
                        <i data-lucide="log-in" class="w-3.5 h-3.5 inline mr-1"></i> Login
                    </button>
                </div>`;

            if (authZone) authZone.innerHTML = htmlContent;
            if (mobileZone) mobileZone.innerHTML = htmlContent;

            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) {}
    },

    handleScroll() {
        try {
            document.querySelectorAll('.reveal').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.9) el.classList.add('active');
            });
        } catch (err) {}
    },

    toast(msg, type = 'success') {
        try {
            const container = document.getElementById('toast-container');
            if (!container) return;
            while (container.children.length >= 3) container.firstChild?.remove();

            const toast = document.createElement('div');
            const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'alert-circle';
            const border = type === 'success' ? 'border-emerald-500' : type === 'error' ? 'border-red-500' : 'border-blue-500';
            const color = type === 'success' ? 'text-emerald-500' : type === 'error' ? 'text-red-500' : 'text-blue-500';

            toast.className = `glass px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-l-4 animate-in ${border}`;
            toast.innerHTML = `<div class="${color}"><i data-lucide="${icon}"></i></div><span class="text-sm font-bold">${msg}</span>`;

            container.appendChild(toast);
            if (typeof lucide !== 'undefined') lucide.createIcons();

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 300ms ease';
                setTimeout(() => toast.remove(), 350);
            }, 3500);
        } catch (err) {}
    }
};

// ============================================================
// 5. VIEWS & DASHBOARD ROUTER BINDER
// ============================================================

const Views = {
    async loadPage(name) {
        try {
            const res = await fetch(`pages/${name}.html`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.text();
        } catch (err) {
            return this.getFallback(name);
        }
    },

    getFallback(name) {
        const fallbacks = {
            home: `<section class="max-w-7xl mx-auto px-6 py-24 text-center"><h1 class="text-6xl md:text-8xl font-serif font-bold">Science Meets <span class="text-[#0251B0] italic">Deep</span> Care.</h1><button onclick="router.navigate('treatments')" class="mt-8 px-10 py-5 bg-[#0251B0] text-white rounded-full">Explore Treatments</button></section>`,
            '404': `<section class="min-h-[70vh] flex items-center justify-center"><div class="text-center"><h1 class="text-8xl font-serif font-bold text-[#0251B0]">404</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-[#0251B0] text-white rounded-full">Return Home</button></div></section>`
        };
        return fallbacks[name] || `<p>Page not found: ${name}</p>`;
    },

    bindDashboardNav() {
        try {
            const items = document.querySelectorAll('#dash-nav .dash-nav-item');
            const content = document.getElementById('dash-content');
            if (!items.length || !content) return;

            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = item.dataset.view;
                    items.forEach(n => n.classList.remove('active'));
                    item.classList.add('active');

                    try {
                        if (view === 'main') {
                            const mainEl = document.getElementById('dash-main');
                            if (mainEl) {
                                mainEl.style.display = 'grid';
                                ['labs', 'appointments', 'medications', 'billing', 'messages'].forEach(v => {
                                    const sub = document.getElementById(`dash-${v}`);
                                    if (sub) { sub.style.display = 'none'; sub.innerHTML = ''; }
                                });
                            }
                        } else {
                            const mainEl = document.getElementById('dash-main');
                            if (mainEl) mainEl.style.display = 'none';

                            ['labs', 'appointments', 'medications', 'billing', 'messages'].forEach(v => {
                                const sub = document.getElementById(`dash-${v}`);
                                if (sub) {
                                    if (v === view) {
                                        const tmpl = document.getElementById(`template-${view}`);
                                        sub.innerHTML = tmpl ? tmpl.innerHTML : `<div class="adaptive-card p-8 rounded-5xl"><p>Loading...</p></div>`;
                                        sub.style.display = 'block';
                                    } else {
                                        sub.style.display = 'none';
                                        sub.innerHTML = '';
                                    }
                                }
                            });
                        }
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                        window.scrollTo(0, 0);
                    } catch (err) {
                        console.error('Nav error:', err);
                    }
                });
            });
        } catch (err) {
            console.error('Bind nav error:', err);
        }
    }
};

const router = {
    navigate(path) {
        window.location.hash = path;
    },

    updateActiveNav(route) {
        try {
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                link.classList.toggle('active', link.dataset.route === route);
            });
        } catch (err) {}
    },

    async renderView(name) {
        const container = document.getElementById('app-view-container');
        if (!container) return;

        try {
            const pages = ['home', 'home-2', 'about' ,'treatments', 'doctors', 'pricing', 'contact', 'stories', 'login', 'signup', 'dashboard', 'privacy', 'terms', '404', 'coming-soon', 'maintenance'];

            if (pages.includes(name)) {
                const res = await fetch(`pages/${name}.html`);
                if (res.ok) {
                    container.innerHTML = await res.text();
                    await new Promise(r => requestAnimationFrame(r));
                    if (typeof lucide !== 'undefined') lucide.createIcons();

                    if (name === 'dashboard') {
                        Views.bindDashboardNav();
                    }
                    if (name === 'login') {
                        const form = container.querySelector('#login-form');
                        if (form) form.onsubmit = auth.login;
                    }
                    if (name === 'signup') {
                        const form = container.querySelector('#signup-form');
                        if (form) form.onsubmit = auth.signup;
                    }
                    return;
                }
            }

            container.innerHTML = await Views.loadPage(name) || '<p>Page not found</p>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) {
            container.innerHTML = `<section class="min-h-[70vh] flex items-center justify-center"><h2 class="text-3xl font-bold text-red-500">Error</h2></section>`;
        }
    },

    async handleRoute() {
        let path = window.location.hash.slice(1) || 'home';
        const valid = ['home', 'home-2','about' ,'treatments', 'doctors', 'pricing', 'contact', 'stories', 'login', 'signup', 'dashboard', 'privacy', 'terms', '404', 'coming-soon', 'maintenance'];
        if (!valid.includes(path)) path = '404';

        this.updateActiveNav(path);

        const hide = ['login', 'signup', '404', 'coming-soon', 'maintenance'];
        const header = document.getElementById('global-header');
        const footer = document.querySelector('footer');
        if (header) header.style.display = hide.includes(path) ? 'none' : 'block';
        if (footer) footer.style.display = hide.includes(path) ? 'none' : 'block';

        const container = document.getElementById('app-view-container');
        if (container) container.style.opacity = '0';
        await new Promise(r => setTimeout(r, 150));

        await this.renderView(path);

        if (container) container.style.opacity = '1';
        window.scrollTo(0, 0);
        app.handleScroll();
    }
};

// ============================================================
// 6. INIT
// ============================================================

window.addEventListener('hashchange', () => router.handleRoute());

document.addEventListener('DOMContentLoaded', () => {
    try {
        app.init();
        if (!window.location.hash || window.location.hash === '#') {
            window.location.hash = 'home';
        } else {
            router.handleRoute();
        }
    } catch (err) {
        console.error('Init failed:', err);
    }
});

window.app = app;
window.auth = auth;
window.router = router;
window.Store = Store;
window.Views = Views;
window.UserDatabase = UserDatabase;