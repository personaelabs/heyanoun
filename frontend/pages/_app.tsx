/* eslint-disable @next/next/no-sync-scripts */
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  WagmiConfig,
  createClient,
  configureChains,
  chain,
  defaultChains,
} from "wagmi";
import "dotenv";
import { infuraProvider } from "wagmi/providers/infura";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  infuraProvider({ apiKey: process.env.CLIENT_INFURA_PROJECT_ID }),
]);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const client = createClient({
  connectors,
  provider,
  webSocketProvider,
});

// React query client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={client}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
          <Toaster />
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default MyApp;
