// services/ebayService.ts
import axios from 'axios';

export interface EbayItem {
  itemId: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  seller: string;
  url: string;
  condition: string;
  shippingCost: number;
}

class EbayService {
  private appId: string;
  private baseUrl = 'https://api.ebay.com';

  constructor(appId: string) {
    this.appId = appId;
  }

  async searchItems(keywords: string, limit: number = 50): Promise<EbayItem[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/buy/browse/v1/item_summary/search`, {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB' // UK marketplace
        },
        params: {
          q: keywords,
          limit: limit,
          filter: 'buyingOptions:{FIXED_PRICE}',
          sort: 'price'
        }
      });

      return response.data.itemSummaries?.map((item: any) => ({
        itemId: item.itemId,
        title: item.title,
        price: parseFloat(item.price.value),
        currency: item.price.currency,
        imageUrl: item.image?.imageUrl || '',
        seller: item.seller?.username || 'Unknown',
        url: item.itemWebUrl,
        condition: item.condition || 'Unknown',
        shippingCost: item.shippingOptions?.[0]?.shippingCost?.value || 0
      })) || [];
    } catch (error) {
      console.error('eBay search error:', error);
      throw new Error('Failed to search eBay items');
    }
  }

  async getItemDetails(itemId: string): Promise<EbayItem | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/buy/browse/v1/item/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB'
        }
      });

      const item = response.data;
      return {
        itemId: item.itemId,
        title: item.title,
        price: parseFloat(item.price.value),
        currency: item.price.currency,
        imageUrl: item.image?.imageUrl || '',
        seller: item.seller?.username || 'Unknown',
        url: item.itemWebUrl,
        condition: item.condition || 'Unknown',
        shippingCost: item.estimatedAvailabilities?.[0]?.deliveryOptions?.[0]?.shippingCost?.value || 0
      };
    } catch (error) {
      console.error('eBay item details error:', error);
      return null;
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post('https://api.ebay.com/identity/v1/oauth2/token', 
        'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.appId}:${process.env.EBAY_CERT_ID}`).toString('base64')}`
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('eBay auth error:', error);
      throw new Error('Failed to authenticate with eBay');
    }
  }
}

// routes/ebay.ts
import express from 'express';
import { EbayService } from '../services/ebayService';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/search', auth, async (req, res) => {
  try {
    const { keywords, limit } = req.query;
    const user = (req as any).user;
    
    if (!user.apiKeys?.ebay?.appId) {
      return res.status(400).json({ error: 'eBay API credentials not configured' });
    }

    const ebayService = new EbayService(user.apiKeys.ebay.appId);
    const items = await ebayService.searchItems(keywords as string, parseInt(limit as string) || 50);
    
    res.json(items);
  } catch (error) {
    console.error('eBay search error:', error);
    res.status(500).json({ error: 'Failed to search eBay' });
  }
});

router.get('/item/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = (req as any).user;
    
    if (!user.apiKeys?.ebay?.appId) {
      return res.status(400).json({ error: 'eBay API credentials not configured' });
    }

    const ebayService = new EbayService(user.apiKeys.ebay.appId);
    const item = await ebayService.getItemDetails(itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('eBay item details error:', error);
    res.status(500).json({ error: 'Failed to get eBay item details' });
  }
});

export { router as ebayRoutes };
