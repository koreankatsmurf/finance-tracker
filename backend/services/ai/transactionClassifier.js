const { OpenAI } = require('openai');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class TransactionClassifier {
  constructor() {
    this.categories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
      'Salary', 'Freelance', 'Investments', 'Other'
    ];
  }

  async categorizeTransaction({ description, amount, merchant }) {
    try {
      const prompt = this.buildCategorizationPrompt(description, amount, merchant);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.3
      });

      const suggestedCategory = response.choices[0].message.content.trim();
      
      // Validate the category
      return this.validateCategory(suggestedCategory);
    } catch (error) {
      console.error('Categorization error:', error);
      return 'Other'; // Fallback category
    }
  }

  buildCategorizationPrompt(description, amount, merchant) {
    return `Categorize this transaction into one of these categories: ${this.categories.join(', ')}.

Transaction details:
- Description: ${description || 'N/A'}
- Merchant: ${merchant || 'N/A'}
- Amount: $${amount || 'N/A'}

Rules:
- Food purchases, restaurants, groceries → Food & Dining
- Gas, public transport, rideshare, parking → Transportation
- Retail stores, online shopping, clothing → Shopping
- Movies, games, subscriptions, events → Entertainment
- Rent, utilities, phone, internet → Bills & Utilities
- Doctor, pharmacy, insurance → Healthcare
- School, courses, books → Education
- Hotels, flights, vacation → Travel
- Salary, wages → Salary
- Contract work, consulting → Freelance
- Stocks, bonds, crypto → Investments
- Everything else → Other

Return only the category name, nothing else.`;
  }

  validateCategory(category) {
    // Find exact match first
    if (this.categories.includes(category)) {
      return category;
    }

    // Try partial matching
    const lowerCategory = category.toLowerCase();
    for (const validCategory of this.categories) {
      if (validCategory.toLowerCase().includes(lowerCategory) || 
          lowerCategory.includes(validCategory.toLowerCase())) {
        return validCategory;
      }
    }

    return 'Other'; // Fallback
  }

  async predictBudget(transactions, category) {
    try {
      // Prepare spending data
      const monthlySpending = this.aggregateMonthlySpending(transactions);
      const spendingData = Object.entries(monthlySpending)
        .map(([month, amount]) => `${month}: $${amount.toFixed(2)}`)
        .join('\n');

      const prompt = `Based on this spending data for ${category || 'all categories'}, predict next month's spending and provide budgeting advice:

${spendingData}

Analyze the trend and provide a JSON response with:
{
  "predictedAmount": 0.00,
  "confidence": "high/medium/low",
  "trend": "increasing/decreasing/stable",
  "advice": "2-3 sentences of budgeting advice",
  "recommendedBudget": 0.00,
  "seasonalFactors": "any seasonal considerations"
}

Consider:
- Historical average
- Recent trends (last 3 months vs earlier)
- Seasonal patterns
- Spending volatility`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.5
      });

      let prediction;
      try {
        prediction = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        // Fallback prediction
        const avgSpending = Object.values(monthlySpending).reduce((a, b) => a + b, 0) / Object.keys(monthlySpending).length;
        prediction = {
          predictedAmount: Math.round(avgSpending),
          confidence: 'medium',
          trend: 'stable',
          advice: 'Based on your historical data, consider maintaining your current spending pattern while looking for optimization opportunities.',
          recommendedBudget: Math.round(avgSpending * 1.1),
          seasonalFactors: 'No specific seasonal patterns detected.'
        };
      }

      return this.validatePrediction(prediction);
    } catch (error) {
      console.error('Budget prediction error:', error);
      throw new Error('Failed to generate budget prediction');
    }
  }

  aggregateMonthlySpending(transactions) {
    const monthlySpending = {};
    
    transactions.forEach(transaction => {
      const monthKey = transaction.date.substring(0, 7); // YYYY-MM
      if (!monthlySpending[monthKey]) {
        monthlySpending[monthKey] = 0;
      }
      monthlySpending[monthKey] += parseFloat(transaction.amount);
    });

    return monthlySpending;
  }

  validatePrediction(prediction) {
    return {
      predictedAmount: Math.max(0, parseFloat(prediction.predictedAmount) || 0),
      confidence: ['high', 'medium', 'low'].includes(prediction.confidence) ? prediction.confidence : 'medium',
      trend: ['increasing', 'decreasing', 'stable'].includes(prediction.trend) ? prediction.trend : 'stable',
      advice: prediction.advice || 'Continue monitoring your spending patterns.',
      recommendedBudget: Math.max(0, parseFloat(prediction.recommendedBudget) || 0),
      seasonalFactors: prediction.seasonalFactors || 'No seasonal factors identified.'
    };
  }

  // Batch categorization for multiple transactions
  async batchCategorize(transactions) {
    const results = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const batchPromises = batch.map(transaction => 
        this.categorizeTransaction({
          description: transaction.description,
          amount: transaction.amount,
          merchant: transaction.merchant || transaction.category
        }).catch(error => {
          console.error(`Failed to categorize transaction ${transaction.id}:`, error);
          return 'Other';
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // Smart category suggestions based on merchant patterns
  async suggestCategoryFromMerchant(merchant) {
    const merchantPatterns = {
      'Food & Dining': ['restaurant', 'cafe', 'pizza', 'burger', 'starbucks', 'mcdonalds', 'subway', 'grocery', 'market'],
      'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'metro', 'parking', 'shell', 'exxon'],
      'Shopping': ['amazon', 'walmart', 'target', 'mall', 'store', 'shop', 'retail'],
      'Entertainment': ['netflix', 'spotify', 'cinema', 'theater', 'game', 'steam'],
      'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'verizon', 'att', 'comcast'],
      'Healthcare': ['pharmacy', 'hospital', 'doctor', 'medical', 'cvs', 'walgreens']
    };

    const lowerMerchant = merchant.toLowerCase();
    
    for (const [category, patterns] of Object.entries(merchantPatterns)) {
      if (patterns.some(pattern => lowerMerchant.includes(pattern))) {
        return category;
      }
    }

    return 'Other';
  }
}

module.exports = {
  transactionClassifier: new TransactionClassifier()
};