import { describe, expect, it } from 'vitest'
import { mapDummyJSONToStockItem } from '@/types/api'
import { sampleDummyJSONProduct } from './fixtures'

describe('mapDummyJSONToStockItem', () => {
  it('maps DummyJSON catalog fields onto the StockItem domain shape', () => {
    const item = mapDummyJSONToStockItem(sampleDummyJSONProduct)

    expect(item).toEqual({
      id: 1,
      name: 'Essence Mascara Lash Princess',
      description: 'Volumizing mascara',
      category: 'beauty',
      unitPrice: 9.99,
      quantityOnHand: 5,
      rating: 4.94,
      thumbnailUrl:
        'https://cdn.dummyjson.com/product-images/beauty/1/thumbnail.webp',
      imageUrls: ['https://cdn.dummyjson.com/product-images/beauty/1/1.webp'],
      availability: 'Low Stock',
    })
    expect(item).not.toHaveProperty('title')
    expect(item).not.toHaveProperty('stock')
    expect(item).not.toHaveProperty('price')
  })
})
