/**
 * Paper Insight - Main Application
 * Initializes and controls the application
 */

const App = {
    // User preferences stored in localStorage
    bookmarks: new Set(),
    likes: new Set(),

    /**
     * Initialize the application
     */
    async init() {
        // Load user preferences
        this.loadPreferences();

        // Initialize theme
        this.initTheme();

        // Load data
        await DataManager.init();

        // Initialize filters
        Filters.init();

        // Render initial UI
        this.renderCategoryTabs();
        this.renderMoodFilters();
        this.renderArticles();

        // Setup event listeners
        this.setupEventListeners();
    },

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        try {
            const bookmarks = localStorage.getItem('paperinsight_bookmarks');
            const likes = localStorage.getItem('paperinsight_likes');

            if (bookmarks) {
                this.bookmarks = new Set(JSON.parse(bookmarks));
            }
            if (likes) {
                this.likes = new Set(JSON.parse(likes));
            }
        } catch (e) {
            console.warn('Failed to load preferences:', e);
        }
    },

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('paperinsight_bookmarks', JSON.stringify([...this.bookmarks]));
            localStorage.setItem('paperinsight_likes', JSON.stringify([...this.likes]));
        } catch (e) {
            console.warn('Failed to save preferences:', e);
        }
    },

    /**
     * Initialize theme based on user preference
     */
    initTheme() {
        const savedTheme = localStorage.getItem('paperinsight_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        this.updateThemeIcon();
    },

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('paperinsight_theme', newTheme);

        this.updateThemeIcon();
    },

    /**
     * Update theme toggle icon
     */
    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('.theme-toggle__icon');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        icon.textContent = isDark ? '☀️' : '🌙';
    },

    /**
     * Render category tabs
     */
    renderCategoryTabs() {
        const container = document.getElementById('categoryTabs');
        if (!container) return;

        container.innerHTML = '';

        const categories = DataManager.getAllCategories();
        categories.forEach((category, index) => {
            const tab = Components.createCategoryTab(category, index === 0);
            container.appendChild(tab);
        });
    },

    /**
     * Render mood filter pills
     */
    renderMoodFilters() {
        const container = document.getElementById('moodFilters');
        if (!container) return;

        container.innerHTML = '';

        const moods = DataManager.getAllMoods();
        moods.forEach((mood, index) => {
            const pill = Components.createMoodPill(mood, index === 0);
            container.appendChild(pill);
        });
    },

    /**
     * Render articles grid
     */
    renderArticles() {
        const grid = document.getElementById('articlesGrid');
        const emptyState = document.getElementById('emptyState');
        const countEl = document.getElementById('articleCount');
        const titleEl = document.getElementById('sectionTitle');

        if (!grid) return;

        // Get filtered articles
        const allArticles = DataManager.getAllArticles();
        const filteredArticles = Filters.filterArticles(allArticles);

        // Update section title and count
        if (titleEl) {
            titleEl.textContent = Filters.getSectionTitle();
        }
        if (countEl) {
            countEl.textContent = `${filteredArticles.length}件`;
        }

        // Clear and render
        grid.innerHTML = '';

        if (filteredArticles.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        filteredArticles.forEach(article => {
            const card = Components.createArticleCard(article);

            // Update button states
            this.updateCardButtonStates(card, article.id);

            grid.appendChild(card);
        });
    },

    /**
     * Update bookmark and like button states on a card
     */
    updateCardButtonStates(card, articleId) {
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        const likeBtn = card.querySelector('.like-btn');

        if (bookmarkBtn && this.bookmarks.has(articleId)) {
            bookmarkBtn.classList.add('active');
            bookmarkBtn.textContent = '📑';
        }

        if (likeBtn && this.likes.has(articleId)) {
            likeBtn.classList.add('active');
            likeBtn.textContent = '❤️';
        }
    },

    /**
     * Handle bookmark toggle
     */
    toggleBookmark(articleId) {
        if (this.bookmarks.has(articleId)) {
            this.bookmarks.delete(articleId);
            Components.showToast('保存済みから削除しました');
        } else {
            this.bookmarks.add(articleId);
            Components.showToast('あとで読むに保存しました');
        }

        this.savePreferences();
        this.renderArticles();
    },

    /**
     * Handle like toggle
     */
    toggleLike(articleId, button) {
        if (this.likes.has(articleId)) {
            this.likes.delete(articleId);
            button.classList.remove('active', 'liked');
            button.textContent = '🤍';
        } else {
            this.likes.add(articleId);
            button.classList.add('active', 'liked');
            button.textContent = '❤️';
            Components.showToast('いいねしました！');
        }

        this.savePreferences();
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Category tabs
        const categoryTabs = document.getElementById('categoryTabs');
        if (categoryTabs) {
            categoryTabs.addEventListener('click', (e) => {
                const tab = e.target.closest('.category-tabs__item');
                if (!tab) return;

                // Update active state
                categoryTabs.querySelectorAll('.category-tabs__item').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                // Update filter and re-render
                Filters.setCategory(tab.dataset.categoryId);
                this.renderArticles();
            });
        }

        // Mood filters
        const moodFilters = document.getElementById('moodFilters');
        if (moodFilters) {
            moodFilters.addEventListener('click', (e) => {
                const pill = e.target.closest('.mood-pill');
                if (!pill) return;

                // Update active state
                moodFilters.querySelectorAll('.mood-pill').forEach(p => {
                    p.classList.remove('active');
                });
                pill.classList.add('active');

                // Update filter and re-render
                Filters.setMood(pill.dataset.moodId);
                this.renderArticles();
            });
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = Filters.debounce(() => {
                Filters.setSearchQuery(searchInput.value);
                this.renderArticles();
            }, 300);

            searchInput.addEventListener('input', debouncedSearch);
        }

        // Article action buttons (event delegation)
        const articlesGrid = document.getElementById('articlesGrid');
        if (articlesGrid) {
            articlesGrid.addEventListener('click', (e) => {
                const bookmarkBtn = e.target.closest('.bookmark-btn');
                const likeBtn = e.target.closest('.like-btn');

                if (bookmarkBtn) {
                    e.stopPropagation();
                    this.toggleBookmark(bookmarkBtn.dataset.id);
                }

                if (likeBtn) {
                    e.stopPropagation();
                    this.toggleLike(likeBtn.dataset.id, likeBtn);
                }
            });
        }

        // Bottom nav - Search focus
        const navSearch = document.getElementById('navSearch');
        if (navSearch && searchInput) {
            navSearch.addEventListener('click', (e) => {
                e.preventDefault();
                searchInput.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Bottom nav - Bookmarks (Library)
        const navBookmark = document.getElementById('navBookmark');
        if (navBookmark) {
            navBookmark.addEventListener('click', (e) => {
                // If we are already on the library page, do nothing or maybe switch tab?
                // For now, let standard navigation happen if it's an anchor tag
                // But since we are using event prevention in the original code, we should change it.
                // Actually, the HTML in index.html is likely <a href="#" id="navBookmark">
                // implementation_plan says we should link to library.html

                // If it's an anchor with href="library.html", we don't need JS redirect unless we want SPA feel
                // But the original code had e.preventDefault().
                // Let's remove the preventDefault and let the anchor tag work, 
                // OR implementation it as a location change.

                // Let's assume we update the HTML to href="library.html" in the next step.
                // So we can just remove this event listener or strictly use it for tracking.

                // However, the current task is to modify the existing `app.js`.
                // Let's make it redirect.
                e.preventDefault();
                window.location.href = 'library.html';
            });
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for debugging
window.App = App;
