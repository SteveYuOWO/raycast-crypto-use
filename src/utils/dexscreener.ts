import axios from "axios";
import { TIMEOUT } from "../constants/time";

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
}

export interface Social {
  type: string;
  url: string;
}

export interface Website {
  label: string;
  url: string;
}

export interface TokenPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: Website[];
    socials?: Social[];
  };
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: TokenPair[];
}

const dexscreenerApi = axios.create({
  baseURL: "https://api.dexscreener.com/latest",
  timeout: TIMEOUT,
});

export default dexscreenerApi;
