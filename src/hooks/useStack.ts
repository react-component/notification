import type { StackConfig } from '../interface';

const DEFAULT_OFFSET = 8;
const DEFAULT_THRESHOLD = 3;
const DEFAULT_GAP = 16;

type StackParams = Exclude<StackConfig, boolean>;

type UseStack = (config?: StackConfig) => [boolean, StackParams];

const useStack: UseStack = (config) => {
  const result: StackParams = {
    offset: DEFAULT_OFFSET,
    threshold: DEFAULT_THRESHOLD,
    gap: DEFAULT_GAP,
  };
  if (config && typeof config === 'object') {
    result.offset = config.offset ?? DEFAULT_OFFSET;
    result.threshold = config.threshold ?? DEFAULT_THRESHOLD;
    result.gap = config.gap ?? DEFAULT_GAP;
  }
  return [!!config, result];
};

export default useStack;
