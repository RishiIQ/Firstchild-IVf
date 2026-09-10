/* ============================================================
   FirstChild FERTILITY - MAIN APPLICATION
   Complete with Login, Signup, User Database, Dashboard
   ============================================================ */

// ============================================================
// 1. STATE MANAGEMENT
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
            avatar: 'https://images.unsplash.com/photo-1644860704769-c61c84be7836?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            verified: true,
            activeCycle: false,
            messages: 0
        },
        {
            id: 'NC-7723',
            email: 'jane@doe.com',
            password: 'jane123',
            name: 'Jane Doe',
            cycle: 'Egg Freezing',
            progress: 40,
            specialist: 'Dr. Marcus Sterling',
            nextAppt: 'Oct 25, 2026 • 9:00 AM',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            verified: true,
            activeCycle: true,
            messages: 5
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
// 3. AUTHENTICATION SYSTEM
// ============================================================

const auth = {
    _loginAttempts: 0,
    _lastAttemptTime: 0,
    _signupAttempts: 0,
    _lastSignupTime: 0,

    // ----- LOGIN -----
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

            // Validation
            if (!email) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Email is required';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (!password) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Password is required';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (password.length < 4) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Password must be at least 4 characters';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            const now = Date.now();
            if (this._loginAttempts >= 5 && (now - this._lastAttemptTime) < 60000) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Too many attempts. Please wait 1 minute.';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                btnText.textContent = 'Authenticating...';
                spinner.classList.remove('hidden');
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();

            setTimeout(() => {
                try {
                    this._loginAttempts++;
                    this._lastAttemptTime = Date.now();

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

                        const remember = document.getElementById('remember-me');
                        if (remember?.checked) {
                            localStorage.setItem('remembered_email', email);
                        } else {
                            localStorage.removeItem('remembered_email');
                        }

                        this._loginAttempts = 0;

                        if (submitBtn) {
                            submitBtn.disabled = false;
                            btnText.textContent = 'Authorize & Enter';
                            spinner.classList.add('hidden');
                        }

                        app.toast(`✅ Welcome back, ${user.name}!`);
                        setTimeout(() => router.navigate('dashboard'), 800);

                    } else {
                        const userExists = UserDatabase.emailExists(email);

                        if (errorMsg && errorEl) {
                            if (userExists) {
                                errorMsg.textContent = 'Incorrect password. Please try again.';
                            } else {
                                errorMsg.textContent = '❌ User not found. Please sign up.';
                            }
                            errorEl.classList.remove('hidden');
                        }

                        if (submitBtn) {
                            submitBtn.disabled = false;
                            btnText.textContent = 'Authorize & Enter';
                            spinner.classList.add('hidden');
                        }

                        if (passwordInput) {
                            passwordInput.value = '';
                            passwordInput.focus();
                        }
                    }
                } catch (err) {
                    console.error('Login error:', err);
                    if (errorMsg && errorEl) {
                        errorMsg.textContent = 'Something went wrong. Please try again.';
                        errorEl.classList.remove('hidden');
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        btnText.textContent = 'Authorize & Enter';
                        spinner.classList.add('hidden');
                    }
                }
            }, 1200);

        } catch (err) {
            console.error('Login function error:', err);
            app.toast('Login failed. Please refresh and try again.', 'error');
        }
    },

    // ----- SIGNUP -----
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

            // Validation
            if (!name) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Name is required';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (!email) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Email is required';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Please enter a valid email address';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (UserDatabase.emailExists(email)) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Email already registered. Please login.';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (!password) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Password is required';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (password.length < 4) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Password must be at least 4 characters';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (!confirm) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Please confirm your password';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (password !== confirm) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Passwords do not match';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            const now = Date.now();
            if (this._signupAttempts >= 3 && (now - this._lastSignupTime) < 60000) {
                if (errorMsg && errorEl) {
                    errorMsg.textContent = 'Too many attempts. Please wait 1 minute.';
                    errorEl.classList.remove('hidden');
                }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                btnText.textContent = 'Creating Account...';
                spinner.classList.remove('hidden');
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();

            setTimeout(() => {
                try {
                    this._signupAttempts++;
                    this._lastSignupTime = Date.now();

                    const newUser = UserDatabase.createUser({
                        name: name,
                        email: email,
                        password: password,
                        cycle: 'Initial Consultation',
                        progress: 0,
                        specialist: 'Dr. Julianna Thorne',
                        nextAppt: 'Please schedule your first consultation',
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0251B0&color=fff&size=128`,
                        verified: false,
                        activeCycle: false,
                        messages: 0
                    });

                    if (newUser) {
                        if (successMsg && successEl) {
                            successMsg.textContent = `🎉 Account created! Welcome, ${newUser.name}!`;
                            successEl.classList.remove('hidden');
                        }

                        Store.state.user = {
                            id: newUser.id,
                            name: newUser.name,
                            email: newUser.email,
                            cycle: newUser.cycle,
                            progress: newUser.progress,
                            specialist: newUser.specialist,
                            nextAppt: newUser.nextAppt,
                            avatar: newUser.avatar,
                            verified: newUser.verified,
                            activeCycle: newUser.activeCycle,
                            messages: newUser.messages,
                            loginTime: new Date().toISOString(),
                            isAuthenticated: true,
                            isNewUser: true
                        };

                        this._signupAttempts = 0;

                        if (submitBtn) {
                            submitBtn.disabled = false;
                            btnText.textContent = 'Create Account';
                            spinner.classList.add('hidden');
                        }

                        app.toast(`🎉 Welcome to FirstChild, ${newUser.name}!`);
                        setTimeout(() => router.navigate('dashboard'), 1000);

                    } else {
                        throw new Error('Failed to create account');
                    }

                } catch (err) {
                    console.error('Signup error:', err);
                    if (errorMsg && errorEl) {
                        errorMsg.textContent = err.message || 'Signup failed. Please try again.';
                        errorEl.classList.remove('hidden');
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        btnText.textContent = 'Create Account';
                        spinner.classList.add('hidden');
                    }
                }
            }, 1500);

        } catch (err) {
            console.error('Signup function error:', err);
            app.toast('Signup failed. Please try again.', 'error');
        }
    },

    // ----- SOCIAL LOGIN -----
    socialLogin(provider) {
        try {
            if (!provider || !['Google', 'Apple'].includes(provider)) {
                app.toast('Invalid provider.', 'error');
                return;
            }

            app.toast(`Connecting with ${provider}...`, 'info');

            const buttons = document.querySelectorAll('[onclick*="socialLogin"]');
            let target = null;
            buttons.forEach(btn => {
                if (btn.textContent?.includes(provider)) {
                    btn.disabled = true;
                    target = btn;
                    btn.innerHTML = 'Connecting...';
                }
            });

            setTimeout(() => {
                try {
                    const email = `${provider.toLowerCase()}_${Date.now()}@social.com`;
                    let user = UserDatabase.findUser(email);

                    if (!user) {
                        user = UserDatabase.createUser({
                            name: `${provider} User`,
                            email: email,
                            password: 'social_' + Math.random().toString(36).slice(-8),
                            cycle: 'Initial Consultation',
                            progress: 10,
                            specialist: 'Dr. Julianna Thorne',
                            nextAppt: 'Nov 1, 2026 • 11:00 AM',
                            avatar: `https://ui-avatars.com/api/?name=${provider}+User&background=0251B0&color=fff&size=128`,
                            verified: true,
                            activeCycle: false,
                            messages: 0
                        });
                    }

                    if (user) {
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
                            isAuthenticated: true,
                            isSocialLogin: true,
                            provider: provider
                        };

                        app.toast(`✅ Signed in with ${provider}!`, 'success');

                        buttons.forEach(btn => {
                            btn.disabled = false;
                            btn.innerHTML = btn.innerHTML?.replace('Connecting...', provider) || provider;
                        });

                        setTimeout(() => router.navigate('dashboard'), 600);
                    }
                } catch (err) {
                    console.error('Social login error:', err);
                    if (target) {
                        target.disabled = false;
                        target.innerHTML = provider;
                    }
                    app.toast(`Login with ${provider} failed.`, 'error');
                }
            }, 1500);

        } catch (err) {
            console.error('Social login error:', err);
            app.toast('Social login failed. Please try again.', 'error');
        }
    },

    // ----- PASSWORD TOGGLE -----
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
        } catch (err) {
            console.warn('Toggle password error:', err);
        }
    },

    // ----- SUPPORT -----
    supportHelp() {
        app.toast('📞 Call +1 (888) 555-FirstChild', 'info');
    },

    // ----- LOGOUT -----
    logout() {
        try {
            Store.state.user = null;
            localStorage.removeItem('remembered_email');
            app.toast('Logged out successfully.');
            router.navigate('home');
        } catch (err) {
            localStorage.removeItem('nova_user');
            location.reload();
        }
    },

    // ----- AUTH CHECK -----
    isAuthenticated() {
        try {
            return Store.state.user !== null && Store.state.user.isAuthenticated === true;
        } catch {
            return false;
        }
    },

    getUserData() {
        return Store.state.user || null;
    }
};

