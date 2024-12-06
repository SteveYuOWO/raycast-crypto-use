import { LocalStorage } from "@raycast/api";

const TOKENS_KEY = "STARRED_TOKENS";

export async function getStarredTokens(): Promise<string[]> {
  const tokens = await LocalStorage.getItem<string>(TOKENS_KEY);
  try {
    return tokens ? JSON.parse(tokens) : [];
  } catch (e) {
    clearStarredTokens();
    return [];
  }
}

export async function addStarredToken(address: string): Promise<void> {
  const tokens = await getStarredTokens();
  if (!tokens.includes(address)) {
    tokens.push(address);
    await LocalStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }
}

export async function removeStarredToken(address: string): Promise<void> {
  const tokens = await getStarredTokens();
  const filteredTokens = tokens.filter((token) => token !== address);
  await LocalStorage.setItem(TOKENS_KEY, JSON.stringify(filteredTokens));
}

export async function clearStarredTokens(): Promise<void> {
  await LocalStorage.removeItem(TOKENS_KEY);
}
