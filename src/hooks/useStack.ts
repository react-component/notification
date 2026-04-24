export interface StackConfig {
  threshold?: number;
  offset?: number;
}

const DEFAULT_OFFSET = 8;
const DEFAULT_THRESHOLD = 3;

type StackParams = Required<StackConfig>;

type UseStack = (config?: boolean | StackConfig) => [boolean, StackParams];

/**
 * Resolves the stack setting into an enabled flag and normalized stack params.
 */
const useStack: UseStack = (config) => {
  const result: StackParams = {
    offset: DEFAULT_OFFSET,
    threshold: DEFAULT_THRESHOLD,
  };

  if (config && typeof config === 'object') {
    result.offset = config.offset ?? DEFAULT_OFFSET;
    result.threshold = config.threshold ?? DEFAULT_THRESHOLD;
  }

  return [!!config, result];
};

export default useStack;
