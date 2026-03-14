import type { ExecStagedUserConfig } from 'exec-staged/types';

const config: ExecStagedUserConfig = [
  {
    task: 'prettier --write --no-error-on-unmatched-pattern $FILES',
    glob: '*.{js,ts,json,md}',
  },
];

export default config;
