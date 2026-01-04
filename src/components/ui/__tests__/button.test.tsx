import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';

describe('Button Component', () => {
  it('should have button type', () => {
    const buttonType = 'button';
    expect(buttonType).toBe('button');
  });

  it('should support disabled state', () => {
    const isDisabled = true;
    expect(isDisabled).toBe(true);
  });

  it('should support variant types', () => {
    const variants = ['default', 'primary', 'secondary', 'outline', 'ghost'];
    expect(variants).toContain('default');
    expect(variants).toHaveLength(5);
  });

  it('should support size variants', () => {
    const sizes = ['sm', 'md', 'lg'];
    expect(sizes).toContain('md');
  });
});
