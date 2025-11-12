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
import { Drawer } from "antd";
import ContractForm, {
  ContractFormStructure,
  parseContractForm,
} from "@components/contract-form";
import useNotification from "antd/es/notification/useNotification";
import Paragraph from "antd/es/typography/Paragraph";
import { XBlock, XMasonry } from "react-xmasonry";
import ConfirmModal from "@components/confirm-modal";
import { useBlockchains } from "@hooks/blockchain";
import AuthModal from "@components/auth-modal";
import {
  useFetchMyContracts,
  useFetchMyTemplates,
  useFetchPopularContracts,
} from "@hooks/contract";
import { useAuth } from "@hooks/auth";
import {
  createContractAndTemplate,
  deleteContractAddresses,
  updateContractAndTemplate,
} from "@api/contracts";
import MainLayout from "@components/main-layout";
import ContractInteraction from "@/components/contract-interaction";

const Contracts: React.FC = () => {
  const [notification, contextHolder] = useNotification();
  const { blockchains } = useBlockchains();
  const { fetchPopularContracts } = useFetchPopularContracts();
  const { fetchTemplates } = useFetchMyTemplates();
  const { contracts, fetchContracts, contractLoading } = useFetchMyContracts();
  const { callAuthenticatedApi } = useAuth();
  const [displayedContracts, setDisplayedContracts] = useState<
    DeployedContract[]
  >([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchedName, setSearchedName] = useState<string>();
  const [contractForm, setContractForm] = useState<{
    open: boolean;
    form?: ContractFormStructure;
  }>({ open: false, form: undefined });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string>();
  const [selectedAddress, setSelectedAddress] = useState<{
    template?: ContractTemplate;
    address?: ContractAddress;
    open: boolean;
  }>({ open: false });

  useEffect(() => {
    setDisplayedContracts(
      contracts.filter((contract) => {
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
  }, [contracts, blockchains, selectedClusters, searchedName]);

  const parseToContract = (
    contract: ContractFormStructure
  ): DeployedContract => {
    try {
      return parseContractForm(contract, blockchains);
    } catch (e) {
      notification.error({
        message: "Invalid data",
        description: (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
          >
            {e instanceof Error ? e.message : String(e)}
          </Paragraph>
        ),
      });
      throw e;
    }
  };

  const saveContract = async (contract: DeployedContract) => {
    try {
      await callAuthenticatedApi(
        contracts.some((c) => c.template.id === contract.template.id)
          ? updateContractAndTemplate
          : createContractAndTemplate,
        contract
      );
      await fetchContracts(true);

      // Less important, no need to await
      fetchTemplates(true); // This can affect my templates
      fetchPopularContracts(true); // This can affect popular contracts
      notification.success({
        message: "Contract Saved",
        description: "A contract has been saved",
      });
    } catch (error) {
      notification.error({
        message: "Error saving contract",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setContractForm({ open: false });
    }
  };

  const editContract = (templateId: string) => {
    const contract = contracts.find((c) => c.template.id === templateId);
    if (!contract) notification.error({ message: "Contract not found" });
    else
      setContractForm({
        open: true,
        form: {
          templateId: contract.template.id,
          name: contract.template.name,
          description: contract.template.description,
          abi: JSON.stringify(contract.template.abi),
          bytecode: contract.template.bytecode,
          flattenSource: contract.template.flattenSource,
          addresses: contract.addresses,
        },
      });
  };

  const deleteContract = async (templateId?: string) => {
    if (!templateId) return;
    try {
      await callAuthenticatedApi(deleteContractAddresses, templateId);
      await fetchContracts(true);

      // Less important, no need to await
      fetchTemplates(true); // This can affect my templates
      fetchPopularContracts(true); // This can affect popular contracts
      notification.success({
        message: "Contract Deleted",
        description: "A contract has been deleted",
      });
    } catch (error) {
      notification.error({
        message: "Error deleting contract",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const interactContract = (
    template: ContractTemplate,
    address: ContractAddress
  ) => {
    const contractChain = blockchains.find(
      (chain) => chain.id === address.blockchainId
    );
    if (contractChain) setSelectedAddress({ template, address, open: true });
    else
      notification.error({
        message: "Blockchain not found",
        description:
          "This blockchain is not supported anymore, or your customized blockchain was deleted.",
      });
  };

  return (
    <MainLayout loading={contractLoading}>
      {contextHolder}
      <AuthModal />
      <Header
        header="Contract Explorer"
        options={Object.values(NetworkCluster).map((cluster) => ({
          value: cluster.toString(),
          label: capitalize(cluster.toString()),
        }))}
        onSelected={setSelectedClusters}
        onSearched={setSearchedName}
        onAddRequested={() => setContractForm({ open: true, form: undefined })}
        defaultSelectAll={false}
      />
      <div className="masonry-container">
        <XMasonry center={false} targetBlockWidth={300}>
          {displayedContracts.map((contract) => (
            <XBlock key={contract.template.id}>
              <ContractCard
                contract={contract}
                onDelete={setConfirmDeleteId}
                onEdit={editContract}
                onInteract={interactContract}
              />
            </XBlock>
          ))}
        </XMasonry>
      </div>
      <Drawer
        width={800}
        title={contractForm.form ? contractForm.form.name : "Add Contract"}
        open={contractForm.open}
        closable={true}
        onClose={() => setContractForm({ ...contractForm, open: false })}
      >
        <ContractForm
          contractForm={contractForm}
          saveContract={(contract) => saveContract(parseToContract(contract))}
        />
      </Drawer>
      <ContractInteraction
        open={selectedAddress.open}
        template={selectedAddress.template}
        address={selectedAddress.address}
        blockchain={blockchains.find(
          (chain) => chain.id === selectedAddress.address?.blockchainId
        )}
        onClose={() => setSelectedAddress({ ...selectedAddress, open: false })}
      />
      <ConfirmModal
        showModal={confirmDeleteId !== undefined}
        danger
        onOk={() => deleteContract(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(undefined)}
        title="Delete this contract?"
        description="This action cannot be undone. All information associated with this contract will be lost."
        okText="Delete Contract"
      />
    </MainLayout>
  );
};

export default Contracts;