// ============================================================
// 4. DASHBOARD UPDATE
// ============================================================

function updateDashboardWithUserData() {
    try {
        const user = Store.state.user;
        if (!user) return;

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setText('profile-name', user.name || 'Patient');
        setText('profile-id', user.id || 'NC-0000');

        const avatar = document.getElementById('profile-avatar');
        if (avatar) {
            avatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Patient')}&background=0251B0&color=fff&size=128`;
        }

        const cycleBadge = document.getElementById('profile-cycle-badge');
        if (cycleBadge) {
            cycleBadge.textContent = user.activeCycle ? 'Active Cycle' : 'Pre-Cycle';
        }

        const verifiedBadge = document.getElementById('profile-verified-badge');
        if (verifiedBadge) {
            verifiedBadge.textContent = user.verified ? 'Verified' : 'Pending';
        }

        const cycleStatus = document.querySelector('.font-serif.text-xl.italic.font-bold');
        if (cycleStatus) cycleStatus.textContent = user.cycle || 'Cycle Status';

        const specialistEl = document.querySelector('.text-xs.text-neutral-700.dark\\:text-\\[\\#C7D1DD\\]');
        if (specialistEl) specialistEl.textContent = `Lead Specialist: ${user.specialist || 'Dr. Julianna Thorne'}`;

        const progressBar = document.querySelector('.h-full.bg-gradient-to-r');
        const progressText = document.querySelector('.absolute.inset-0.flex.items-center.justify-center.text-\\[11px\\]');
        if (progressBar) progressBar.style.width = `${user.progress || 0}%`;
        if (progressText) progressText.textContent = `${user.progress || 0}% Complete`;

        const msgBadge = document.querySelector('.dash-nav-item[data-view="messages"] .ml-auto');
        if (msgBadge) {
            msgBadge.textContent = user.messages || 0;
        }
    } catch (err) {
        console.error('Dashboard update error:', err);
    }
}

