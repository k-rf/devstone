export interface TogglStartTimerRequest {
  readonly description: string;
  readonly workspace_id: number;
  readonly project_id?: number;
  readonly start: string;
  readonly duration: -1;
  readonly created_with: string;
}
