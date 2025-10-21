import { STATUS_LEGENDS, STATUS_LEGEND_VALUES, StatusLegendType } from '../constants/status-legends.constant';

export class StatusLegendUtil {
  /**
   * Check if a value is a valid status legend
   */
  static isValidStatusLegend(value: string): value is StatusLegendType {
    return STATUS_LEGEND_VALUES.includes(value as StatusLegendType);
  }

  /**
   * Get all status legend values
   */
  static getAllStatusLegends(): StatusLegendType[] {
    return STATUS_LEGEND_VALUES;
  }

  /**
   * Get status legend by key
   */
  static getStatusLegend(key: keyof typeof STATUS_LEGENDS): StatusLegendType {
    return STATUS_LEGENDS[key];
  }

  /**
   * Get default status legend
   */
  static getDefaultStatusLegend(): StatusLegendType {
    return STATUS_LEGENDS.PENDING_NEWLY_RECEIVED;
  }
} 