/**
 * SmartValidation - Advanced email validation and contextual error handling
 * Provides intelligent suggestions and user-friendly error messages
 */

interface EmailValidationResult {
  isValid: boolean;
  message?: string;
  suggestion?: string;
}

interface DomainSuggestion {
  domain: string;
  score: number;
}

export class SmartValidation {
  // Common email domains for suggestions
  private commonDomains = [
    'gmail.com',
    'yahoo.com', 
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
    'mail.com',
    'live.com',
    'msn.com',
  ];

  // Common typos mapping
  private domainTypos = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.cmo': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmail.co': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outlook.co': 'outlook.com',
  };

  /**
   * Advanced email validation with domain suggestions
   */
  async validateEmailAdvanced(email: string): Promise<EmailValidationResult> {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return {
        isValid: false,
        message: 'Email address is required'
      };
    }

    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address'
      };
    }

    // Extract domain for validation
    const [localPart, domain] = email.split('@');
    
    if (!domain) {
      return {
        isValid: false,
        message: 'Please enter a complete email address'
      };
    }

    // Check for common typos
    const lowerDomain = domain.toLowerCase();
    const correctedDomain = lowerDomain in this.domainTypos ? this.domainTypos[lowerDomain as keyof typeof this.domainTypos] : null;
    if (correctedDomain) {
      return {
        isValid: false,
        message: 'Did you mean this email address?',
        suggestion: `${localPart}@${correctedDomain}`
      };
    }

    // Check for similar domains (fuzzy matching)
    const suggestion = this.suggestDomain(domain);
    if (suggestion && suggestion !== domain) {
      // Only suggest if the domains are very similar
      const similarity = this.calculateSimilarity(domain, suggestion);
      if (similarity > 0.7) {
        return {
          isValid: false,
          message: 'Did you mean this email address?',
          suggestion: `${localPart}@${suggestion}`
        };
      }
    }

    // Additional validation rules
    if (localPart.length > 64) {
      return {
        isValid: false,
        message: 'The email address is too long'
      };
    }

    if (domain.length > 253) {
      return {
        isValid: false,
        message: 'The email domain is too long'
      };
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      return {
        isValid: false,
        message: 'Email cannot contain consecutive dots'
      };
    }

    // Check for valid TLD
    if (!domain.includes('.') || domain.endsWith('.')) {
      return {
        isValid: false,
        message: 'Please enter a valid email domain'
      };
    }

    return { isValid: true };
  }

  /**
   * Mock function to check if email exists in the system
   * In a real app, this would make an API call
   */
  async checkEmailExists(email: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // For demo purposes, assume all emails exist
    // In production, this would check your user database
    return true;
  }

  /**
   * Generate contextual error messages based on error type and attempt count
   */
  getContextualError(error: any, attemptCount: number): string {
    const errorMessage = error?.message?.toLowerCase() || '';

    // Handle specific error types
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid email or password')) {
      if (attemptCount === 1) {
        return 'The email or password you entered is incorrect. Please try again.';
      } else if (attemptCount === 2) {
        return 'Still having trouble? Double-check your email and password.';
      } else {
        return 'Multiple failed attempts detected. Consider resetting your password for security.';
      }
    }

    if (errorMessage.includes('email not confirmed')) {
      return 'Please check your email and click the confirmation link we sent you.';
    }

    if (errorMessage.includes('too many requests')) {
      return 'Too many sign-in attempts. Please wait a few minutes and try again.';
    }

    if (errorMessage.includes('user not found')) {
      return 'No account found with this email. Would you like to sign up instead?';
    }

    if (errorMessage.includes('password')) {
      return 'The password you entered is incorrect. Please try again.';
    }

    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return 'Connection error. Please check your internet and try again.';
    }

    // Default contextual message based on attempt count
    if (attemptCount >= 3) {
      return 'Having trouble signing in? Try resetting your password or contact support.';
    }

    return error?.message || 'Sign in failed. Please try again.';
  }

  /**
   * Suggest the most similar domain from common domains
   */
  private suggestDomain(domain: string): string | null {
    let bestMatch: DomainSuggestion | null = null;

    for (const commonDomain of this.commonDomains) {
      const similarity = this.calculateSimilarity(domain.toLowerCase(), commonDomain);
      
      if (similarity > 0.6 && (!bestMatch || similarity > bestMatch.score)) {
        bestMatch = {
          domain: commonDomain,
          score: similarity
        };
      }
    }

    return bestMatch?.domain || null;
  }

  /**
   * Calculate Levenshtein distance-based similarity between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i - 1] + 1, // substitution
            matrix[j][i - 1] + 1,     // insertion
            matrix[j - 1][i] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Validate password strength with detailed feedback
   */
  validatePasswordStrength(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('Use at least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Include lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Include uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 20;
    } else {
      feedback.push('Include numbers');
    }

    if (/[^a-zA-Z\d]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Include special characters');
    }

    return {
      isStrong: score >= 80,
      score,
      feedback
    };
  }
}
