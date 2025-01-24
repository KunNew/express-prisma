import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SequenceGenerator {
  private static padNumber(num: number, padding: number): string {
    return num.toString().padStart(padding, '0');
  }

  static async getNextSequence(
    counterName: string,
    initial: number = 0
  ): Promise<string> {
    if (!counterName) {
      throw new Error('Counter name is required');
    }
    
    try {
      const counter = await prisma.counter.upsert({
        where: { name: counterName },
        update: {
          config: {
            currentNumber: initial + 1,
            padding: 4,
          },
          sequence: this.padNumber(initial + 1, 4)
        },
        create: {
          name: counterName,
          sequence: this.padNumber(initial, 4),
          config: {
            currentNumber: initial,
            padding: 4,
            initialValue: this.padNumber(initial, 4)
          }
        },
      });

      return counter.sequence;
    } catch (error) {
      throw new Error(`Failed to generate sequence for counter ${counterName}: ${error}`);
    }
  }

  static async getNextSequenceWithPrefix(
    counterName: string,
    prefix: string = '',
    padding: number = 4,
    initial: number = 0
  ): Promise<string> {
    if (!counterName) {
      throw new Error('Counter name is required');
    }
    if (padding < 1) {
      throw new Error('Padding must be greater than 0');
    }
    
    try {
      const existingCounter = await prisma.counter.findUnique({ 
        where: { name: counterName } 
      });
      
      const nextNumber = existingCounter?.config?.currentNumber != null 
        ? existingCounter.config.currentNumber + 1 
        : initial + 1;

      const counter = await prisma.counter.upsert({
        where: { name: counterName },
        update: {
          config: {
            prefix: prefix,
            padding: padding,
            currentNumber: nextNumber
          },
          sequence: this.padNumber(nextNumber, padding)
        },
        create: {
          name: counterName,
          sequence: this.padNumber(initial, padding),
          config: {
            prefix,
            padding,
            initialValue: this.padNumber(initial, padding),
            currentNumber: initial
          }
        },
      });

      return `${counter.config?.prefix || ''}${counter.sequence}`;
    } catch (error) {
      throw new Error(`Failed to generate sequence with prefix for counter ${counterName}: ${error}`);
    }
  }

  static async getCurrentSequence(counterName: string): Promise<string> {
    const counter = await prisma.counter.findUnique({
      where: { name: counterName },
    });
    return counter?.sequence || '0000';
  }

  static async decrementSequence(counterName: string): Promise<string> {
    if (!counterName) {
      throw new Error('Counter name is required');
    }
    
    try {
      const existingCounter = await prisma.counter.findUnique({ 
        where: { name: counterName } 
      });
      
      if (!existingCounter) {
        throw new Error(`Counter ${counterName} not found`);
      }

      const nextNumber = existingCounter.config?.currentNumber != null 
        ? existingCounter.config.currentNumber - 1 
        : -1;

      const counter = await prisma.counter.update({
        where: { name: counterName },
        data: {
          config: {
            currentNumber: nextNumber
          },
          sequence: this.padNumber(nextNumber, 4)
        },
      });
      return counter.sequence;
    } catch (error) {
      throw new Error(`Failed to decrement sequence for counter ${counterName}: ${error}`);
    }
  }

  static async resetSequence(counterName: string, value: number = 0): Promise<string> {
    const paddedValue = this.padNumber(value, 4);
    const counter = await prisma.counter.update({
      where: { name: counterName },
      data: {
        sequence: paddedValue,
        config: {
          set: {
            currentNumber: value,
            initialValue: paddedValue
          }
        }
      },
    });
    return counter.sequence;
  }
}
