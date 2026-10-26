// Icônes 3D Fluent Emoji (Microsoft, licence MIT) : src/assets/3d/
const files = import.meta.glob("@/assets/3d/*.png", { eager: true, import: "default" }) as Record<string, string>;

export const icon3d = (name: string): string => {
  const hit = Object.entries(files).find(([path]) => path.endsWith(`/${name}.png`));
  return hit ? hit[1] : "";
};

/** Icône et teinte de fond pour chaque secteur (clé = code secteur). */
export const sectorArt: Record<string, { icon: string; tint: string }> = {
  PV: { icon: "sun", tint: "bg-sun" },
  ITE: { icon: "house", tint: "bg-peach" },
  PAC: { icon: "thermometer", tint: "bg-rose" },
  RGA: { icon: "building_construction", tint: "bg-sky" },
  ISO: { icon: "office_building", tint: "bg-lilac" },
  DSE: { icon: "shower", tint: "bg-sky" },
  LDI: { icon: "light_bulb", tint: "bg-sun" },
  LDE: { icon: "flashlight", tint: "bg-mint" },
};

/** Icône associée au libellé de secteur des leads d'exemple. */
export const leadIcon = (sector: string) => {
  const s = sector.toLowerCase();
  if (s.includes("photo")) return icon3d("sun");
  if (s.includes("pompe")) return icon3d("thermometer");
  if (s.includes("isolation")) return icon3d("house");
  if (s.includes("douche")) return icon3d("shower");
  if (s.includes("led")) return icon3d("light_bulb");
  if (s.includes("rénovation")) return icon3d("building_construction");
  return icon3d("high_voltage");
};
