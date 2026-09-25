/* ============================================================
   FirstChild FERTILITY - MAIN APPLICATION
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
                if (typeof updateDashboardWithUserData === 'function') {
                    setTimeout(updateDashboardWithUserData, 100);
                }
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

    findUser(email) {
        if (!email) return null;
        return this._users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },

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
// 3. AUTHENTICATION SYSTEM (Stays on Page After Success)
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
                try {
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
                            loginTime: new Date().toISOString(),
                            isAuthenticated: true
                        };

                        if (submitBtn) {
                            submitBtn.disabled = false;
                            if (btnText) btnText.textContent = 'Authorize & Enter';
                            if (spinner) spinner.classList.add('hidden');
                        }

                        app.toast(`✅ Successfully logged in as ${user.name}!`);
                        // Intentionally stays on login page without redirection

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
                } catch (err) {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        if (btnText) btnText.textContent = 'Authorize & Enter';
                        if (spinner) spinner.classList.add('hidden');
                    }
                }
            }, 1200);
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
            const btnText = document.getElementById('signup-btn-text');
            const spinner = document.getElementById('signup-spinner');
            const errorEl = document.getElementById('signup-error');
            const errorMsg = document.getElementById('signup-error-message');
            const successEl = document.getElementById('signup-success');
            const successMsg = document.getElementById('signup-success-message');

            const name = nameInput?.value?.trim() || '';
            const email = emailInput?.value?.trim() || '';
            const password = passwordInput?.value?.trim() || '';
            const confirm = confirmInput?.value?.trim() || '';

            if (errorEl) errorEl.classList.add('hidden');
            if (successEl) successEl.classList.add('hidden');

            if (!name || !email || !password || !confirm) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'All fields are required.';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (password !== confirm) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Passwords do not match.';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (UserDatabase.emailExists(email)) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Email is already registered.';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                if (btnText) btnText.textContent = 'Creating Account...';
                if (spinner) spinner.classList.remove('hidden');
            }

            setTimeout(() => {
                const newUser = UserDatabase.createUser({ name, email, password });
                if (newUser) {
                    if (successMsg && successEl) {
                        successMsg.textContent = `🎉 Account created successfully for ${newUser.name}!`;
                        successEl.classList.remove('hidden');
                    }

                    Store.state.user = {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        isAuthenticated: true
                    };

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        if (btnText) btnText.textContent = 'Create Account';
                        if (spinner) spinner.classList.add('hidden');
                    }

                    app.toast(`🎉 Welcome, ${newUser.name}!`);
                    // Intentionally stays on signup page without redirection
                }
            }, 1200);
        } catch (err) {
            app.toast('Signup failed.', 'error');
        }
    },

    togglePasswordVisibility(inputId, iconId) {
        try {
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
        } catch (err) {}
    },

    isAuthenticated() {
        return true;
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
        const iconEl = document.getElementById('dir-icon');
        const labelEl = document.getElementById('dir-label');
        if (iconEl) iconEl.textContent = dir === 'rtl' ? 'format_textdirection_r_to_l' : 'format_textdirection_l_to_r';
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

    syncGlobalUI() {
        try {
            const authZone = document.getElementById('auth-nav-zone');
            const mobileZone = document.getElementById('mobile-auth-zone');

            const htmlContent = `
                <div class="flex items-center gap-2">
                    <button onclick="router.navigate('login')" class="bg-[#0251B0] dark:bg-white text-white dark:text-[#111318] px-4 py-2 rounded-full text-[11px] font-bold hover:shadow-xl transition-all whitespace-nowrap">
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
// 5. VIEWS & ROUTER (Screen-Fitting Fallbacks Included)
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
            
            // Screen-fitting container for Login
            login: `<div class="min-h-[80vh] flex items-center justify-center px-4 py-12"><div class="glass max-w-md w-full p-8 md:p-10 rounded-5xl shadow-2xl"><h2 class="text-3xl md:text-4xl font-serif font-bold text-center mb-6">Login</h2><form id="login-form" onsubmit="auth.login(event)" class="space-y-4"><div id="login-error" class="hidden p-3 bg-red-100 text-red-700 text-xs rounded-xl"><span id="login-error-message"></span></div><div id="login-success" class="hidden p-3 bg-emerald-100 text-emerald-700 text-xs rounded-xl"><span id="login-success-message"></span></div><div><label class="block text-[10px] font-black uppercase tracking-widest mb-1 text-neutral-400">Email Address</label><input type="email" id="login-email" placeholder="email@example.com" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-[#0251B0] outline-none text-xs text-neutral-900 dark:text-white" required /></div><div><label class="block text-[10px] font-black uppercase tracking-widest mb-1 text-neutral-400">Password</label><input type="password" id="login-password" placeholder="••••••••" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-[#0251B0] outline-none text-xs text-neutral-900 dark:text-white" required /></div><button type="submit" id="login-submit-btn" class="w-full py-4 bg-[#0251B0] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><span id="login-btn-text">Authorize & Enter</span><span id="login-spinner" class="hidden w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span></button></form><p class="text-xs text-center text-neutral-500 mt-6">Don't have an account? <a href="#signup" onclick="router.navigate('signup')" class="text-[#0251B0] font-bold hover:underline">Sign up</a></p></div></div>`,
            
            // Screen-fitting container for Signup
            signup: `<div class="min-h-[80vh] flex items-center justify-center px-4 py-12"><div class="glass max-w-md w-full p-8 md:p-10 rounded-5xl shadow-2xl"><h2 class="text-3xl md:text-4xl font-serif font-bold text-center mb-6">Create Account</h2><form id="signup-form" onsubmit="auth.signup(event)" class="space-y-4"><div id="signup-error" class="hidden p-3 bg-red-100 text-red-700 text-xs rounded-xl"><span id="signup-error-message"></span></div><div id="signup-success" class="hidden p-3 bg-emerald-100 text-emerald-700 text-xs rounded-xl"><span id="signup-success-message"></span></div><div><label class="block text-[10px] font-black uppercase tracking-widest mb-1 text-neutral-400">Full Name</label><input type="text" id="signup-name" placeholder="Jane Doe" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-[#0251B0] outline-none text-xs text-neutral-900 dark:text-white" required /></div><div><label class="block text-[10px] font-black uppercase tracking-widest mb-1 text-neutral-400">Email Address</label><input type="email" id="signup-email" placeholder="email@example.com" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-[#0251B0] outline-none text-xs text-neutral-900 dark:text-white" required /></div><div><label class="block text-[10px] font-black uppercase tracking-widest mb-1 text-neutral-400">Password</label><input type="password" id="signup-password" placeholder="••••••••" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-[#0251B0] outline-none text-xs text-neutral-900 dark:text-white" required /></div><div><label class="block text-[10px] font-black uppercase tracking-widest mb-1 text-neutral-400">Confirm Password</label><input type="password" id="signup-confirm" placeholder="••••••••" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-[#0251B0] outline-none text-xs text-neutral-900 dark:text-white" required /></div><button type="submit" id="signup-submit-btn" class="w-full py-4 bg-[#0251B0] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><span id="signup-btn-text">Create Account</span><span id="signup-spinner" class="hidden w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span></button></form><p class="text-xs text-center text-neutral-500 mt-6">Already have an account? <a href="#login" onclick="router.navigate('login')" class="text-[#0251B0] font-bold hover:underline">Login</a></p></div></div>`,
            
            dashboard: `<div class="max-w-7xl mx-auto px-6 py-12"><h2 class="text-3xl font-serif font-bold text-center">Dashboard</h2></div>`,
            '404': `<section class="min-h-[70vh] flex items-center justify-center"><div class="text-center"><h1 class="text-8xl font-serif font-bold text-[#0251B0]">404</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-[#0251B0] text-white rounded-full">Return Home</button></div></section>`
        };
        return fallbacks[name] || `<p>Page not found: ${name}</p>`;
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
            const pages = ['home', 'home-2', 'treatments', 'doctors', 'pricing', 'contact', 'stories', 'login', 'signup', 'dashboard', 'privacy', 'terms', '404', 'coming-soon', 'maintenance'];

            if (pages.includes(name)) {
                const res = await fetch(`pages/${name}.html`);
                if (res.ok) {
                    container.innerHTML = await res.text();
                    await new Promise(r => requestAnimationFrame(r));
                    if (typeof lucide !== 'undefined') lucide.createIcons();
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
        const valid = ['home', 'home-2', 'treatments', 'doctors', 'pricing', 'contact', 'stories', 'login', 'signup', 'dashboard', 'privacy', 'terms', '404', 'coming-soon', 'maintenance'];
        if (!valid.includes(path)) path = '404';

        this.updateActiveNav(path);

        // Hide header and footer on login, signup, and other utility pages
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