// ============================================================
// 5. APP CONTROLLER
// ============================================================

const app = {
    init() {
        try {
            this.applyTheme();
            this.applyDir();
            this.syncGlobalUI();

            window.addEventListener('scroll', this.handleScroll.bind(this));

            const remembered = localStorage.getItem('remembered_email');
            if (remembered) {
                const email = document.getElementById('login-email');
                if (email) email.value = remembered;
                const check = document.getElementById('remember-me');
                if (check) check.checked = true;
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const active = document.activeElement;
                    if (active?.closest('#login-form')) {
                        e.preventDefault();
                        document.getElementById('login-form')?.requestSubmit();
                    }
                    if (active?.closest('#signup-form')) {
                        e.preventDefault();
                        document.getElementById('signup-form')?.requestSubmit();
                    }
                }
            });

            window.addEventListener('storage', (e) => {
                if (e.key === 'nova_user') setTimeout(updateDashboardWithUserData, 100);
            });

            this.checkAuth();
            console.log('✅ App initialized');
        } catch (err) {
            console.error('Init error:', err);
        }
    },
    // ----- Video Coming Soon - Redirect to Maintenance -----
    videoComingSoon() {
        // Show info toast
        this.toast('🎬 Video testimonials are coming soon! We\'re producing high-quality stories for you.', 'info');
        
        // Redirect to maintenance page after a short delay
        setTimeout(() => {
            router.navigate('maintenance');
        }, 1800);
    },

    checkAuth() {
        try {
            if (auth.isAuthenticated()) {
                const route = window.location.hash.slice(1) || 'home';
                if (['login', 'signup'].includes(route)) router.navigate('dashboard');
            }
        } catch (err) {
            console.warn('Auth check error:', err);
        }
    },

    toggleTheme() {
        try {
            Store.state.theme = Store.state.theme === 'light' ? 'dark' : 'light';
            this.applyTheme();
        } catch (err) {
            console.warn('Theme toggle error:', err);
        }
    },

    applyTheme() {
        try {
            if (Store.state.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (err) {
            console.warn('Apply theme error:', err);
        }
    },

    toggleDir() {
        try {
            Store.state.dir = Store.state.dir === 'ltr' ? 'rtl' : 'ltr';
            this.applyDir();
        } catch (err) {
            console.warn('Dir toggle error:', err);
        }
    },

    applyDir() {
        try {
            document.documentElement.setAttribute('dir', Store.state.dir);
        } catch (err) {
            console.warn('Apply dir error:', err);
        }
    },

    toggleMobileMenu() {
        try {
            const menu = document.getElementById('mobile-menu');
            if (!menu) return;
            Store.state.isMobileMenuOpen = !Store.state.isMobileMenuOpen;
            menu.classList.toggle('translate-x-full', !Store.state.isMobileMenuOpen);
            menu.classList.toggle('translate-x-0', Store.state.isMobileMenuOpen);
            document.body.style.overflow = Store.state.isMobileMenuOpen ? 'hidden' : '';
        } catch (err) {
            console.warn('Mobile menu error:', err);
        }
    },

    openModal(id) {
        try {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('hidden');
                el.classList.add('flex');
                document.body.style.overflow = 'hidden';
            }
        } catch (err) {
            console.warn('Open modal error:', err);
        }
    },
    // Add inside your app object in js/main.js:
toggleFaq(element) {
    const content = element.querySelector('.faq-content');
    const icon = element.querySelector('.faq-icon');
    
    content.classList.toggle('hidden');
    
    if (content.classList.contains('hidden')) {
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.style.transform = 'rotate(180deg)';
    }
},

handleSaasFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const successMsg = document.getElementById('saas-success-msg');
    
    successMsg.classList.remove('hidden');
    form.reset();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
},

    closeModal(id) {
        try {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('flex');
                el.classList.add('hidden');
                document.body.style.overflow = '';
            }
        } catch (err) {
            console.warn('Close modal error:', err);
        }
    },

    handleBookingSubmit(e) {
        e.preventDefault();
        this.closeModal('consultation-modal');
        this.toast('✅ Consultation request received! Our team will contact you within 2 hours.');
        e.target.reset();
    },

    syncGlobalUI() {
        try {
            const authZone = document.getElementById('auth-nav-zone');
            const mobileZone = document.getElementById('mobile-auth-zone');

            const isLoggedIn = auth.isAuthenticated();

            const htmlContent = isLoggedIn
                ? `<div class="flex items-center gap-2">
                    <button onclick="router.navigate('dashboard')" class="bg-[#0251B0] dark:bg-[#D1FF42] text-white dark:text-[#111318] px-4 py-2 rounded-full text-[11px] font-bold shadow-lg hover:scale-105 transition-all whitespace-nowrap">
                        <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 inline mr-1"></i> Dashboard
                    </button>
                    <button onclick="auth.logout()" class="p-2 text-neutral-400 hover:text-red-500 transition-colors" title="Logout">
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                    </button>
                </div>`
                : `<button onclick="router.navigate('login')" class="bg-[#0251B0] dark:bg-white text-white dark:text-[#111318] px-4 py-2 rounded-full text-[11px] font-bold hover:shadow-xl transition-all whitespace-nowrap">
                    <i data-lucide="log-in" class="w-3.5 h-3.5 inline mr-1"></i> Login
                </button>`;

            if (authZone) authZone.innerHTML = htmlContent;
            if (mobileZone) mobileZone.innerHTML = htmlContent;

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } catch (err) {
            console.warn('Sync UI error:', err);
        }
    },

    handleScroll() {
        try {
            document.querySelectorAll('.reveal').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.9) el.classList.add('active');
            });
            const header = document.getElementById('global-header');
            if (header) {
                header.classList.toggle('py-2', window.scrollY > 50);
            }
        } catch (err) {}
    },

    startLiveChat() {
        if (auth.isAuthenticated()) {
            router.navigate('coming-soon');
            this.toast('🚀 Live Chat coming soon!');
        } else {
            this.toast('Please log in to access Live Chat.', 'info');
            router.navigate('login');
        }
    },

    viewCarePlan() {
        if (auth.isAuthenticated()) {
            this.toast('🔧 Care Plan under maintenance.', 'info');
            setTimeout(() => router.navigate('maintenance'), 1500);
        } else {
            this.toast('Please log in to access your Care Plan.', 'info');
            setTimeout(() => router.navigate('login'), 1200);
        }
    },

    jumpToTreatment(sectionId) {
        router.navigate('treatments');
        const check = setInterval(() => {
            const el = document.getElementById(sectionId);
            if (el) {
                clearInterval(check);
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
        setTimeout(() => clearInterval(check), 2000);
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
            toast.innerHTML = `
                <div class="${color}"><i data-lucide="${icon}"></i></div>
                <span class="text-sm font-bold">${msg}</span>
            `;

            container.appendChild(toast);
            if (typeof lucide !== 'undefined') lucide.createIcons();

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 300ms ease';
                setTimeout(() => toast.remove(), 350);
            }, 3500);
        } catch (err) {
            console.warn('Toast error:', err);
        }
    }
};

