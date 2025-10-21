export const STATUS_LEGENDS = {
  PENDING_NEWLY_RECEIVED: 'pending',
  OVERDUE: 'overdue',
  UPDATE_REQUIRED: 'update_required',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  TEMPORARY_APPROVED: 'temporary_approved',
  REJECTED: 'rejected'
} as const;

export const STATUS_LEGEND_VALUES = Object.values(STATUS_LEGENDS);

export type StatusLegendType = typeof STATUS_LEGENDS[keyof typeof STATUS_LEGENDS]; 