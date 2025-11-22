'use client';
import { useState } from 'react';
import type { Item } from '@/types/item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ItemFormProps {
  item: Item | null;
  onSubmit: (data: Partial<Item>) => void;
  onCancel: () => void;
}

export function ItemForm({ item, onSubmit, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState<Partial<Item>>(
    item || {
      item_code: '',
      item_name: '',
      item_group: '',
      stock_uom: '',
      is_stock_item: 1,
      valuation_rate: 0,
      standard_rate: 0,
      opening_stock: 0,
      description: '',
      brand: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof Item, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="item_code">Item Code *</Label>
          <Input
            id="item_code"
            value={formData.item_code}
            onChange={(e) => handleChange('item_code', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="item_name">Item Name *</Label>
          <Input
            id="item_name"
            value={formData.item_name}
            onChange={(e) => handleChange('item_name', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="item_group">Item Group</Label>
          <Input
            id="item_group"
            value={formData.item_group || ''}
            onChange={(e) => handleChange('item_group', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="stock_uom">Stock UOM</Label>
          <Input
            id="stock_uom"
            value={formData.stock_uom || ''}
            onChange={(e) => handleChange('stock_uom', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="valuation_rate">Valuation Rate</Label>
          <Input
            id="valuation_rate"
            type="number"
            value={formData.valuation_rate || 0}
            onChange={(e) =>
              handleChange('valuation_rate', parseFloat(e.target.value))
            }
          />
        </div>

        <div>
          <Label htmlFor="standard_rate">Standard Rate</Label>
          <Input
            id="standard_rate"
            type="number"
            value={formData.standard_rate || 0}
            onChange={(e) =>
              handleChange('standard_rate', parseFloat(e.target.value))
            }
          />
        </div>

        <div>
          <Label htmlFor="opening_stock">Opening Stock</Label>
          <Input
            id="opening_stock"
            type="number"
            value={formData.opening_stock || 0}
            onChange={(e) =>
              handleChange('opening_stock', parseFloat(e.target.value))
            }
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {item ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
