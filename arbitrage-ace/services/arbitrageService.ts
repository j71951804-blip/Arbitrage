// services/arbitrageService.ts
import { EbayService, EbayItem } from './ebayService';
import { AmazonService, AmazonItem } from './amazonService';
import { Opportunity, IOpportunity } from '../models/Opportunity';
import { IUser } from '../models/User';

interface ArbitrageMatch {
  ebayItem: EbayItem;
  amazonItem: AmazonItem;
  similarity: number;
  potentialProfit: number;
  roi: number;
}

class ArbitrageDetectionService {
  private ebayService: EbayService;
  private amazonService: AmazonService;

  constructor(user: IUser) {
    this.ebayService = new EbayService(user.apiKeys.ebay.appId);
    this.amazonService = new AmazonService(
      user.apiKeys.amazon.accessKey,
      user.apiKeys.amazon.secretKey,
      user.apiKeys.amazon.associateTag
    );
  }

  async findOpportunities(keywords: string[], userId: string, settings: any): Promise<IOpportunity[]> {
    const opportunities: IOpportunity[] = [];

    for (const keyword of keywords) {
      try {
        console.log(`Searching for opportunities with keyword: ${keyword}`);
        
        // Search both platforms simultaneously
        const [ebayItems, amazonItems] = await Promise.all([
          this.ebayService.searchItems(keyword, 50),
          this.amazonService.searchItems(keyword)
        ]);

        // Find potential matches
        const matches = this.findMatches(ebayItems, amazonItems);
        
        // Calculate profitability and filter
        for (const match of matches) {
          const opportunity = this.calculateOpportunity(match, userId, settings);
          
          if (opportunity && this.meetsThresholds(opportunity, settings)) {
            // Check if opportunity already exists
            const existing = await Opportunity.findOne({
              ebayItemId: opportunity.ebayItemId,
              amazonAsin: opportunity.amazonAsin,
              userId: userId
            });

            if (!existing) {
              opportunities.push(opportunity);
            }
          }
        }
      } catch (error) {
        console.error(`Error searching for keyword ${keyword}:`, error);
      }
    }

    // Save opportunities to database
    if (opportunities.length > 0) {
      try {
        await Opportunity.insertMany(opportunities);
        console.log(`Saved ${opportunities.length} new opportunities`);
      } catch (error) {
        console.error('Error saving opportunities:', error);
      }
    }

    return opportunities;
  }

  private findMatches(ebayItems: EbayItem[], amazonItems: AmazonItem[]): ArbitrageMatch[] {
    const matches: ArbitrageMatch[] = [];

    for (const ebayItem of ebayItems) {
      for (const amazonItem of amazonItems) {
        const similarity = this.calculateSimilarity(ebayItem.title, amazonItem.title);
        
        if (similarity > 0.7) { // 70% similarity threshold
          const totalCost = ebayItem.price + ebayItem.shippingCost + this.calculateEbayFees(ebayItem.price);
          const potentialProfit = amazonItem.price - totalCost - this.calculateAmazonFees(amazonItem.price);
          const roi = (potentialProfit / totalCost) * 100;

          if (potentialProfit > 0) {
            matches.push({
              ebayItem,
              amazonItem,
              similarity,
              potentialProfit,
              roi
            });
          }
        }
      }
    }

    // Sort by ROI descending
    return matches.sort((a, b) => b.roi - a.roi);
  }

  private calculateSimilarity(title1: string, title2: string): number {
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    const words1 = normalize(title1);
    const words2 = normalize(title2);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  private calculateEbayFees(price: number): number {
    // eBay final value fee (approximate)
    return price * 0.1; // 10% fee
  }

  private calculateAmazonFees(price: number): number {
    // Amazon referral fee + FBA fees (approximate)
    const referralFee = price * 0.15; // 15% referral fee
    const fbaFee = 3.50; // Approximate FBA fee
    return referralFee + fbaFee;
  }

  private calculateShippingCosts(ebayItem: EbayItem): number {
    // Estimate shipping costs to Amazon warehouse
    return 5.00; // Flat rate estimate
  }

  private calculateOpportunity(match: ArbitrageMatch, userId: string, settings: any): IOpportunity | null {
    const ebayFees = this.calculateEbayFees(match.ebayItem.price);
    const amazonFees = this.calculateAmazonFees(match.amazonItem.price);
    const shippingCosts = this.calculateShippingCosts(match.ebayItem);

    const totalCost = match.ebayItem.price + match.ebayItem.shippingCost;
    const potentialProfit = match.amazonItem.price - totalCost - ebayFees - amazonFees - shippingCosts;
    const roi = (potentialProfit / totalCost) * 100;

    if (potentialProfit <= 0) return null;

    return new Opportunity({
      productName: match.ebayItem.title,
      ebayPrice: match.ebayItem.price,
      amazonPrice: match.amazonItem.price,
      ebayUrl: match.ebayItem.url,
      amazonUrl: match.amazonItem.url,
      imageUrl: match.ebayItem.imageUrl || match.amazonItem.imageUrl,
      ebaySeller: match.ebayItem.seller,
      amazonSeller: match.amazonItem.seller,
      fees: {
        ebay: ebayFees,
        amazon: amazonFees,
        shipping: shippingCosts
      },
      potentialProfit,
      roi,
      userId,
      status: 'active',
      ebayItemId: match.ebayItem.itemId,
      amazonAsin: match.amazonItem.asin
    });
  }

  private meetsThresholds(opportunity: IOpportunity, settings: any): boolean {
    return opportunity.potentialProfit >= settings.minProfit && 
           opportunity.roi >= settings.minRoi;
  }
}

// routes/opportunities.ts
import express from 'express';
import { ArbitrageDetectionService } from '../services/arbitrageService';
import { Opportunity } from '../models/Opportunity';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    const opportunities = await Opportunity.find({ 
      userId: user._id,
      status: 'active'
    }).sort({ roi: -1 });
    
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

router.post('/scan', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user.apiKeys?.ebay?.appId || !user.apiKeys?.amazon?.accessKey) {
      return res.status(400).json({ error: 'API credentials not configured' });
    }

    const arbitrageService = new ArbitrageDetectionService(user);
    const keywords = user.settings.keywords || ['electronics', 'books', 'toys'];
    
    const opportunities = await arbitrageService.findOpportunities(
      keywords, 
      user._id.toString(), 
      user.settings
    );
    
    res.json({ 
      message: `Found ${opportunities.length} new opportunities`,
      opportunities 
    });
  } catch (error) {
    console.error('Error scanning for opportunities:', error);
    res.status(500).json({ error: 'Failed to scan for opportunities' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;
    
    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: id, userId: user._id },
      { status },
      { new: true }
    );
    
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    res.json(opportunity);
