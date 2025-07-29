const { OpenAI } = require('openai');
const { v2: cloudinary } = require('cloudinary');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class ReceiptScanner {
  async processReceipt(imageBuffer) {
    try {
      // Upload image to Cloudinary
      const uploadResult = await this.uploadImage(imageBuffer);
      
      // Process with OpenAI Vision
      const receiptData = await this.extractReceiptData(uploadResult.secure_url);
      
      return {
        ...receiptData,
        imageUrl: uploadResult.secure_url
      };
    } catch (error) {
      console.error('Receipt processing error:', error);
      throw new Error('Failed to process receipt');
    }
  }

  async uploadImage(imageBuffer) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: 'image', 
          folder: 'receipts',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(imageBuffer);
    });
  }

  async extractReceiptData(imageUrl) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this receipt and extract the following information in JSON format:
                {
                  "merchant": "store name",
                  "total": 0.00,
                  "date": "YYYY-MM-DD",
                  "currency": "USD",
                  "items": [
                    {
                      "name": "item name",
                      "price": 0.00,
                      "quantity": 1
                    }
                  ],
                  "category": "suggested category",
                  "paymentMethod": "cash/card/etc",
                  "taxAmount": 0.00,
                  "confidence": 0.95
                }
                
                If you can't find certain information, use null. For category, suggest one of: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Other.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });

      let receiptData;
      try {
        receiptData = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback response
        receiptData = {
          merchant: "Unknown Merchant",
          total: null,
          date: new Date().toISOString().split('T')[0],
          currency: "USD",
          items: [],
          category: "Other",
          paymentMethod: null,
          taxAmount: null,
          confidence: 0.5
        };
      }

      // Validate and clean data
      return this.validateReceiptData(receiptData);
    } catch (error) {
      console.error('OpenAI Vision error:', error);
      throw new Error('Failed to extract receipt data');
    }
  }

  validateReceiptData(data) {
    return {
      merchant: data.merchant || "Unknown Merchant",
      total: this.parseAmount(data.total),
      date: this.parseDate(data.date),
      currency: data.currency || "USD",
      items: Array.isArray(data.items) ? data.items.map(item => ({
        name: item.name || "Unknown Item",
        price: this.parseAmount(item.price),
        quantity: parseInt(item.quantity) || 1
      })) : [],
      category: this.validateCategory(data.category),
      paymentMethod: data.paymentMethod || null,
      taxAmount: this.parseAmount(data.taxAmount),
      confidence: Math.min(Math.max(parseFloat(data.confidence) || 0.5, 0), 1)
    };
  }

  parseAmount(amount) {
    if (amount === null || amount === undefined) return null;
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? null : Math.round(parsed * 100) / 100;
  }

  parseDate(dateString) {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  }

  validateCategory(category) {
    const validCategories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
    ];
    
    return validCategories.includes(category) ? category : 'Other';
  }

  // Alternative method using Google Cloud Vision (if you want to add it later)
  async processWithGoogleVision(imageBuffer) {
    // This would require Google Cloud Vision API setup
    // Implementation would go here if needed
    throw new Error('Google Cloud Vision not implemented yet');
  }
}

module.exports = {
  receiptScanner: new ReceiptScanner()
};