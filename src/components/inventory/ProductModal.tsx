import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product } from '../../types/pdv';
import { Button } from '../../components/ui/Button';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<Product>) => void;
  product?: Product | null;
  isLoading?: boolean;
}

export function ProductModal({ isOpen, onClose, onSubmit, product, isLoading }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    sellingPrice: 0,
    unitOfMeasure: 'UN',
    minStockLevel: 0,
    category: 'Geral'
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        sellingPrice: product.sellingPrice,
        unitOfMeasure: product.unitOfMeasure,
        minStockLevel: product.minStockLevel,
        category: product.category || 'Geral'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sellingPrice: 0,
        unitOfMeasure: 'UN',
        minStockLevel: 0,
        category: 'Geral'
      });
    }
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Nome do Produto</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Descrição</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Preço Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
              >
                <option value="Geral">Geral</option>
                <option value="Chopp">Chopp</option>
                <option value="Bebida">Bebida</option>
                <option value="Comida">Comida</option>
              </select>
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Unidade de Medida</label>
              <select
                value={formData.unitOfMeasure}
                onChange={e => setFormData({...formData, unitOfMeasure: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
              >
                <option value="UN">Unidade (UN)</option>
                <option value="L">Litro (L)</option>
                <option value="KG">Quilo (KG)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Estoque Mínimo (Alerta)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.minStockLevel}
                onChange={e => setFormData({...formData, minStockLevel: parseFloat(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isLoading}
            >
              {product ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}