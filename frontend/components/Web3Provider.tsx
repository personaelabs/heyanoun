import { createClient, WagmiConfig } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";

const client = createClient(
  getDefaultClient({
    appName: "nouns",
    autoConnect: true,
    infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
  })
);

const Web3Provider = ({ children }: any) => {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;
