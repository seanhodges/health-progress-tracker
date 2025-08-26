import { DomainError, ValidationError } from '../../../../backend/domain/errors/domainError';

describe('DomainError', () => {
  it('should create a domain error with message', () => {
    const error = new DomainError('Test domain error');
    
    expect(error.name).toBe('DomainError');
    expect(error.message).toBe('Test domain error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should capture stack trace when available', () => {
    const originalCaptureStackTrace = Error.captureStackTrace;
    const mockCaptureStackTrace = jest.fn();
    Error.captureStackTrace = mockCaptureStackTrace;

    new DomainError('Test error');

    expect(mockCaptureStackTrace).toHaveBeenCalledWith(expect.any(DomainError), DomainError);

    Error.captureStackTrace = originalCaptureStackTrace;
  });
});

describe('ValidationError', () => {
  it('should create a validation error with message', () => {
    const error = new ValidationError('Test validation error');
    
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Test validation error');
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });
});