/**
 * Paper Insight - Data Management Module
 * Handles loading and managing article data
 */

const DataManager = {
  articles: [],
  categories: { standard: [], thematic: [] },
  moods: [],
  
  /**
   * Initialize data by loading from JSON file
   */
  async init() {
    try {
      const response = await fetch('data/articles.json');
      if (!response.ok) throw new Error('Failed to load data');
      
      const data = await response.json();
      this.articles = data.articles || [];
      this.categories = data.categories || { standard: [], thematic: [] };
      this.moods = data.moods || [];
      
      return true;
    } catch (error) {
      console.error('Data loading error:', error);
      // Use sample data as fallback
      this.loadFallbackData();
      return false;
    }
  },
  
  /**
   * Load fallback sample data if fetch fails
   */
  loadFallbackData() {
    this.categories = {
      standard: [
        { id: 'all', name: 'すべて', nameEn: 'All', icon: '📚' },
        { id: 'nature-science', name: '自然科学', nameEn: 'Nature & Universe', icon: '🌌' },
        { id: 'ai-technology', name: 'AI・テクノロジー', nameEn: 'AI & Technology', icon: '🤖' },
        { id: 'human-mind', name: '人間科学・心理', nameEn: 'Human & Mind', icon: '🧠' },
        { id: 'society-business', name: '社会科学・ビジネス', nameEn: 'Society & Business', icon: '📊' },
        { id: 'health-medical', name: '医歯薬学・ヘルスケア', nameEn: 'Health & Medical', icon: '🏥' }
      ],
      thematic: [
        { id: 'life-hacks', name: 'ライフハック', nameEn: 'Life Hacks', icon: '✨' },
        { id: 'applied-ai', name: 'AI × 〇〇', nameEn: 'Applied AI', icon: '🔮' },
        { id: 'future-trends', name: '未来予測', nameEn: 'Future Trends', icon: '🚀' },
        { id: 'thinking-models', name: '思考法', nameEn: 'Thinking Models', icon: '💡' },
        { id: 'sustainability', name: 'サステナビリティ', nameEn: 'Sustainability', icon: '🌱' }
      ]
    };
    
    this.moods = [
      { id: 'all', name: 'すべて', icon: '🌟' },
      { id: 'motivating', name: '元気が欲しい', icon: '💪' },
      { id: 'practical', name: 'すぐ使える知識', icon: '🛠️' },
      { id: 'thought-provoking', name: 'じっくり考えたい', icon: '🤔' },
      { id: 'inspiring', name: 'ワクワクしたい', icon: '✨' }
    ];
    
    this.articles = [];
  },
  
  /**
   * Get all articles
   */
  getAllArticles() {
    return this.articles;
  },
  
  /**
   * Get article by ID
   */
  getArticleById(id) {
    return this.articles.find(article => article.id === id);
  },
  
  /**
   * Get all categories (standard + thematic)
   */
  getAllCategories() {
    const allCategory = { id: 'all', name: 'すべて', nameEn: 'All', icon: '📚' };
    return [allCategory, ...this.categories.standard, ...this.categories.thematic];
  },
  
  /**
   * Get standard categories only
   */
  getStandardCategories() {
    return this.categories.standard;
  },
  
  /**
   * Get thematic categories only
   */
  getThematicCategories() {
    return this.categories.thematic;
  },
  
  /**
   * Get all moods
   */
  getAllMoods() {
    const allMood = { id: 'all', name: 'すべて', icon: '🌟' };
    return [allMood, ...this.moods];
  },
  
  /**
   * Get category by ID
   */
  getCategoryById(id) {
    const allCategories = [...this.categories.standard, ...this.categories.thematic];
    return allCategories.find(cat => cat.id === id);
  },
  
  /**
   * Get related articles for a given article
   */
  getRelatedArticles(articleId, limit = 3) {
    const article = this.getArticleById(articleId);
    if (!article || !article.relatedArticles) return [];
    
    return article.relatedArticles
      .slice(0, limit)
      .map(id => this.getArticleById(id))
      .filter(Boolean);
  },
  
  /**
   * Check if an article has AI-related content
   */
  isAIRelated(article) {
    const aiCategories = ['ai-technology', 'applied-ai'];
    const hasAICategory = 
      article.categories.standard.some(c => aiCategories.includes(c)) ||
      article.categories.thematic.some(c => aiCategories.includes(c));
    const hasAITag = article.tags.some(tag => 
      tag.toLowerCase().includes('ai') || 
      tag.toLowerCase().includes('chatgpt') ||
      tag.toLowerCase().includes('llm')
    );
    
    return hasAICategory || hasAITag;
  }
};

// Export for use in other modules
window.DataManager = DataManager;
