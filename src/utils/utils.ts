import { normalizeSuiAddress } from "@mysten/sui/utils";
import { NetworkCluster } from "@utils/constants";

export const capitalize = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const parseScreemingSnake = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/(^|_)([a-z])/g, (_, __, c) => " " + c.toUpperCase())
    .trim();
};

export const shorten = (value: string): string => {
  if (value.length > 14) return `${value.slice(0, 8)}...${value.slice(-6)}`;
  return value;
};

export const concat = (values: string[]): string => {
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
};

export const normalizeAddr = (
  address: string,
  networkCluster?: NetworkCluster
): string => {
  switch (networkCluster) {
    case NetworkCluster.Ethereum:
    case NetworkCluster.Ronin:
    case NetworkCluster.Aptos:
      return address.toLowerCase();
    case NetworkCluster.Sui:
      return normalizeSuiAddress(address);
    default:
      return address;
  }
};
