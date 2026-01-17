/**
 * Paper Insight - UI Components Module
 * Handles creation of UI elements
 */

const Components = {
  /**
   * Create an article card element
   */
  createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.dataset.articleId = article.id;

    // Determine thumbnail style based on type (image or gradient)
    const thumbnailStyle = this.getThumbnailStyle(article.thumbnail);
    const gradientClass = this.getGradientClass(article.thumbnail);

    // Check if AI related for special styling
    const isAI = DataManager.isAIRelated(article);

    // Format reading time
    const readingTimeText = this.formatReadingTime(article.readingTime);

    card.innerHTML = `
      <div class="article-card__thumbnail ${gradientClass}" style="${thumbnailStyle}">
      </div>
      <div class="article-card__body">
        <div class="article-card__meta">
          <span class="badge badge--time">${readingTimeText}</span>
          ${this.createTagsHTML(article.tags.slice(0, 3), isAI)}
        </div>
        <h3 class="article-card__title">${this.escapeHTML(article.catchyTitle)}</h3>
        <p class="article-card__summary">${this.escapeHTML(article.summary.oneLine)}</p>
        <div class="article-card__footer">
          <span class="article-card__source">${this.escapeHTML(article.metadata.source)}</span>
          <div class="article-card__actions">
            <button class="action-btn bookmark-btn" data-id="${article.id}" aria-label="あとで読む">
              🔖
            </button>
            <button class="action-btn like-btn" data-id="${article.id}" aria-label="いいね">
              🤍
            </button>
          </div>
        </div>
      </div>
    `;

    // Add click handler for navigation
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.action-btn')) {
        window.location.href = `article.html?id=${article.id}`;
      }
    });

    return card;
  },

  /**
   * Get thumbnail style based on thumbnail data
   */
  getThumbnailStyle(thumbnail) {
    if (!thumbnail) return '';

    if (thumbnail.type === 'image' && thumbnail.url) {
      return `background-image: url('${thumbnail.url}'); background-size: cover; background-position: center;`;
    }
    return '';
  },

  /**
   * Get gradient class based on thumbnail colors
   */
  getGradientClass(thumbnail) {
    if (!thumbnail || !thumbnail.colors) {
      return 'gradient-teal-cyan';
    }

    const colorMap = {
      '#667eea': 'gradient-purple-blue',
      '#0D9488': 'gradient-teal-cyan',
      '#F59E0B': 'gradient-orange-pink',
      '#3B82F6': 'gradient-blue-indigo',
      '#10B981': 'gradient-green-teal',
      '#8B5CF6': 'gradient-purple-blue',
      '#22C55E': 'gradient-green-teal',
      '#EF4444': 'gradient-rose-purple'
    };

    return colorMap[thumbnail.colors[0]] || 'gradient-teal-cyan';
  },

  /**
   * Get appropriate icon for article based on categories
   */
  getCategoryIcon(article) {
    const categoryIcons = {
      'nature-science': '🌌',
      'ai-technology': '🤖',
      'human-mind': '🧠',
      'society-business': '📊',
      'health-medical': '🏥'
    };

    const primaryCategory = article.categories.standard[0];
    return categoryIcons[primaryCategory] || '📄';
  },

  /**
   * Format reading time for display
   */
  formatReadingTime(seconds) {
    if (seconds < 60) {
      return `${seconds}秒で読める`;
    }
    const minutes = Math.round(seconds / 60);
    return `${minutes}分で読める`;
  },

  /**
   * Create HTML for tags
   */
  createTagsHTML(tags, highlightAI = false) {
    return tags.map(tag => {
      const isAITag = tag.toLowerCase().includes('ai') ||
        tag.toLowerCase().includes('chatgpt') ||
        tag.toLowerCase().includes('llm');
      const tagClass = (highlightAI && isAITag) ? 'tag tag--ai' : 'tag';
      return `<span class="${tagClass}">${this.escapeHTML(tag)}</span>`;
    }).join('');
  },

  /**
   * Create category tab element
   */
  createCategoryTab(category, isActive = false) {
    const tab = document.createElement('button');
    tab.className = `category-tabs__item${isActive ? ' active' : ''}`;

    // Add special class for AI category
    if (category.id === 'ai-technology' || category.id === 'applied-ai') {
      tab.classList.add('category-tabs__item--ai');
    }

    tab.dataset.categoryId = category.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', isActive);
    tab.textContent = `${category.icon} ${category.name}`;

    return tab;
  },

  /**
   * Create mood filter pill element
   */
  createMoodPill(mood, isActive = false) {
    const pill = document.createElement('button');
    pill.className = `mood-pill${isActive ? ' active' : ''}`;
    pill.dataset.moodId = mood.id;
    pill.innerHTML = `<span>${mood.icon}</span> ${mood.name}`;

    return pill;
  },

  /**
   * Create loading skeleton cards
   */
  createSkeletonCard() {
    const skeleton = document.createElement('div');
    skeleton.className = 'article-card';
    skeleton.innerHTML = `
      <div class="article-card__thumbnail skeleton" style="height: 140px;"></div>
      <div class="article-card__body">
        <div class="article-card__meta">
          <span class="skeleton" style="width: 80px; height: 24px;"></span>
          <span class="skeleton" style="width: 50px; height: 24px;"></span>
        </div>
        <div class="skeleton" style="width: 100%; height: 24px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="width: 80%; height: 20px; margin-bottom: 12px;"></div>
        <div class="skeleton" style="width: 100%; height: 40px;"></div>
      </div>
    `;
    return skeleton;
  },

  /**
   * Show toast notification
   */
  showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// Export for use in other modules
window.Components = Components;
