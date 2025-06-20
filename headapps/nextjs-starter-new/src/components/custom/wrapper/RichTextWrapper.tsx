import {
  RichText as JssRichText,
  LayoutServicePageState,
  RichTextField,
  useSitecoreContext,
} from '@sitecore-content-sdk/nextjs';
import { useEffect } from 'react';
import { handleToken, loadTokens } from 'Services/TokenService';

export default function RichTextWrapper({
  field,
  doReplacement,
}: {
  field: RichTextField;
  doReplacement: boolean;
}) {
  const sitecoreContext = useSitecoreContext();
  useEffect(() => {
    loadTokens();
  }, []);

  if (!doReplacement) {
    return <JssRichText field={field} />;
  }

  const mode = sitecoreContext.sitecoreContext.pageState;
  const mappedContent = handleToken(field.value, mode);

  switch (mode) {
    case LayoutServicePageState.Edit:
      return <JssRichText field={field} />;
    case LayoutServicePageState.Preview:
    case LayoutServicePageState.Normal:
      return <div dangerouslySetInnerHTML={{ __html: mappedContent?.replacedText }}></div>;

    default:
      return undefined;
  }
}
