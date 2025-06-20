import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { GraphQLRequestClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

interface TokenHandlingResponse {
  replacedText: string;
  isTextReplaced: boolean;
  additionalMessage: string;
}

interface Token {
  key: string;
  text: string | (() => string);
}

interface TokenResponseModel {
  item: {
    children: {
      results: {
        name: string;
        key: {
          jsonValue: {
            value: string;
          };
        };
        text: {
          jsonValue: {
            value: string;
          };
        };
      }[];
    };
  };
}

export const functionalTokens: Token[] = [
  {
    key: '{{Now}}',
    text: () => {
      return new Date().toLocaleTimeString();
    },
  } as Token,
];

async function fetchCmsTokens(): Promise<Token[]> {
  const start = new Date().getTime();
  const graphClient = GraphQLRequestClient.createClientFactory({
    endpoint:
      'https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1?sitecoreContextId=' +
      scConfig.api.edge.contextId,
  });

  const tokenResponse = await graphClient().request<TokenResponseModel>(
    `query{
      item(path:"{C68FEE77-4096-455D-9BA3-1E6FFD68EF00}", language:"en"){
        children{results{
          name
          key: field(name:"Key"){
            jsonValue
          }
          text: field(name:"Text"){
            jsonValue
          }
        }}
      }
    }`
  );
  const elapsed = new Date().getTime() - start;
  console.error('Time Elapsed for getting Tokens: ' + elapsed);

  return tokenResponse?.item?.children?.results?.map((item) => {
    return { key: item.key?.jsonValue?.value, text: item.text?.jsonValue?.value } as Token;
  });
}
let TOKENS: Token[] = [];

export function AvailableTokens() {
  return TOKENS?.map((token) => {
    return token.key;
  });
}

export async function loadTokens() {
  const fetchedTokens = await fetchCmsTokens();
  TOKENS = [...functionalTokens, ...fetchedTokens];
}

export function handleToken(
  input: string | undefined,
  pageMode: LayoutServicePageState | undefined
): TokenHandlingResponse {
  const tokenHandlingResponse: TokenHandlingResponse = {
    isTextReplaced: false,
    replacedText: '',
    additionalMessage: '',
  };

  if (!input) {
    return tokenHandlingResponse;
  }

  const isOpenBreakestThere = input.indexOf('{{');
  const isClosedBracketsThere = input.indexOf('}}');
  if (!isOpenBreakestThere || !isClosedBracketsThere) {
    return tokenHandlingResponse;
  }

  let newText = input;

  switch (pageMode) {
    case LayoutServicePageState.Edit:
      break;
    case LayoutServicePageState.Preview:
      TOKENS.forEach((token) => {
        const replacement = typeof token.text == 'string' ? token.text : token.text();
        newText = newText.replaceAll(
          token.key,
          '<span style="color:green;display:inline;font-weight: bold">' + replacement + '</span>'
        );
      });
      newText = newText
        .replace('<p>', "<p style='display:inline'>")
        .replace('<p d', "<p style='display:inline' d");
      tokenHandlingResponse.replacedText = newText;
      tokenHandlingResponse.isTextReplaced = true;
      console.log(newText);
      break;
    case LayoutServicePageState.Normal:
      TOKENS.forEach((token) => {
        newText = newText.replaceAll(
          token.key,
          typeof token.text == 'string' ? token.text : token.text()
        );
      });

      tokenHandlingResponse.replacedText = newText;
      tokenHandlingResponse.isTextReplaced = true;

      break;
  }

  return tokenHandlingResponse;
}
