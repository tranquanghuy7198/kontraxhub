import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MetaMask, Ronin } from "@utils/wallets/ethereum/evm";
import { Wallet } from "@utils/wallets/wallet";
import { Phantom, Solflare } from "@utils/wallets/solana/solana";
import { Slush } from "@utils/wallets/sui/sui";
import { Petra } from "@utils/wallets/aptos/aptos";
import { KeplrWallet } from "@utils/wallets/cosmos/keplr";

interface WalletState {
  wallets: Record<string, Wallet>;
}

const initialState: WalletState = {
  wallets: Object.fromEntries(
    [
      new MetaMask(),
      new Ronin(),
      new Phantom(),
      new Solflare(),
      new Slush(),
      new Petra(),
      new KeplrWallet(),
    ].map((wallet) => [wallet.key, wallet])
  ),
};

export const walletSlice = createSlice({
  name: "wallets",
  initialState,
  reducers: {
    updateWallet(state, action: PayloadAction<Wallet>) {
      state.wallets[action.payload.key] = action.payload;
    },
  },
});

export const { updateWallet } = walletSlice.actions;
export default walletSlice.reducer;
