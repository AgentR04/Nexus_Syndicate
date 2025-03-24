import authService from '../services/authService';
import firestoreService from '../services/firestoreService';
import { User } from '../models/User';

// Create a custom event for resource updates
export const RESOURCE_UPDATE_EVENT = 'nexus-syndicate-resource-update';

// Helper to emit resource update event
const emitResourceUpdateEvent = (resources: User['resources']) => {
  // Create and dispatch a custom event that components can listen for
  const event = new CustomEvent(RESOURCE_UPDATE_EVENT, { 
    detail: { resources }
  });
  document.dispatchEvent(event);
  console.log('Resource update event emitted:', resources);
};

/**
 * Updates user credits in both local state and Firebase
 * @param amount The amount of credits to add (positive) or subtract (negative)
 * @returns Promise<boolean> indicating success or failure
 */
export const updateUserCredits = async (amount: number): Promise<boolean> => {
  const user = authService.getUser();
  if (!user || !user.id) {
    console.error('Cannot update credits: No authenticated user');
    return false;
  }

  // Get current resources or initialize if not present
  const currentResources = user.resources || {
    credits: 0,
    dataShards: 0,
    syntheticAlloys: 0,
    quantumCores: 0
  };

  // Calculate new credit amount
  const newCredits = (currentResources.credits || 0) + amount;
  
  // Don't allow negative credits
  if (newCredits < 0) {
    console.error('Cannot update credits: Would result in negative balance');
    return false;
  }

  // Update resources object
  const updatedResources = {
    ...currentResources,
    credits: newCredits
  };

  // Update in Firebase
  try {
    const success = await firestoreService.updateUserResources(user.id, updatedResources);
    
    if (success) {
      // Update local user object
      const updatedUser = {
        ...user,
        resources: updatedResources
      };
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the auth service's current user
      Object.assign(user, updatedUser);
      
      // Emit event for UI components to update
      emitResourceUpdateEvent(updatedResources);
      
      console.log('Credits updated successfully');
      return true;
    } else {
      console.error('Failed to update credits in Firebase');
      return false;
    }
  } catch (error) {
    console.error('Error updating credits:', error);
    return false;
  }
};

/**
 * Updates a specific user resource in both local state and Firebase
 * @param resourceType The type of resource to update
 * @param amount The amount to add (positive) or subtract (negative)
 * @returns Promise<boolean> indicating success or failure
 */
export const updateUserResource = async (
  resourceType: 'credits' | 'dataShards' | 'syntheticAlloys' | 'quantumCores',
  amount: number
): Promise<boolean> => {
  const user = authService.getUser();
  if (!user || !user.id) {
    console.error(`Cannot update ${resourceType}: No authenticated user`);
    return false;
  }

  // Get current resources or initialize if not present
  const currentResources = user.resources || {
    credits: 0,
    dataShards: 0,
    syntheticAlloys: 0,
    quantumCores: 0
  };

  // Calculate new resource amount
  const currentAmount = currentResources[resourceType] || 0;
  const newAmount = currentAmount + amount;
  
  // Don't allow negative resources
  if (newAmount < 0) {
    console.error(`Cannot update ${resourceType}: Would result in negative balance`);
    return false;
  }

  // Update resources object
  const updatedResources = {
    ...currentResources,
    [resourceType]: newAmount
  };

  // Update in Firebase
  try {
    const success = await firestoreService.updateUserResources(user.id, updatedResources);
    
    if (success) {
      // Update local user object
      const updatedUser = {
        ...user,
        resources: updatedResources
      };
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the auth service's current user
      Object.assign(user, updatedUser);
      
      // Emit event for UI components to update
      emitResourceUpdateEvent(updatedResources);
      
      console.log(`${resourceType} updated successfully`);
      return true;
    } else {
      console.error(`Failed to update ${resourceType} in Firebase`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${resourceType}:`, error);
    return false;
  }
};

/**
 * Updates multiple user resources after extraction
 * @param resources Object containing resource amounts to add
 * @returns Promise<boolean> indicating success or failure
 */
export const updateExtractedResources = async (
  resources: Record<string, number>
): Promise<boolean> => {
  const user = authService.getUser();
  if (!user || !user.id) {
    console.error('Cannot update extracted resources: No authenticated user');
    return false;
  }

  console.log('Updating extracted resources:', resources);

  // Get current resources or initialize if not present
  const currentResources = user.resources || {
    credits: 0,
    dataShards: 0,
    syntheticAlloys: 0,
    quantumCores: 0
  };

  // Create updated resources object with extracted resources added
  const updatedResources = { ...currentResources };
  
  // Update each resource
  Object.keys(resources).forEach(resource => {
    const resourceKey = resource as keyof typeof updatedResources;
    if (resourceKey in updatedResources) {
      updatedResources[resourceKey] = 
        (updatedResources[resourceKey] || 0) + (resources[resource] || 0);
    }
  });

  console.log('Current resources:', currentResources);
  console.log('Updated resources:', updatedResources);

  // Update in Firebase
  try {
    const success = await firestoreService.updateUserResources(user.id, updatedResources);
    
    if (success) {
      // Update local user object
      const updatedUser = {
        ...user,
        resources: updatedResources
      };
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the auth service's current user
      Object.assign(user, updatedUser);
      
      // Emit event for UI components to update
      emitResourceUpdateEvent(updatedResources);
      
      console.log('Resources updated successfully after extraction');
      return true;
    } else {
      console.error('Failed to update resources in Firebase after extraction');
      return false;
    }
  } catch (error) {
    console.error('Error updating resources after extraction:', error);
    return false;
  }
};
