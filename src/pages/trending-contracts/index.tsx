import React, { useEffect, useState } from "react";
import Header from "@components/header";
import {
  ContractAddress,
  ContractTemplate,
  DeployedContract,
  NetworkCluster,
} from "@utils/constants";
import ContractCard from "@components/contract-card";
import { capitalize } from "@utils/utils";
import { XBlock, XMasonry } from "react-xmasonry";
import { useBlockchains } from "@hooks/blockchain";
import { useFetchPopularContracts } from "@hooks/contract";
import MainLayout from "@components/main-layout";
import { useSearchParams } from "react-router-dom";
import { buildContractHash, CONTRACT_PARAM } from "@utils/share";
import ContractInteraction from "@components/contract-interaction";

const TrendingContracts: React.FC = () => {
  const { blockchains } = useBlockchains();
  const { trendingContracts, trendingLoading } = useFetchPopularContracts();
  const [displayedContracts, setDisplayedContracts] = useState<
    DeployedContract[]
  >([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchedName, setSearchedName] = useState<string>();
  const [selectedAddress, setSelectedAddress] = useState<{
    template?: ContractTemplate;
    address?: ContractAddress;
    open: boolean;
  }>({ open: false });
  const [params] = useSearchParams();

  useEffect(() => {
    const contractHash = params.get(CONTRACT_PARAM);
    for (const contract of trendingContracts)
      for (const address of contract.addresses)
        if (
          buildContractHash(
            contract.template.id,
            address.blockchainId,
            address.address,
            blockchains.find((chain) => chain.id === address.blockchainId)
              ?.networkCluster
          ) === contractHash
        ) {
          setSelectedAddress({
            template: contract.template,
            address,
            open: true,
          });
          break;
        }
  }, [params, trendingContracts, blockchains]);

  useEffect(() => {
    setDisplayedContracts(
      trendingContracts.filter((contract) => {
        if (
          searchedName &&
          !contract.template.name
            .toLowerCase()
            .includes(searchedName.toLowerCase())
        )
          return false;
        for (const selectedNetworkCluster of selectedClusters)
          if (
            !blockchains
              .filter((chain) =>
                contract.addresses
                  .map((address) => address.blockchainId)
                  .includes(chain.id)
              )
              .map((chain) => chain.networkCluster.toString())
              .includes(selectedNetworkCluster)
          )
            return false;
        return true;
      })
    );
  }, [trendingContracts, blockchains, selectedClusters, searchedName]);

  return (
    <MainLayout loading={trendingLoading}>
      <Header
        header="Popular Contracts"
        options={Object.values(NetworkCluster).map((cluster) => ({
          value: cluster.toString(),
          label: capitalize(cluster.toString()),
        }))}
        onSelected={setSelectedClusters}
        onSearched={setSearchedName}
        defaultSelectAll={false}
      />
      <div className="masonry-container">
        <XMasonry center={false} targetBlockWidth={300}>
          {displayedContracts.map((contract) => (
            <XBlock key={contract.template.id}>
              <ContractCard
                contract={contract}
                onInteract={(template, address) =>
                  setSelectedAddress({ template, address, open: true })
                }
              />
            </XBlock>
          ))}
        </XMasonry>
      </div>
      <ContractInteraction
        open={selectedAddress.open}
        template={selectedAddress.template}
        address={selectedAddress.address}
        blockchain={blockchains.find(
          (chain) => chain.id === selectedAddress.address?.blockchainId
        )}
        onClose={() => setSelectedAddress({ ...selectedAddress, open: false })}
      />
    </MainLayout>
  );
};

export default TrendingContracts;
