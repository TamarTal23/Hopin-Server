export type OnboardingStatus = 'pending' | 'generating' | 'ready' | 'failed';

export interface OnboardingStatusResponse {
  id: number;
  status: OnboardingStatus;
  failureReason: string | null;
}
