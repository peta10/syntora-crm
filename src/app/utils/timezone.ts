/**
 * Central Time (Chicago) timezone utilities
 * Ensures all date operations respect Chicago timezone
 */

const CHICAGO_TIMEZONE = 'America/Chicago';

export class ChicagoTime {
  /**
   * Get current date in Chicago timezone as YYYY-MM-DD string
   */
  static getTodayString(): string {
    const now = new Date();
    const chicagoDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: CHICAGO_TIMEZONE
    }).format(now);
    
    console.log('Chicago Today:', {
      utc: now.toISOString(),
      chicago: chicagoDate,
      timezone: CHICAGO_TIMEZONE
    });
    
    return chicagoDate; // Returns YYYY-MM-DD format
  }

  /**
   * Get current time in Chicago timezone
   */
  static getNow(): Date {
    const now = new Date();
    const chicagoTime = new Date(now.toLocaleString('en-US', {
      timeZone: CHICAGO_TIMEZONE
    }));
    return chicagoTime;
  }

  /**
   * Format date string for display, respecting Chicago timezone
   */
  static formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const today = this.getTodayString();
      const tomorrow = this.getTomorrowString();
      
      if (dateString === today) {
        return 'Today';
      } else if (dateString === tomorrow) {
        return 'Tomorrow';
      } else {
        // Format as Mon DD
        return new Intl.DateTimeFormat('en-US', {
          timeZone: CHICAGO_TIMEZONE,
          month: 'short',
          day: 'numeric'
        }).format(date);
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  }

  /**
   * Get tomorrow's date in Chicago timezone as YYYY-MM-DD string
   */
  static getTomorrowString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: CHICAGO_TIMEZONE
    }).format(tomorrow);
  }

  /**
   * Check if two date strings represent the same day in Chicago timezone
   */
  static isSameDay(date1: string, date2: string): boolean {
    if (!date1 || !date2) return false;
    
    try {
      // Parse dates and compare in Chicago timezone
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      const chicago1 = new Intl.DateTimeFormat('en-CA', {
        timeZone: CHICAGO_TIMEZONE
      }).format(d1);
      
      const chicago2 = new Intl.DateTimeFormat('en-CA', {
        timeZone: CHICAGO_TIMEZONE
      }).format(d2);
      
      return chicago1 === chicago2;
    } catch (error) {
      console.error('Date comparison error:', error);
      return false;
    }
  }

  /**
   * Check if a date string is today in Chicago timezone
   */
  static isToday(dateString: string): boolean {
    return this.isSameDay(dateString, this.getTodayString());
  }

  /**
   * Convert any date to Chicago timezone ISO string
   */
  static toChicagoISO(date: Date = new Date()): string {
    return new Date(date.toLocaleString('en-US', {
      timeZone: CHICAGO_TIMEZONE
    })).toISOString();
  }

  /**
   * Get date input value for HTML date inputs (YYYY-MM-DD)
   */
  static getDateInputValue(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: CHICAGO_TIMEZONE
    }).format(date);
  }
}

export default ChicagoTime;
