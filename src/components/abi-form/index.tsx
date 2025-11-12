import React, { useEffect, useState } from "react";
import "@components/abi-form/abi-form.scss";
import {
  AbiAction,
  Blockchain,
  ContractAddress,
  ContractTemplate,
  NetworkCluster,
} from "@utils/constants";
import EvmForm from "@components/abi-form/evm-form";
import SuiForm from "@components/abi-form/sui-form";
import AptosForm from "@components/abi-form/aptos-form";
import SolanaForm from "@components/abi-form/solana-form";
import CosmosForm from "@components/abi-form/cosmos-form";
import AbiWalletForm from "@components/abi-form/abi-wallet-form";
import { Wallet } from "@utils/wallets/wallet";
import { Button, Flex, Segmented, Space } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  FireOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useBlockchains } from "@hooks/blockchain";
import { useAuth } from "@hooks/auth";
import { addContractAddresses } from "@api/contracts";
import { useFetchMyContracts } from "@hooks/contract";
import ShareModal from "@components/share-modal";
import { buildShareableUrl } from "@utils/share";
import useNotification from "antd/es/notification/useNotification";
import { POPULAR_CONTRACTS } from "@utils/routes";
import { shorten } from "@utils/utils";

const AbiForm: React.FC<{
  defaultAction: AbiAction;
  contractTemplate: ContractTemplate;
  contractAddress?: ContractAddress; // not used for Contract Deploy
}> = ({ contractAddress, defaultAction, contractTemplate }) => {
  const { blockchains } = useBlockchains();
  const { callAuthenticatedApi } = useAuth();
  const { fetchContracts } = useFetchMyContracts();
  const [wallet, setWallet] = useState<Wallet>();
  const [blockchain, setBlockchain] = useState<Blockchain>();
  const [action, setAction] = useState<AbiAction>(defaultAction);
  const [share, setShare] = useState<boolean>(false);
  const [notification, contextHolder] = useNotification();
  const [sharing, setSharing] = useState<boolean>(false);
  const [faucetRequesting, setFaucetRequesting] = useState<boolean>(false);

  useEffect(() => {
    const selectedChain = blockchains.find(
      (chain) => chain.id === contractAddress?.blockchainId
    );
    if (selectedChain) setBlockchain(selectedChain);
  }, [contractAddress, blockchains]);

  const requestFaucet = async () => {
    try {
      setFaucetRequesting(true);
      if (!blockchain || !wallet)
        throw new Error("Blockchain or wallet not found");
      const amount = await wallet.faucet(blockchain);
      notification.success({
        message: "Successful faucet request",
        description: `${amount} ${
          blockchain.nativeToken
        } has been sent to your wallet address ${shorten(wallet.address!)}.`,
      });
    } catch (error) {
      notification.error({
        message: "Cannot request faucet",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setFaucetRequesting(false);
    }
  };

  const shareContract = async () => {
    try {
      setSharing(true);
      if (!blockchain || !contractAddress)
        throw new Error("Blockchain or contract address not found");
      if (!contractAddress.publicity) {
        // Must publish before sharing so others can access it
        await callAuthenticatedApi(addContractAddresses, contractTemplate.id, [
          { ...contractAddress, publicity: true },
        ]);
        await fetchContracts(true);
      }
      setShare(true);
    } catch (error) {
      notification.error({
        message: "Cannot share contract",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <AbiWalletForm
        contractAddress={contractAddress}
        networkClusters={contractTemplate.networkClusters}
        onWalletSelected={setWallet}
        onBlockchainSelected={setBlockchain}
      />
      {defaultAction !== AbiAction.Deploy && (
        <Flex
          align="center"
          justify="space-between"
          className="action-selector"
        >
          <Segmented<AbiAction>
            defaultValue={defaultAction}
            options={[
              {
                label: "Read Contract",
                value: AbiAction.Read,
                icon: <EyeOutlined />,
              },
              {
                label: "Write Contract",
                value: AbiAction.Write,
                icon: <EditOutlined />,
              },
            ]}
            onChange={(value) => setAction(value)}
          />
          <Space>
            {blockchain?.faucet && (
              <Button
                variant="filled"
                color="default"
                icon={<FireOutlined />}
                loading={faucetRequesting}
                onClick={requestFaucet}
              >
                Faucet
              </Button>
            )}
            <Button
              variant="filled"
              color="default"
              icon={<SendOutlined />}
              iconPosition="end"
              loading={sharing}
              onClick={shareContract}
            >
              Share
            </Button>
          </Space>
        </Flex>
      )}
      {contractTemplate.networkClusters.includes(NetworkCluster.Sui) ? (
        <SuiForm
          action={action}
          contractTemplate={contractTemplate}
          contractAddress={contractAddress}
          wallet={wallet}
          blockchain={blockchain}
        />
      ) : contractTemplate.networkClusters.includes(NetworkCluster.Solana) ? (
        <SolanaForm
          action={action}
          contractTemplate={contractTemplate}
          contractAddress={contractAddress}
          wallet={wallet}
          blockchain={blockchain}
        />
      ) : contractTemplate.networkClusters.includes(NetworkCluster.Cosmos) ? (
        <CosmosForm
          action={action}
          contractTemplate={contractTemplate}
          contractAddress={contractAddress}
          wallet={wallet}
          blockchain={blockchain}
        />
      ) : contractTemplate.networkClusters.includes(
          NetworkCluster.FlowChain
        ) ? (
        <>Available soon</>
      ) : contractTemplate.networkClusters.includes(NetworkCluster.Aptos) ? (
        <AptosForm
          action={action}
          contractTemplate={contractTemplate}
          contractAddress={contractAddress}
          wallet={wallet}
          blockchain={blockchain}
        />
      ) : (
        <EvmForm
          action={action}
          contractTemplate={contractTemplate}
          contractAddress={contractAddress}
          wallet={wallet}
          blockchain={blockchain}
        />
      )}
      <ShareModal
        shareableUrl={buildShareableUrl(
          POPULAR_CONTRACTS,
          contractTemplate.id,
          contractAddress?.blockchainId ?? "",
          contractAddress?.address ?? "",
          blockchain?.networkCluster
        )}
        showModal={share}
        onHide={() => setShare(false)}
      />
    </div>
  );
};

export default AbiForm;