// ============================================================
// 6. VIEWS
// ============================================================

const Views = {
    async loadPage(name) {
        try {
            const res = await fetch(`pages/${name}.html`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.text();
        } catch (err) {
            console.warn(`Failed to load ${name}.html:`, err);
            return this.getFallback(name);
        }
    },

    getFallback(name) {
        const fallbacks = {
            home: `<section class="max-w-7xl mx-auto px-6 py-24 text-center"><h1 class="text-6xl md:text-8xl font-serif font-bold">Science Meets <span class="text-[#0251B0] italic">Deep</span> Care.</h1><button onclick="router.navigate('treatments')" class="mt-8 px-10 py-5 bg-[#0251B0] text-white rounded-full">Explore Treatments</button></section>`,
            login: `<div class="max-w-md mx-auto px-6 py-20"><div class="glass p-10 rounded-5xl"><h2 class="text-4xl font-serif font-bold text-center">Login</h2><form onsubmit="auth.login(event)" class="space-y-6"><input type="email" placeholder="Email" class="w-full px-6 py-4 rounded-2xl"><input type="password" placeholder="Password" class="w-full px-6 py-4 rounded-2xl"><button type="submit" class="w-full py-5 bg-[#0251B0] text-white rounded-full">Login</button></form></div></div>`,
            dashboard: `<div class="max-w-7xl mx-auto px-6 py-12"><h2 class="text-3xl font-serif font-bold text-center">Dashboard</h2></div>`,
            '404': `<section class="min-h-[70vh] flex items-center justify-center"><div class="text-center"><h1 class="text-8xl font-serif font-bold text-[#0251B0]">404</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-[#0251B0] text-white rounded-full">Return Home</button></div></section>`
        };
        return fallbacks[name] || `<p>Page not found: ${name}</p>`;
    },

    dashboardMain(user) {
        const u = user || { cycle: 'Not Started', progress: 0, specialist: 'To Be Assigned', nextAppt: 'Schedule consultation' };
        return `
            <div class="glass p-10 rounded-5xl border-2 border-[#0251B0]/10">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div><h3 class="text-2xl font-bold">Cycle Status: <span class="text-[#0251B0] italic">${u.cycle}</span></h3><p class="text-xs text-slate-500 font-medium mt-1">Lead Specialist: ${u.specialist}</p></div>
                    <div><span class="px-4 py-1.5 bg-blue-50 text-[#0251B0] rounded-full text-xs font-black uppercase tracking-widest">Day ${Math.round(u.progress / 7)} of 14</span></div>
                </div>
                <div class="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8 shadow-inner">
                    <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0251B0] to-violet-600 rounded-full transition-all duration-1000" style="width: ${u.progress}%"></div>
                </div>
                <div class="grid grid-cols-5 text-[10px] font-black uppercase tracking-widest text-center">
                    <div class="text-[#0251B0]">Suppression</div><div class="text-[#0251B0]">Stimulation</div>
                    <div class="text-slate-400">Retrieval</div><div class="text-slate-400">Fertilization</div><div class="text-slate-400">Transfer</div>
                </div>
            </div>
            <div class="glass p-6 rounded-4xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-4"><div class="w-12 h-12 rounded-2xl bg-[#0251B0] text-white flex items-center justify-center shrink-0"><i data-lucide="calendar" class="w-6 h-6"></i></div><div><h4 class="font-bold text-sm">Next Appointment</h4><p class="text-xs text-slate-500">${u.nextAppt} at FirstChild Main Clinic</p></div></div>
                <button onclick="app.toast('Appointment details sent to your email.')" class="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-full text-xs font-bold shrink-0">View Details</button>
            </div>
        `;
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
                            content.innerHTML = Views.dashboardMain(Store.state.user);
                        } else {
                            const tmpl = document.getElementById(`template-${view}`);
                            content.innerHTML = tmpl ? tmpl.innerHTML : `<div class="adaptive-card p-8 rounded-5xl"><p>Loading...</p></div>`;
                        }
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                        app.handleScroll();
                        setTimeout(updateDashboardWithUserData, 100);
                    } catch (err) {
                        console.error('Nav error:', err);
                        content.innerHTML = `<div class="adaptive-card p-8 rounded-5xl text-red-500">Error loading content.</div>`;
                    }
                });
            });
        } catch (err) {
            console.error('Bind nav error:', err);
        }
    }
};

