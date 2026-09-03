import { Minus, Plus, ShoppingBasket, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCart } from './useCart';
import { formatBDT, toBDTAmount } from './currency';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, itemCount, subtotal, updateQuantity } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {isOpen && <button type="button" aria-label="Close shopping basket" onClick={onClose} className="fixed inset-0 z-40 cursor-default bg-text/40 backdrop-blur-sm" />}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface text-text shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!isOpen}>
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div><p className="text-xs font-bold uppercase tracking-widest text-primary-600">Your picks</p><h2 className="mt-1 text-2xl font-black">Shopping basket <span className="text-base font-semibold text-text-muted">({itemCount})</span></h2></div>
          <button type="button" aria-label="Close shopping basket" onClick={onClose} className="rounded-full p-2 text-text transition hover:bg-primary-100 hover:text-primary-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center"><ShoppingBasket className="h-12 w-12 text-secondary-400" /><h3 className="mt-4 text-lg font-black">Your basket is ready for fun</h3><p className="mt-2 max-w-xs text-sm text-text-muted">Add a discovery from the shop and it will appear here.</p><button type="button" onClick={onClose} className="mt-5 rounded-xl bg-primary-600 px-5 py-3 font-bold text-white hover:bg-primary-700">Continue shopping</button></div>
          ) : items.map((item) => (
            <div key={item.name} className="flex gap-3 border-b border-border py-4 first:pt-0"><img src={item.image} alt="" className="h-20 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="font-bold">{item.name}</h3><button type="button" aria-label={`Remove ${item.name}`} onClick={() => updateQuantity(item.name, 0)} className="text-text-muted hover:text-primary-600"><Trash2 className="h-4 w-4" /></button></div><p className="mt-1 text-sm text-text-muted">{formatBDT(item.price)}</p><div className="mt-3 flex items-center gap-3"><div className="flex items-center rounded-lg border border-border"><button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(item.name, item.quantity - 1)} className="p-1.5 hover:bg-secondary-100"><Minus className="h-3 w-3" /></button><span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(item.name, item.quantity + 1)} className="p-1.5 hover:bg-secondary-100"><Plus className="h-3 w-3" /></button></div><span className="text-sm font-bold text-secondary-1000">{formatBDT(toBDTAmount(item.price) * item.quantity)}</span></div></div></div>
          ))}
        </div>
        {items.length > 0 && <div className="border-t border-border bg-surface-soft px-5 py-5"><div className="flex justify-between text-lg font-black"><span>Subtotal</span><span className="text-primary-700">{formatBDT(subtotal)}</span></div><p className="mt-2 text-xs text-text-muted">Shipping and taxes are calculated at checkout.</p><button type="button" onClick={() => { onClose(); navigate('/checkout'); }} className="mt-4 w-full rounded-xl bg-primary-600 px-5 py-3 font-bold text-white transition hover:bg-primary-700">Checkout</button></div>}
      </aside>
    </>
  );
};

export default CartDrawer;
