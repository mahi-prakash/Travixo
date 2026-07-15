// src/services/api.js

/**
 * Centralized API Service for Travixo
 * Handles Logging, Error Tracking, and Rate Control Wrapper
 */

const DEBUG = true;

const logApi = (name, type, data) => {
    if (DEBUG) {
        const timestamp = new Date().toLocaleTimeString();
    }
};

const logError = (name, error) => {
    console.error(`%c[API ERROR] ${name} Failed:`, 'color: #ef4444; font-weight: bold;', error);
};

/**
 * safeApiCall
 * A wrapper to handle logging and global error catching
 */
export const safeApiCall = async (name, apiFn) => {
    logApi(name, 'START');
    try {
        const result = await apiFn();
        logApi(name, 'SUCCESS', result);
        return result;
    } catch (error) {
        logError(name, error);
        return null;
    }
};

// --- API DEFINITIONS ---

import { fetchPhoto as unsplashFetch } from '../utils/unsplash';
// Import other utils as they are moved here

export const api = {
    // Unsplash Integration
    unsplash: {
        fetchPhoto: async (query) => {
            return await safeApiCall(`Unsplash: ${query}`, () => unsplashFetch(query));
        }
    },

    // Trip Operations
    trips: {
        update: async (tripId, data, updateFn) => {
            return await safeApiCall(`Update Trip: ${tripId}`, () => updateFn(tripId, data));
        },
        create: async (payload, createFn) => {
            return await safeApiCall(`Create Trip: ${payload.destination}`, () => createFn(payload));
        }
    },

    // Planner specific
    planner: {
        saveItinerary: async (tripId, itinerary, updateFn) => {
            return await safeApiCall(`Save Itinerary: ${tripId}`, () => updateFn(tripId, { itinerary }));
        }
    }
};
