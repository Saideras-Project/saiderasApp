import React, { useState, useEffect } from 'react';
import { Trash2, DollarSign, User, Plus } from 'lucide-react';
import { Comanda, Product } from '../../types/pdv';
import { Button } from '../ui/Button';

interface OrderPanelProps {
  comanda: Comanda | null;
  products: Product[];
  onAddItem: (productId: string, quantity: number) => void;
  onCloseAccount: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function OrderPanel({ comanda, products, onAddItem, onCloseAccount }: OrderPanelProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Reset form when comanda changes
  useEffect(() => {
    setSelectedProduct("");
    setQuantity(1);
  }, [comanda?.id]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && quantity > 0) {
      onAddItem(selectedProduct, quantity);
      setSelectedProduct("");
      setQuantity(1);
    }
  };

  if (!comanda) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <UtensilsIcon size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Nenhuma mesa selecionada</p>
        <p className="text-sm mt-2">Selecione uma mesa ou comanda para ver os detalhes.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{comanda.table}</h2>
          <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-1 rounded uppercase">
            Em Aberto
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aberta em {new Date(comanda.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {comanda.items.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-600">
            <p>Nenhum item adicionado.</p>
          </div>
        ) : (
          comanda.items.map((item) => (
            <div 
              key={item.id} 
              className="flex justify-between items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group"
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {item.product?.name || item.name}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(Number(item.unitPrice) * item.quantity)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-sm text-slate-500 dark:text-slate-400">
                  <span>{item.quantity}x {formatCurrency(Number(item.unitPrice))}</span>
                  {item.isCourtesy && (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                      Cortesia
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Item Form */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Produto</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">Selecione...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatCurrency(Number(p.sellingPrice))}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <div className="w-24">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qtd</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none text-center"
              />
            </div>
            <div className="flex-1 pt-5">
              <Button 
                type="submit" 
                className="w-full"
                disabled={!selectedProduct}
                icon={<Plus size={18} />}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Totals & Actions */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>{formatCurrency(comanda.total)}</span> {/* Simplificado por enquanto */}
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Taxa de Serviço (10%)</span>
            <span>{formatCurrency(Number(comanda.tip || 0))}</span>
          </div>
          <div className="flex justify-between text-xl font-extrabold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Total</span>
            <span>{formatCurrency(comanda.total)}</span>
          </div>
        </div>

        <Button 
          onClick={onCloseAccount} 
          variant="primary" 
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-lg focus:ring-emerald-500"
        >
          Fechar Conta
        </Button>
      </div>
    </div>
  );
}

function UtensilsIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}