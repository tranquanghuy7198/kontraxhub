import { Blockchain } from "@utils/constants";
import { useAppDispatch, useAppSelector } from "@redux/hook";
import { useCallback, useEffect, useState } from "react";
import { fetchBlockchains } from "@api/blockchains";
import { setBlockchains } from "@redux/reducers/blockchain";
import useLocalStorageState from "use-local-storage-state";
import { mergeChains } from "@utils/utils";

const CUSTOM_BLOCKCHAINS = "custom_blockchains";

export const useFetchBlockchains = () => {
  const dispatch = useAppDispatch();
  const blockchains = useAppSelector((state) => state.blockchain.blockchains);
  const [blockchainLoading, setBlockchainLoading] = useState<boolean>(false);
  const [customBlockchains, setCustomBlockchains] = useLocalStorageState<
    Blockchain[]
  >(CUSTOM_BLOCKCHAINS, { defaultValue: [] });

  const saveCustomBlockchain = (customBlockchain: Blockchain) => {
    setCustomBlockchains(mergeChains(customBlockchains, [customBlockchain]));
  };

  const fetchChains = useCallback(
    async (force: boolean = false): Promise<Blockchain[]> => {
      if (!force && blockchains.length > 0) return blockchains;

      try {
        setBlockchainLoading(true);
        const chains = await fetchBlockchains();
        const allChains = mergeChains(chains, customBlockchains);
        dispatch(setBlockchains(allChains));
        return allChains;
      } finally {
        setBlockchainLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (blockchains.length === 0) fetchChains(true);
  }, [fetchChains, blockchains.length]);

  return { blockchains, fetchChains, saveCustomBlockchain, blockchainLoading };
};
