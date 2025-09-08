// services/amazonService.ts
import axios from 'axios';
import crypto from 'crypto';

export interface AmazonItem {
  asin: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  url: string;
  availability: string;
  seller: string;
}

class AmazonService {
  private accessKey: string;
  private secretKey: string;
  private associateTag: string;
  private baseUrl = 'https://webservices.amazon.co.uk/paapi5'; // UK endpoint

  constructor(accessKey: string, secretKey: string, associateTag: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.associateTag = associateTag;
  }

  async searchItems(keywords: string): Promise<AmazonItem[]> {
    try {
      const payload = {
        Keywords: keywords,
        SearchIndex: 'All',
        ItemCount: 10,
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'Offers.Listings.Price',
          'Offers.Listings.Availability.Message'
        ],
        PartnerTag: this.associateTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.co.uk'
      };

      const response = await this.makeRequest('SearchItems', payload);
      
      return response.SearchResult?.Items?.map((item: any) => ({
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || 'Unknown',
        price: item.Offers?.Listings?.[0]?.Price?.Amount / 100 || 0,
        currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'GBP',
        imageUrl: item.Images?.Primary?.Large?.URL || '',
        url: item.DetailPageURL,
        availability: item.Offers?.Listings?.[0]?.Availability?.Message || 'Unknown',
        seller: 'Amazon'
      })) || [];
    } catch (error) {
      console.error('Amazon search error:', error);
      throw new Error('Failed to search Amazon items');
    }
  }

  async getItemDetails(asin: string): Promise<AmazonItem | null> {
    try {
      const payload = {
        ItemIds: [asin],
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'Offers.Listings.Price',
          'Offers.Listings.Availability.Message'
        ],
        PartnerTag: this.associateTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.co.uk'
      };

      const response = await this.makeRequest('GetItems', payload);
      const item = response.ItemsResult?.Items?.[0];
      
      if (!item) return null;

      return {
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || 'Unknown',
        price: item.Offers?.Listings?.[0]?.Price?.Amount / 100 || 0,
        currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'GBP',
        imageUrl: item.Images?.Primary?.Large?.URL || '',
        url: item.DetailPageURL,
        availability: item.Offers?.Listings?.[0]?.Availability?.Message || 'Unknown',
        seller: 'Amazon'
      };
    } catch (error) {
      console.error('Amazon item details error:', error);
      return null;
    }
  }

  private async makeRequest(operation: string, payload: any): Promise<any> {
    const host = 'webservices.amazon.co.uk';
    const uri = '/paapi5/' + operation.toLowerCase();
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': host,
      'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`
    };

    const signedHeaders = this.signRequest('POST', uri, headers, JSON.stringify(payload));
    
    try {
      const response = await axios.post(`https://${host}${uri}`, payload, {
        headers: signedHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Amazon API request error:', error);
      throw error;
    }
  }

  private signRequest(method: string, uri: string, headers: any, payload: string): any {
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);

    headers['X-Amz-Date'] = timestamp;

    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n');

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const hashedPayload = crypto.createHash('sha256').update(payload).digest('hex');

    const canonicalRequest = [
      method,
      uri,
      '',
      canonicalHeaders,
      '',
      signedHeaders,
      hashedPayload
    ].join('\n');

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/us-east-1/ProductAdvertisingAPI/aws4_request`;
    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    const signingKey = this.getSignatureKey(this.secretKey, date, 'us-east-1', 'ProductAdvertisingAPI');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    headers['Authorization'] = `${algorithm} Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return headers;
  }

  private getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  }
}

// routes/amazon.ts
import express from 'express';
import { AmazonService } from '../services/amazonService';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/search', auth, async (req, res) => {
  try {
    const { keywords } = req.query;
    const user = (req as any).user;
    
    if (!user.apiKeys?.amazon?.accessKey) {
      return res.status(400).json({ error: 'Amazon API credentials not configured' });
    }

    const amazonService = new AmazonService(
      user.apiKeys.amazon.accessKey,
      user.apiKeys.amazon.secretKey,
      user.apiKeys.amazon.associateTag
    );
    
    const items = await amazonService.searchItems(keywords as string);
    res.json(items);
  } catch (error) {
    console.error('Amazon search error:', error);
    res.status(500).json({ error: 'Failed to search Amazon' });
  }
});

router.get('/item/:asin', auth, async (req, res) => {
  try {
    const { asin } = req.params;
    const user = (req as any).user;
    
    if (!user.apiKeys?.amazon?.accessKey) {
      return res.status(400).json({ error: 'Amazon API credentials not configured' });
    }

    const amazonService = new AmazonService(
      user.apiKeys.amazon.accessKey,
      user.apiKeys.amazon.secretKey,
      user.apiKeys.amazon.associateTag
    );
    
    const item = await amazonService.getItemDetails(asin);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Amazon item details error:', error);
    res.status(500).json({ error: 'Failed to get Amazon item details' });
  }
});

export { router as amazonRoutes };