// ============================================================
// 7. ROUTER
// ============================================================

const router = {
    routes: {
        home: Views.home,
        treatments: Views.treatments,
        doctors: Views.doctors,
        stories: Views.stories,
        login: Views.login,
        signup: Views.signup,
        dashboard: Views.dashboard,
        '404': Views.page404,
        'coming-soon': Views.comingSoon,
        maintenance: Views.maintenance
    },

    navigate(path) {
        window.location.hash = path;
    },

    updateActiveNav(route) {
        try {
            document.querySelectorAll('.nav-link, .mobile-nav-link, .footer-nav-link').forEach(link => {
                link.classList.toggle('active', link.dataset.route === route);
            });
        } catch (err) { /* silent */ }
    },

    async renderView(name) {
        const container = document.getElementById('app-view-container');
        if (!container) return;

        try {
            const pages = ['home', 'home-2', 'treatments', 'doctors', 'stories', 'login', 'signup', 'dashboard', 'privacy', 'terms', '404', 'coming-soon', 'maintenance'];

            if (pages.includes(name)) {
                if (name === 'dashboard') {
                    if (!auth.isAuthenticated()) {
                        app.toast('Please log in.', 'info');
                        this.navigate('login');
                        return;
                    }
                    const html = await Views.loadPage('dashboard');
                    container.innerHTML = html;
                    Views.bindDashboardNav();
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    app.handleScroll();
                    setTimeout(updateDashboardWithUserData, 200);
                    return;
                }

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

            const fn = this.routes[name] || this.routes['404'];
            container.innerHTML = typeof fn === 'function' ? fn() : await Views.loadPage(name) || '<p>Page not found</p>';
            if (typeof lucide !== 'undefined') lucide.createIcons();

        } catch (err) {
            console.error('Render error:', err);
            container.innerHTML = `<section class="min-h-[70vh] flex items-center justify-center"><div class="text-center"><h2 class="text-3xl font-bold text-red-500">Error</h2><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-[#0251B0] text-white rounded-full">Return Home</button></div></section>`;
        }
    },

   async handleRoute() {
        const container = document.getElementById('app-view-container');
        if (!container) return;

        let path = window.location.hash.slice(1) || 'home';
        const valid = ['home', 'home-2', 'treatments', 'doctors', 'stories', 'login', 'signup', 'dashboard', 'privacy', 'terms', '404', 'coming-soon', 'maintenance'];
        if (!valid.includes(path)) path = '404';

        if (path === 'dashboard' && !auth.isAuthenticated()) {
            app.toast('Please log in.', 'info');
            this.navigate('login');
            return;
        }

        if (auth.isAuthenticated() && ['login', 'signup'].includes(path)) {
            this.navigate('dashboard');
            return;
        }

        const hide = ['login', 'signup', '404', 'coming-soon', 'maintenance'];
        const header = document.getElementById('global-header');
        const footer = document.querySelector('footer');
        if (header) header.style.display = hide.includes(path) ? 'none' : 'block';
        if (footer) footer.style.display = hide.includes(path) ? 'none' : 'block';

        this.updateActiveNav(path);

        // --- HARDWARE-ACCELERATED FADE OUT ---
        if (typeof anime !== 'undefined') {
            try {
                container.style.willChange = 'opacity';
                await anime({
                    targets: container,
                    opacity: [1, 0],
                    duration: 150,
                    easing: 'linear'
                }).finished;
            } catch {
                container.style.opacity = '0';
                await new Promise(r => setTimeout(r, 150));
            }
        } else {
            container.style.opacity = '0';
            await new Promise(r => setTimeout(r, 150));
        }

        // Render new view content
        await this.renderView(path);

        // --- HARDWARE-ACCELERATED FADE IN ---
        if (typeof anime !== 'undefined') {
            try {
                anime({
                    targets: container,
                    opacity: [0, 1],
                    duration: 300,
                    easing: 'easeOutQuad',
                    complete: () => {
                        container.style.willChange = 'auto';
                    }
                });
            } catch {
                container.style.opacity = '1';
                container.style.willChange = 'auto';
            }
        } else {
            container.style.opacity = '1';
            container.style.willChange = 'auto';
        }

        window.scrollTo(0, 0);
        app.handleScroll();
    }
};

// ============================================================
// 8. FALLBACKS
// ============================================================

Views.page404 = () => `<section class="min-h-[70vh] flex items-center justify-center"><div class="text-center"><h1 class="text-8xl font-serif font-bold text-[#0251B0]">404</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-[#0251B0] text-white rounded-full">Return Home</button></div></section>`;
Views.comingSoon = () => `<section class="min-h-[70vh] flex items-center justify-center"><div class="text-center"><h1 class="text-6xl font-serif font-bold">Coming Soon</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-[#0251B0] text-white rounded-full">Return Home</button></div></section>`;
Views.maintenance = () => `<section class="min-h-[70vh] flex items-center justify-center"><div class="text-center"><h1 class="text-6xl font-serif font-bold">Under Maintenance</h1><button onclick="router.navigate('home')" class="mt-8 px-8 py-4 bg-[#0251B0] text-white rounded-full">Return Home</button></div></section>`;

// ============================================================
// 9. INIT
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
        console.log('✅ FirstChild app ready!');
    } catch (err) {
        console.error('Init failed:', err);
        const container = document.getElementById('app-view-container');
        if (container) {
            container.innerHTML = `<section class="min-h-[70vh] flex items-center justify-center"><div class="text-center"><h2 class="text-3xl font-bold text-red-500">Failed to Load</h2><button onclick="location.reload()" class="mt-8 px-8 py-4 bg-[#0251B0] text-white rounded-full">Refresh</button></div></section>`;
        }
    }
});

window.addEventListener('error', (e) => {
    console.error('Error:', e.message);
    if (app?.toast) app.toast('Something went wrong. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Rejection:', e.reason);
    if (app?.toast) app.toast('An unexpected error occurred.', 'error');
});

window.app = app;
window.auth = auth;
window.router = router;
window.Store = Store;
window.Views = Views;
window.updateDashboardWithUserData = updateDashboardWithUserData;
window.UserDatabase = UserDatabase;