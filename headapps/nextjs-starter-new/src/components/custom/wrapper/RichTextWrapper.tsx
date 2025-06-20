import {
  RichText as JssRichText,
  LayoutServicePageState,
  RichTextField,
  useSitecoreContext,
} from '@sitecore-content-sdk/nextjs';
import { useEffect, useState } from 'react';
import { AvailableTokens, handleToken, loadTokens } from 'Services/TokenService';

export default function RichTextWrapper({
  field,
  doReplacement,
}: {
  field: RichTextField;
  doReplacement: boolean;
}) {
  const sitecoreContext = useSitecoreContext();
  const [allToken, setAllToken] = useState<string[]>();
  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    loadTokens();
    setTimeout(() => {
      setAllToken(AvailableTokens());
    }, 2000);
  }, []);

  if (!doReplacement) {
    return <JssRichText field={field} />;
  }

  const mode = sitecoreContext.sitecoreContext.pageState;
  const mappedContent = handleToken(field.value, mode);

  switch (mode) {
    case LayoutServicePageState.Edit:
      return (
        <>
          <JssRichText field={field} />
        </>
      );
    case LayoutServicePageState.Preview:
      return (
        <>
          <div
            onClick={() => setOpen(!open)}
            dangerouslySetInnerHTML={{ __html: mappedContent?.replacedText }}
          ></div>

          <div
            style={{
              border: '1px dotted black',
              padding: '12px',
              fontSize: 12,
              display: open ? 'block' : 'none',
            }}
          >
            <p>Available Token are:</p>
            <ul style={{ fontSize: 6 }}>
              {allToken?.map((token) => {
                return <li key={token}>{token}</li>;
              })}
            </ul>
          </div>
        </>
      );
    case LayoutServicePageState.Normal:
      return (
        <>
          <div
            onClick={() => setOpen(!open)}
            dangerouslySetInnerHTML={{ __html: mappedContent?.replacedText }}
          ></div>
        </>
      );

    default:
      return undefined;
  }
}
