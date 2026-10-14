import { describe, expect, it } from "vitest";
import { checkGenerationChoice } from "./model-catalog";

const base = { hasVoice: false, hasSourceImage: true, durationSec: null, proMultiScene: false } as const;

describe("checkGenerationChoice (Chat v2)", () => {
  it("laisse passer quand aucune IA n'est choisie (routage actuel)", () => {
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: null }).ok).toBe(true);
  });
  it("refuse une IA sans son pour une vidéo parlée", () => {
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "seedance-2", hasVoice: true }).ok).toBe(false);
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "kling-3", hasVoice: true }).ok).toBe(false);
  });
  it("accepte veo-3.1 et happyhorse-1 pour une vidéo parlée", () => {
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "veo-3.1", hasVoice: true, durationSec: 8 }).ok).toBe(true);
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "happyhorse-1", hasVoice: true, durationSec: 12 }).ok).toBe(true);
  });
  it("refuse une durée que l'IA ne fait pas, sauf 16/24 s enchaînées", () => {
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "veo-3.1", durationSec: 12 }).ok).toBe(false);
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "veo-3.1", durationSec: 16 }).ok).toBe(true);
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "kling-3", durationSec: 8 }).ok).toBe(false);
  });
  it("refuse seedance-2 sans aucune photo", () => {
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "seedance-2", hasSourceImage: false }).ok).toBe(false);
  });
  it("refuse une IA vidéo pour une image et l'inverse", () => {
    expect(checkGenerationChoice({ ...base, mediaType: "image", generationModel: "veo-3.1" }).ok).toBe(false);
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "seedream-4.5" }).ok).toBe(false);
    expect(checkGenerationChoice({ ...base, mediaType: "carousel", generationModel: "nano-banana-2" }).ok).toBe(true);
  });
  it("ignore le choix en vidéo multi-scènes (modèle imposé)", () => {
    expect(checkGenerationChoice({ ...base, mediaType: "video", generationModel: "kling-3", hasVoice: true, proMultiScene: true }).ok).toBe(true);
  });
});
