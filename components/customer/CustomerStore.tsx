'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '@/lib/product-types';
import { useCustomerAuth } from '@/components/account/CustomerAuth';
import { createClient } from '@/lib/supabase/client';

type Selection = {
  wishlist: string[];
  cart: { id: string; quantity: number }[];
};
export type CustomerPanel = 'search' | 'wishlist' | 'cart' | null;
const storageKey = 'toyverse-customer-store-v1';
const empty: Selection = { wishlist: [], cart: [] };

function readSelection(productById: Map<string, Product>): Selection {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!saved || !Array.isArray(saved.wishlist) || !Array.isArray(saved.cart))
      return empty;
    const wishlist = [
      ...new Set<string>(
        saved.wishlist.filter(
          (id: unknown) => typeof id === 'string' && productById.has(id),
        ),
      ),
    ];
    const cart: Selection['cart'] = [];
    for (const item of saved.cart) {
      const product = productById.get(item?.id);
      if (
        !product?.inStock ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        cart.some((entry) => entry.id === item.id)
      )
        continue;
      cart.push({
        id: product.id,
        quantity: Math.min(item.quantity, product.details.stock),
      });
    }
    return { wishlist, cart };
  } catch {
    return empty;
  }
}

function useStore(initialProducts: Product[]) {
  const { user, ready: authReady } = useCustomerAuth();
  const supabase = useMemo(() => createClient(), []);
  const [initialProductById] = useState(
    () => new Map(initialProducts.map((product) => [product.id, product])),
  );
  const productById = useRef(initialProductById);
  const [catalog, setCatalog] = useState(initialProductById);
  const [selection, setSelection] = useState<Selection>(empty);
  const current = useRef(selection);
  const [panel, setPanel] = useState<CustomerPanel>(null);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartQueue = useRef(Promise.resolve());
  useEffect(() => {
    current.current = readSelection(initialProductById);
    setSelection(current.current);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [initialProductById]);

  const registerProducts = useCallback((products: Product[]) => {
    const next = new Map(productById.current);
    for (const product of products) next.set(product.id, product);
    productById.current = next;
    setCatalog(next);
    const restored = readSelection(next);
    current.current = restored;
    setSelection(restored);
  }, []);

  function update(next: Selection) {
    current.current = next;
    setSelection(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Memory-only mode when storage is unavailable. */
    }
  }
  function notify(message: string) {
    if (timer.current) clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(''), 3500);
  }
  useEffect(() => {
    if (!authReady || !user) return;
    let active = true;
    const userId = user.id;

    async function loadCustomerSelection() {
      const [wishlistResult, cartResult] = await Promise.all([
        supabase
          .from('wishlist_items')
          .select('product_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
        supabase
          .from('cart_items')
          .select('product_id,quantity')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
      ]);
      if (!active) return;
      if (wishlistResult.error || cartResult.error) {
        const error = wishlistResult.error || cartResult.error!;
        console.error('Unable to load customer selection:', error.message);
        notify(
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Unable to load your saved items.',
        );
        return;
      }
      const wishlist = (wishlistResult.data ?? [])
        .map((item) => item.product_id as string)
        .filter((id) => productById.current.has(id));
      const cart = (cartResult.data ?? []).flatMap((item) => {
        const product = productById.current.get(item.product_id as string);
        const quantity = Math.trunc(Number(item.quantity));
        if (!product?.inStock || quantity < 1) return [];
        return [
          {
            id: product.id,
            quantity: Math.min(quantity, product.details.stock),
          },
        ];
      });
      update({ wishlist, cart });
    }

    void loadCustomerSelection();
    return () => {
      active = false;
    };
  }, [authReady, supabase, user]);
  async function toggleWishlist(id: string) {
    if (!productById.current.has(id)) return;
    const saved = current.current;
    const removing = saved.wishlist.includes(id);
    const next = {
      ...saved,
      wishlist: removing
        ? saved.wishlist.filter((item) => item !== id)
        : [...saved.wishlist, id],
    };
    update(next);
    if (!user) return;

    const { error } = removing
      ? await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id)
      : await supabase
          .from('wishlist_items')
          .upsert(
            { user_id: user.id, product_id: id },
            { onConflict: 'user_id,product_id', ignoreDuplicates: true },
          );
    if (error) {
      update(saved);
      console.error('Wishlist update failed:', error.message);
      notify(
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Unable to update your wishlist.',
      );
      return;
    }
    notify(
      removing ? 'Removed from your wishlist.' : 'Added to your wishlist.',
    );
  }
  async function removeFromWishlist(id: string) {
    if (!current.current.wishlist.includes(id)) return;
    await toggleWishlist(id);
  }
  function queueCartMutation(
    mutation: () => PromiseLike<{ error: { message: string } | null }>,
    rollback: Selection,
  ) {
    if (!user) return;
    cartQueue.current = cartQueue.current.then(async () => {
      const { error } = await mutation();
      if (!error) return;
      update(rollback);
      console.error('Cart update failed:', error.message);
      notify(
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Unable to update your cart.',
      );
    });
  }
  function addToCart(id: string, quantity = 1) {
    const product = productById.current.get(id);
    const saved = current.current;
    const existing = saved.cart.find((item) => item.id === id);
    if (!product?.inStock || product.details.stock < 1) {
      notify('This toy is currently out of stock.');
      return false;
    }
    if (!Number.isInteger(quantity) || quantity < 1) return false;
    if ((existing?.quantity || 0) + quantity > product.details.stock) {
      notify('Available stock limit reached.');
      return false;
    }
    const nextQuantity = (existing?.quantity || 0) + quantity;
    update({
      ...saved,
      cart: existing
        ? saved.cart.map((item) =>
            item.id === id ? { ...item, quantity: nextQuantity } : item,
          )
        : [...saved.cart, { id, quantity }],
    });
    if (user) {
      const userId = user.id;
      queueCartMutation(
        () =>
          supabase.from('cart_items').upsert(
            {
              user_id: userId,
              product_id: id,
              quantity: nextQuantity,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,product_id' },
          ),
        saved,
      );
    }
    notify('Added to cart successfully.');
    return true;
  }
  function changeQuantity(id: string, delta: number) {
    const product = productById.current.get(id);
    if (!product) return;
    const saved = current.current;
    const existing = saved.cart.find((item) => item.id === id);
    if (!existing) return;
    const quantity = Math.max(
      1,
      Math.min(product.details.stock, existing.quantity + delta),
    );
    update({
      ...saved,
      cart: saved.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    });
    if (user) {
      const userId = user.id;
      queueCartMutation(
        () =>
          supabase
            .from('cart_items')
            .update({ quantity, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('product_id', id),
        saved,
      );
    }
  }
  function removeFromCart(id: string) {
    const saved = current.current;
    update({
      ...saved,
      cart: saved.cart.filter((item) => item.id !== id),
    });
    if (user) {
      const userId = user.id;
      queueCartMutation(
        () =>
          supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', id),
        saved,
      );
    }
  }
  function clearCart(purchased?: Selection['cart']) {
    // Preserve items added elsewhere while the payment window was open.
    const cart = purchased
      ? current.current.cart
          .map((item) => ({
            ...item,
            quantity:
              item.quantity -
              (purchased.find((paid) => paid.id === item.id)?.quantity || 0),
          }))
          .filter((item) => item.quantity > 0)
      : [];
    const saved = current.current;
    update({ ...saved, cart });
    if (user) {
      const userId = user.id;
      queueCartMutation(async () => {
        if (!purchased)
          return supabase.from('cart_items').delete().eq('user_id', userId);
        const results = await Promise.all(
          purchased.map((paid) => {
            const remaining = cart.find((item) => item.id === paid.id);
            return remaining
              ? supabase
                  .from('cart_items')
                  .update({
                    quantity: remaining.quantity,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('user_id', userId)
                  .eq('product_id', paid.id)
              : supabase
                  .from('cart_items')
                  .delete()
                  .eq('user_id', userId)
                  .eq('product_id', paid.id);
          }),
        );
        return { error: results.find((result) => result.error)?.error ?? null };
      }, saved);
    }
  }
  return {
    ...selection,
    panel,
    setPanel,
    toast,
    notify,
    registerProducts,
    toggleWishlist,
    removeFromWishlist,
    addToCart,
    changeQuantity,
    removeFromCart,
    clearCart,
    cartItems: selection.cart.map((item) => ({
      ...catalog.get(item.id)!,
      quantity: item.quantity,
    })),
    wishlistCount: selection.wishlist.length,
    cartCount: selection.cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: selection.cart.reduce(
      (sum, item) => sum + (catalog.get(item.id)?.price || 0) * item.quantity,
      0,
    ),
    products: [...catalog.values()],
  };
}

const CustomerStoreContext = createContext<ReturnType<typeof useStore> | null>(
  null,
);
export function CustomerStoreProvider({
  children,
  initialProducts,
}: {
  children: ReactNode;
  initialProducts: Product[];
}) {
  const store = useStore(initialProducts);
  return (
    <CustomerStoreContext.Provider value={store}>
      {children}
    </CustomerStoreContext.Provider>
  );
}
export function useCustomerStore() {
  const store = useContext(CustomerStoreContext);
  if (!store) throw new Error('CustomerStoreProvider is required');
  return store;
}
