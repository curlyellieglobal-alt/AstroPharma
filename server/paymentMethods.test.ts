import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Payment Methods Management', () => {
  describe('getAllPaymentMethods', () => {
    it('should return an array of payment methods', async () => {
      const methods = await db.getAllPaymentMethods();
      expect(Array.isArray(methods)).toBe(true);
    });

    it('should return payment methods ordered by displayOrder', async () => {
      const methods = await db.getAllPaymentMethods();
      if (methods.length > 1) {
        for (let i = 0; i < methods.length - 1; i++) {
          expect((methods[i] as any).displayOrder).toBeLessThanOrEqual((methods[i + 1] as any).displayOrder);
        }
      }
    });
  });

  describe('getVisiblePaymentMethods', () => {
    it('should return only visible payment methods', async () => {
      const methods = await db.getVisiblePaymentMethods();
      expect(Array.isArray(methods)).toBe(true);
      
      methods.forEach(method => {
        expect((method as any).isVisible).toBe(true);
      });
    });

    it('should return visible methods ordered by displayOrder', async () => {
      const methods = await db.getVisiblePaymentMethods();
      if (methods.length > 1) {
        for (let i = 0; i < methods.length - 1; i++) {
          expect((methods[i] as any).displayOrder).toBeLessThanOrEqual((methods[i + 1] as any).displayOrder);
        }
      }
    });
  });

  describe('getPaymentMethodByProvider', () => {
    it('should return undefined for non-existent provider', async () => {
      const method = await db.getPaymentMethodByProvider('non_existent_provider_xyz');
      expect(method).toBeUndefined();
    });

    it('should return payment method for valid provider', async () => {
      // First initialize default methods
      await db.initializeDefaultPaymentMethods();
      
      const method = await db.getPaymentMethodByProvider('stripe');
      if (method) {
        expect((method as any).provider).toBe('stripe');
        expect((method as any).displayName).toBeDefined();
      }
    });
  });

  describe('updatePaymentMethodVisibility', () => {
    it('should update visibility status', async () => {
      await db.initializeDefaultPaymentMethods();
      
      const provider = 'stripe';
      const initialMethod = await db.getPaymentMethodByProvider(provider);
      
      if (initialMethod) {
        const initialVisibility = (initialMethod as any).isVisible;
        
        // Toggle visibility
        await db.updatePaymentMethodVisibility(provider, !initialVisibility);
        
        const updatedMethod = await db.getPaymentMethodByProvider(provider);
        expect((updatedMethod as any)?.isVisible).toBe(!initialVisibility);
        
        // Toggle back
        await db.updatePaymentMethodVisibility(provider, initialVisibility);
        
        const restoredMethod = await db.getPaymentMethodByProvider(provider);
        expect((restoredMethod as any)?.isVisible).toBe(initialVisibility);
      }
    });
  });

  describe('updatePaymentMethod', () => {
    it('should update payment method details', async () => {
      await db.initializeDefaultPaymentMethods();
      
      const provider = 'fawry';
      const originalMethod = await db.getPaymentMethodByProvider(provider);
      
      if (originalMethod) {
        const newDisplayName = 'Updated Fawry Payment';
        const newDescription = 'Updated description for testing';
        
        await db.updatePaymentMethod(provider, {
          displayName: newDisplayName,
          description: newDescription,
        });
        
        const updatedMethod = await db.getPaymentMethodByProvider(provider);
        expect((updatedMethod as any)?.displayName).toBe(newDisplayName);
        expect((updatedMethod as any)?.description).toBe(newDescription);
        
        // Restore original
        await db.updatePaymentMethod(provider, {
          displayName: (originalMethod as any).displayName,
          description: (originalMethod as any).description,
        });
      }
    });

    it('should update displayOrder', async () => {
      await db.initializeDefaultPaymentMethods();
      
      const provider = 'payoneer';
      const originalMethod = await db.getPaymentMethodByProvider(provider);
      
      if (originalMethod) {
        const newOrder = 99;
        
        await db.updatePaymentMethod(provider, {
          displayOrder: newOrder,
        });
        
        const updatedMethod = await db.getPaymentMethodByProvider(provider);
        expect((updatedMethod as any)?.displayOrder).toBe(newOrder);
        
        // Restore original
        await db.updatePaymentMethod(provider, {
          displayOrder: (originalMethod as any).displayOrder,
        });
      }
    });
  });

  describe('initializeDefaultPaymentMethods', () => {
    it('should initialize default payment methods without errors', async () => {
      expect(async () => {
        await db.initializeDefaultPaymentMethods();
      }).not.toThrow();
    });

    it('should create all default payment methods', async () => {
      await db.initializeDefaultPaymentMethods();
      
      const expectedProviders = [
        'stripe',
        'fawry',
        'payoneer',
        'cod',
        'instapay',
        'vodafone_cash',
      ];
      
      for (const provider of expectedProviders) {
        const method = await db.getPaymentMethodByProvider(provider);
        expect(method).toBeDefined();
        expect((method as any)?.provider).toBe(provider);
      }
    });
  });

  describe('Payment Methods Visibility Workflow', () => {
    it('should allow hiding and showing payment methods', async () => {
      await db.initializeDefaultPaymentMethods();
      
      const provider = 'cod';
      
      // Get initial state
      const initialMethod = await db.getPaymentMethodByProvider(provider);
      const initialVisibility = (initialMethod as any)?.isVisible ?? true;
      
      // Hide the method
      await db.updatePaymentMethodVisibility(provider, false);
      let method = await db.getPaymentMethodByProvider(provider);
      expect((method as any)?.isVisible).toBe(false);
      
      // Verify it doesn't appear in visible methods
      let visibleMethods = await db.getVisiblePaymentMethods();
      expect(visibleMethods.find(m => (m as any).provider === provider)).toBeUndefined();
      
      // Show the method
      await db.updatePaymentMethodVisibility(provider, true);
      method = await db.getPaymentMethodByProvider(provider);
      expect((method as any)?.isVisible).toBe(true);
      
      // Verify it appears in visible methods
      visibleMethods = await db.getVisiblePaymentMethods();
      expect(visibleMethods.find(m => (m as any).provider === provider)).toBeDefined();
      
      // Restore initial state
      await db.updatePaymentMethodVisibility(provider, initialVisibility);
    });

    it('should maintain payment method order when toggling visibility', async () => {
      await db.initializeDefaultPaymentMethods();
      
      const allMethods = await db.getAllPaymentMethods();
      const initialOrder = allMethods.map(m => (m as any).provider);
      
      // Toggle visibility of a method
      if (allMethods.length > 0) {
        const provider = (allMethods[0] as any).provider;
        const currentVisibility = (allMethods[0] as any).isVisible;
        
        await db.updatePaymentMethodVisibility(provider, !currentVisibility);
        
        const updatedMethods = await db.getAllPaymentMethods();
        const updatedOrder = updatedMethods.map(m => (m as any).provider);
        
        expect(updatedOrder).toEqual(initialOrder);
        
        // Restore
        await db.updatePaymentMethodVisibility(provider, currentVisibility);
      }
    });
  });
});
