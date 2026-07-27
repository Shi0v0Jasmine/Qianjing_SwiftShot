/**
 * Versioned mock media used by the demo workflow.
 * Keep semantic roles here so screens do not pick unrelated images ad hoc.
 */
export const MOCK_ASSETS = {
  avatar: "/mock-assets/avatar.svg",
  missing: "/mock-assets/missing-card.png",
  sample: {
    laptop: "/mock-assets/laptop-thumb.png",
    coffeePreview: "/mock-assets/coffee-preview.png",
    productDetail: "/mock-assets/product-detail.png",
    personDrinking: "/mock-assets/person-drinking.png",
    coffeeCover: "/mock-assets/coffee-cover.png",
    imageGenerationPanel: "/mock-assets/image-generation-panel.png"
  },
  canvas: {
    home: [
      "/mock-assets/home-canvas-1.png",
      "/mock-assets/home-canvas-2.png",
      "/mock-assets/home-canvas-3.png"
    ],
    gap: "/mock-assets/gap-canvas.png",
    legacy: "/mock-assets/legacy-frame.png"
  },
  preview: {
    cover: "/mock-assets/coffee-cover.png",
    frames: [
      "/mock-assets/coffee-preview.png",
      "/mock-assets/laptop-thumb.png",
      "/mock-assets/product-detail.png",
      "/mock-assets/person-drinking.png"
    ]
  }
} as const;

export const MOCK_KEYFRAMES = [
  MOCK_ASSETS.sample.laptop,
  MOCK_ASSETS.sample.coffeePreview,
  MOCK_ASSETS.sample.productDetail,
  MOCK_ASSETS.sample.personDrinking,
  MOCK_ASSETS.sample.coffeeCover,
  MOCK_ASSETS.sample.imageGenerationPanel
] as const;

export const MOCK_CANVAS_CARD_IMAGES = [
  MOCK_ASSETS.sample.laptop,
  MOCK_ASSETS.sample.productDetail,
  MOCK_ASSETS.sample.personDrinking
] as const;

export const MOCK_ASSET_PATHS = Object.freeze(
  Array.from(
    new Set([
      MOCK_ASSETS.avatar,
      MOCK_ASSETS.missing,
      ...MOCK_KEYFRAMES,
      ...MOCK_ASSETS.canvas.home,
      MOCK_ASSETS.canvas.gap,
      MOCK_ASSETS.canvas.legacy,
      MOCK_ASSETS.preview.cover,
      ...MOCK_ASSETS.preview.frames
    ])
  )
);

