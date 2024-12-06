import { List, showToast, Toast, getSelectedFinderItems, ActionPanel, Action, Detail, Icon } from "@raycast/api";
import { useState, useEffect, useCallback } from "react";
import toLocaleString from "./utils/toLocaleString";
// import fs from "fs";
import dexscreenerApi, { DexScreenerResponse, TokenPair } from "./utils/dexscreener";
import { debounce } from "lodash";
import { DEBOUNCE_TIME } from "./constants/time";
import { toShortNumber } from "./utils/number";
import { addStarredToken } from "./storage/star-tokens";

export default function SearchCoins() {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState<DexScreenerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedFetch = useCallback(
    debounce(async (query: string) => {
      try {
        const response = await dexscreenerApi.get<DexScreenerResponse>(
          `/dex/search?q=${query}`
        );

        setData(response.data);
        await showToast({
          style: Toast.Style.Success,
          title: "Search Success",
          message: `Found ${response.data.pairs?.length || 0} pairs`,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_TIME),
    []
  );

  useEffect(() => {
    if (searchText) {
      setIsLoading(true);
      debouncedFetch(searchText);
    }
  }, [searchText, debouncedFetch]);

  const onClickBookmark = (pair: TokenPair) => {
    addStarredToken(pair.pairAddress);
    showToast({
      style: Toast.Style.Success,
      title: "Starred Success",
      message: `${pair.baseToken.name} (${pair.baseToken.symbol.toUpperCase()})`,
    });
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search by token symbol or address..."
    >
      {data && data?.pairs?.map((pair) => (
        <List.Item
          key={`${pair.chainId}-${pair.pairAddress}`}
          title={pair.baseToken.name}
          subtitle={`${pair.baseToken.symbol.toUpperCase()} • Market Cap: $${toLocaleString(pair.marketCap)}`}
          icon={pair.info?.imageUrl}
          accessories={[
            { text: `Price: $${toLocaleString(pair.priceUsd)}`},
            { text: `FDV: $${toShortNumber(pair.fdv)}` },
            { text: `Liquidity: $${toShortNumber(pair.liquidity.usd)}` },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                icon={Icon.Eye}
                title="View Details"
                target={<CoinDetail pair={pair} onClickBookmark={() => onClickBookmark(pair)} />}
              />
              <Action
                title="Star"
                icon={Icon.Star}
                shortcut={{ modifiers: ["cmd"], key: "b" }}
                onAction={() => onClickBookmark(pair)}
              />
              <Action.OpenInBrowser url={pair.url} />
              <Action.CopyToClipboard title="Copy Pair Address" content={pair.pairAddress} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function CoinDetail({ pair, onClickBookmark }: { pair: TokenPair, onClickBookmark: () => void }) {
  const markdown = `
## Token Information
- ⛓️ Chain: ${pair.chainId}
- 📝 Contract: \`${pair.baseToken.address}\`
- 🔗 Pair Address: \`${pair.pairAddress}\`
- 📅 Created: ${new Date(pair.pairCreatedAt).toLocaleDateString()}

## Price Information
- 💵 Current Price: $${toLocaleString(pair.priceUsd)}
- 📊 Market Cap: $${toLocaleString(pair.marketCap)}
- 💫 FDV: $${toLocaleString(pair.fdv)}

## Price Changes
- ⏱️ 5min: ${pair.priceChange.m5?.toFixed(2)}%
- 🕐 1h: ${pair.priceChange.h1?.toFixed(2)}%
- 🕕 6h: ${pair.priceChange.h6?.toFixed(2)}%
- 🕛 24h: ${pair.priceChange.h24?.toFixed(2)}%

## Liquidity
- 💲 Total USD: $${toLocaleString(pair.liquidity.usd)}
- 🔄 Base Token: ${toLocaleString(pair.liquidity.base)} ${pair.baseToken.symbol.toUpperCase()}
- 💱 Quote Token: ${toLocaleString(pair.liquidity.quote)} ${pair.quoteToken.symbol.toUpperCase()}

## Trading Volume (24h)
- 📉 Volume: $${toLocaleString(pair.volume.h24)}
- 🟢 Buys: ${pair.txns.h24.buys}
- 🔴 Sells: ${pair.txns.h24.sells}

${pair.info?.imageUrl ? `\n![Token Logo](${pair.info.imageUrl})\n` : ''}
${pair.info?.websites ? '## 🌐 Websites\n' + pair.info.websites.map(web => `- [${web.label}](${web.url})`).join('\n') : ''}
${pair.info?.socials ? '## 📱 Social Media\n' + pair.info.socials.map(social => `- [${social.type}](${social.url})`).join('\n') : ''}
`;

  return <Detail 
    markdown={markdown}
    metadata={
      <Detail.Metadata>
        {pair.info?.imageUrl && (
          <Detail.Metadata.TagList title="Token">
            <Detail.Metadata.TagList.Item
              text={`${pair.baseToken.name} (${pair.baseToken.symbol.toUpperCase()})`}
              icon={pair.info.imageUrl}
            />
          </Detail.Metadata.TagList>
        )}
        <Detail.Metadata.Label
          title="Price"
          text={`$${toLocaleString(pair.priceUsd)}`}
        />
        <Detail.Metadata.Label
          title="Market Cap"
          text={`$${toLocaleString(pair.marketCap)}`}
        />
        <Detail.Metadata.Label
          title="24h Change"
          text={`${pair.priceChange.h24?.toFixed(2)}%`}
        />
        <Detail.Metadata.Label
          title="Liquidity"
          text={`$${toLocaleString(pair.liquidity.usd)}`}
        />
      </Detail.Metadata>
    }
    actions={
      <ActionPanel>
        <Action
          title="Star"
          icon={Icon.Star}
          shortcut={{ modifiers: ["cmd"], key: "b" }}
          onAction={onClickBookmark}
        />
        <Action.OpenInBrowser url={pair.url} />
        <Action.CopyToClipboard title="Copy Pair Address" content={pair.pairAddress} />
      </ActionPanel>
    }
  />;
}
