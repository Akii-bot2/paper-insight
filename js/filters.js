/**
 * Paper Insight - Filters Module
 * Handles search and filtering functionality
 */

const Filters = {
    currentCategory: 'all',
    currentMood: 'all',
    searchQuery: '',

    /**
     * Initialize filter state
     */
    init() {
        this.currentCategory = 'all';
        this.currentMood = 'all';
        this.searchQuery = '';
    },

    /**
     * Set current category filter
     */
    setCategory(categoryId) {
        this.currentCategory = categoryId;
    },

    /**
     * Set current mood filter
     */
    setMood(moodId) {
        this.currentMood = moodId;
    },

    /**
     * Set search query
     */
    setSearchQuery(query) {
        this.searchQuery = query.toLowerCase().trim();
    },

    /**
     * Filter articles based on current filters
     */
    filterArticles(articles) {
        return articles.filter(article => {
            // Category filter
            if (this.currentCategory !== 'all') {
                const inStandard = article.categories.standard.includes(this.currentCategory);
                const inThematic = article.categories.thematic.includes(this.currentCategory);
                if (!inStandard && !inThematic) {
                    return false;
                }
            }

            // Mood filter
            if (this.currentMood !== 'all') {
                if (!article.mood.includes(this.currentMood)) {
                    return false;
                }
            }

            // Search query filter
            if (this.searchQuery) {
                const searchFields = [
                    article.catchyTitle,
                    article.originalTitle,
                    article.summary.oneLine,
                    article.summary.fullSummary,
                    ...article.tags
                ].join(' ').toLowerCase();

                if (!searchFields.includes(this.searchQuery)) {
                    return false;
                }
            }

            return true;
        });
    },

    /**
     * Get section title based on current filters
     */
    getSectionTitle() {
        if (this.searchQuery) {
            return `「${this.searchQuery}」の検索結果`;
        }

        if (this.currentCategory !== 'all') {
            const category = DataManager.getCategoryById(this.currentCategory);
            if (category) {
                return category.name;
            }
        }

        if (this.currentMood !== 'all') {
            const moods = DataManager.getAllMoods();
            const mood = moods.find(m => m.id === this.currentMood);
            if (mood) {
                return `${mood.icon} ${mood.name}`;
            }
        }

        return 'すべての記事';
    },

    /**
     * Debounce function for search input
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export for use in other modules
window.Filters = Filters;
