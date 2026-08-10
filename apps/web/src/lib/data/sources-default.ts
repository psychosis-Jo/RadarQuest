// 共享的"默认信源配置"：被 fetch.ts（Node 脚本）和 reset-sources API（Next.js）都引用
// 实际数据来自仓库根 data/sources.default.json
import defaults from '../../../../../data/sources.default.json';

export const SOURCES_DEFAULT: Record<string, {
  label: string;
  enabled: boolean;
  type: string;
  config: Record<string, any>;
  fetch_interval: string;
}> = defaults;
