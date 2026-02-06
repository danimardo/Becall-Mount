import { describe, it, expect } from 'vitest';
import { ConfProcessor } from '../../src/renderer/src/lib/conf-processor';
import { DomainInfo } from '../../src/contracts/types';

describe('ConfProcessor', () => {
  const mockInfo: DomainInfo = {
    SamAccountName: 'daniel.mardomingo',
    DisplayName: 'Daniel Mardomingo',
    EmailAddress: 'daniel@example.com',
    DistinguishedName: 'CN=Daniel,OU=Users,DC=example,DC=com',
    Department: 'IT',
    Title: 'Developer',
    MemberOf: ['Group1', 'Group2'],
    lastUpdated: new Date().toISOString()
  };

  it('should substitute simple variables', () => {
    const template = `user = %SamAccountName%\nname = %DisplayName%`;
    const result = ConfProcessor.process(template, mockInfo);
    
    expect(result).toContain('user = daniel.mardomingo');
    expect(result).toContain('name = Daniel Mardomingo');
  });

  it('should substitute non-existent variables with empty string', () => {
    const template = 'key = %NonExistent%';
    const result = ConfProcessor.process(template, mockInfo);
    
    expect(result).toBe('key = ');
  });

  it('should handle null info by removing all variables', () => {
    const template = 'user = %SamAccountName%';
    const result = ConfProcessor.process(template, null);
    
    expect(result).toBe('user = ');
  });

  it('should join arrays with commas', () => {
    const template = 'groups = %MemberOf%';
    const result = ConfProcessor.process(template, mockInfo);
    
    expect(result).toBe('groups = Group1,Group2');
  });
});