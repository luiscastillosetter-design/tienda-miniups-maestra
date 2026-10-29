import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/services/dbService';
import { products as defaultProducts } from '@/data/products';

export async function GET() {
  try {
    const products = await dbService.get('store_products');
    if (!products || !Array.isArray(products) || products.length === 0) {
      await dbService.set('store_products', defaultProducts);
      return NextResponse.json(defaultProducts);
    }
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products from Redis:', error);
    return NextResponse.json(defaultProducts);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await dbService.set('store_products', body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving products to Redis:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}