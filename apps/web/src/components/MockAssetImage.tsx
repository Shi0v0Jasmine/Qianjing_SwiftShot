import { useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { MOCK_ASSETS } from "../mocks/mockAssets";

type MockAssetImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  missingAlt?: string;
};

/** Shows a stable, semantic missing-media card instead of a random fallback. */
export const MockAssetImage = ({ missingAlt = "缺少素材", alt, src, onError, ...props }: MockAssetImageProps) => {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = failed ? MOCK_ASSETS.missing : src;
  const resolvedAlt = failed ? `${alt || "素材"}（${missingAlt}）` : alt || "Mock 素材";

  return (
    <img
      {...props}
      alt={resolvedAlt}
      src={resolvedSrc}
      onError={(event) => {
        if (!failed) {
          setFailed(true);
        }
        onError?.(event);
      }}
    />
  );
};

