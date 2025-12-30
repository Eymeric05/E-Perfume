import React, { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
    cart: {
        cartItems: localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : [],
        shippingAddress: localStorage.getItem('shippingAddress')
            ? JSON.parse(localStorage.getItem('shippingAddress'))
            : {},
        paymentMethod: 'Stripe',
    },
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
    wishlist: localStorage.getItem('wishlist')
        ? JSON.parse(localStorage.getItem('wishlist'))
        : [],
    viewedProducts: localStorage.getItem('viewedProducts')
        ? JSON.parse(localStorage.getItem('viewedProducts'))
        : [],
};

function reducer(state, action) {
    switch (action.type) {
        case 'CART_ADD_ITEM':
            const newItem = action.payload;
            const existItem = state.cart.cartItems.find(
                (item) => item._id === newItem._id
            );
            const cartItems = existItem
                ? state.cart.cartItems.map((item) =>
                    item._id === existItem._id ? newItem : item
                )
                : [...state.cart.cartItems, newItem];
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            return { ...state, cart: { ...state.cart, cartItems } };

        case 'CART_REMOVE_ITEM': {
            const cartItems = state.cart.cartItems.filter(
                (item) => item._id !== action.payload._id
            );
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            return { ...state, cart: { ...state.cart, cartItems } };
        }

        case 'CART_CLEAR':
            localStorage.removeItem('cartItems');
            return {
                ...state,
                cart: {
                    ...state.cart,
                    cartItems: [],
                },
            };

        case 'USER_SIGNIN':
            return { ...state, userInfo: action.payload };

        case 'USER_SIGNOUT':
            return {
                ...state,
                userInfo: null,
                cart: {
                    cartItems: [],
                    shippingAddress: {},
                    paymentMethod: 'Stripe',
                },
            };

        case 'SAVE_SHIPPING_ADDRESS':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    shippingAddress: action.payload,
                },
            };

        case 'SAVE_PAYMENT_METHOD':
            return {
                ...state,
                cart: { ...state.cart, paymentMethod: action.payload },
            };

        case 'WISHLIST_ADD_ITEM': {
            const wishlistItem = action.payload;
            const existItem = state.wishlist.find((item) => item._id === wishlistItem._id);
            const wishlist = existItem
                ? state.wishlist
                : [...state.wishlist, wishlistItem];
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            return { ...state, wishlist };
        }

        case 'WISHLIST_REMOVE_ITEM': {
            const wishlist = state.wishlist.filter(
                (item) => item._id !== action.payload._id
            );
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            return { ...state, wishlist };
        }

        case 'WISHLIST_CLEAR':
            localStorage.removeItem('wishlist');
            return { ...state, wishlist: [] };

        case 'ADD_VIEWED_PRODUCT': {
            const product = action.payload;
            const viewedProducts = state.viewedProducts.filter(
                (p) => p._id !== product._id
            );
            viewedProducts.unshift({ ...product, viewedAt: new Date().toISOString() });
            const limited = viewedProducts.slice(0, 12);
            localStorage.setItem('viewedProducts', JSON.stringify(limited));
            return { ...state, viewedProducts: limited };
        }

        default:
            return state;
    }
}

export function StoreProvider(props) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const value = { state, dispatch };
    return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
