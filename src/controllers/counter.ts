import { SequenceGenerator } from '@/utils/sequence';

export const getNextSequence = async (counterName: string, initial: number = 1) => {
  try {
    return await SequenceGenerator.getNextSequence(counterName, initial);
  } catch (error) {
    throw new Error('Failed to generate sequence');
  }
};

export const getCurrentSequence = async (counterName: string) => {
  try {
    return await SequenceGenerator.getCurrentSequence(counterName);
  } catch (error) {
    throw new Error('Failed to get current sequence');
  }
};

export const decrementSequence = async (counterName: string) => {
  try {
    return await SequenceGenerator.decrementSequence(counterName);
  } catch (error) {
    throw new Error('Failed to decrement sequence');
  }
};

export const resetSequence = async (counterName: string, value: number = 0) => {
  try {
    return await SequenceGenerator.resetSequence(counterName, value);
  } catch (error) {
    throw new Error('Failed to reset sequence');
  }
};

export const getNextSequenceWithPrefix = async (
  counterName: string,
  prefix: string = '',
  padding: number = 6,
  initial: number = 1
) => {
  if (!counterName) {
    throw new Error('Counter name is required');
  }

  try {
    const sequence = await SequenceGenerator.getNextSequenceWithPrefix(
      counterName,
      prefix,
      padding,
      initial
    );
    
    if (!sequence) {
      throw new Error(`Failed to generate sequence for counter: ${counterName}`);
    }
    
    return sequence;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate prefixed sequence';
    throw new Error(errorMessage);
  }
};
