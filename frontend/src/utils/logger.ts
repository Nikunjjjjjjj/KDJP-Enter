import { LogLevel, LogEntry } from '@/types';

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 100; // Keep last 100 logs in memory

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with formatting
    const timestamp = logEntry.timestamp.toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    
    switch (level) {
      case 'info':
        console.log(`[INFO] ${timestamp} | ${message}${contextStr}`);
        break;
      case 'warn':
        console.warn(`[WARN] ${timestamp} | ${message}${contextStr}`);
        break;
      case 'error':
        console.error(`[ERROR] ${timestamp} | ${message}${contextStr}`);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[DEBUG] ${timestamp} | ${message}${contextStr}`);
        }
        break;
    }
  }

  // Public logging methods
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  // Cart-specific logging methods
  logCartAction(action: 'add' | 'remove' | 'update', bookId: string, quantity: number): void {
    this.info(`Cart ${action} action`, {
      action,
      bookId,
      quantity,
      timestamp: new Date().toISOString(),
    });
  }

  logCheckoutSubmission(orderId: string, totalPrice: number, itemCount: number): void {
    this.info('Checkout submitted', {
      orderId,
      totalPrice,
      itemCount,
      timestamp: new Date().toISOString(),
    });
  }

  logOrderConfirmation(orderId: string, customerEmail: string): void {
    this.info('Order confirmed', {
      orderId,
      customerEmail,
      timestamp: new Date().toISOString(),
    });
  }

  // Get logs for debugging (useful for development)
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger(); 