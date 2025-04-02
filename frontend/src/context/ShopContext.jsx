import { createContext } from "react";

// Create the context
export const ShopContext = createContext();

// Export the provider from a separate file
export { default as ShopContextProvider } from './ShopContextProvider';
