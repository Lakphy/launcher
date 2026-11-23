import type { RuntimeMode } from '@launcher/client';

export interface ComposerAccessMenuProps {
  mode: RuntimeMode;
  onApply: (mode: RuntimeMode) => void;
}
