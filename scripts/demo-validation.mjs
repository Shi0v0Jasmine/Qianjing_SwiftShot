const assets = new Set(["morning", "product", "pour", "scene"]);
const ids = new Set(["s1", "s2", "s3", "s4", "s5"]);
export function validateRenderInput(value) {
  if (
    !value ||
    typeof value.name !== "string" ||
    value.name.length > 40 ||
    !value.name.trim()
  )
    throw Error("项目名称须为 1–40 字。");
  if (
    !Array.isArray(value.shots) ||
    value.shots.length !== 5 ||
    new Set(value.shots.map((s) => s?.id)).size !== 5
  )
    throw Error("演示项目必须包含 5 个不同的分镜。");
  const shots = value.shots.map((s) => {
    if (!s || !ids.has(s.id)) throw Error("分镜编号无效。");
    if (!assets.has(s.asset))
      throw Error("请先补齐素材；导出仅使用演示素材库中的图片。");
    if (
      !Number.isFinite(s.duration) ||
      s.duration < 2 ||
      s.duration > 8 ||
      !Number.isInteger(s.duration * 2)
    )
      throw Error("每镜时长须为 2–8 秒，以 0.5 秒递增。");
    if (typeof s.caption !== "string" || s.caption.length > 80)
      throw Error("每镜字幕最多 80 字。");
    return {
      id: s.id,
      asset: s.asset,
      caption: s.caption,
      duration: s.duration,
      role: typeof s.role === "string" ? s.role.slice(0, 20) : "",
      title: typeof s.title === "string" ? s.title.slice(0, 40) : "",
      intent: "",
    };
  });
  return { name: value.name, shots };
}
