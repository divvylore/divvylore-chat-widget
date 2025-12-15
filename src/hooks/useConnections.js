// useConnections.js
import { useState, useEffect } from 'react';
import { connectionService } from '../services/connectionService';

export const useConnections = () => {
    const [state, setState] = useState({
        connections: [],
        loading: false,
        error: null
    });

    const actions = {
        loadConnections: async (tableState) => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            try {
                const data = await connectionService.getConnections(tableState);
                setState(prev => ({ 
                    ...prev, 
                    connections: data.items || [],
                    loading: false 
                }));
            } catch (error) {
                setState(prev => ({ 
                    ...prev, 
                    error: error.message,
                    loading: false 
                }));
            }
        },

        getConnection: async (connectionId) => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            try {
                const connection = await connectionService.getConnection(connectionId);
                setState(prev => ({ ...prev, loading: false }));
                return connection;
            } catch (error) {
                setState(prev => ({ 
                    ...prev, 
                    error: error.message,
                    loading: false 
                }));
                throw error;
            }
        },

        saveConnection: async (connectionData) => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            try {
                let result;
                if (connectionData.id) {
                    result = await connectionService.updateConnection(connectionData);
                } else {
                    result = await connectionService.createConnection(connectionData);
                }
                
                // Reload connections after save
                await actions.loadConnections({
                    page: 0,
                    size: 10,
                    sortBy: '',
                    sortDirection: 'asc',
                    filters: {}
                });
                
                setState(prev => ({ ...prev, loading: false }));
                return result;
            } catch (error) {
                setState(prev => ({ 
                    ...prev, 
                    error: error.message,
                    loading: false 
                }));
                throw error;
            }
        },

        updateConnectionStatus: async (connectionId, isActive) => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            try {
                await connectionService.updateConnectionStatus(connectionId, isActive);
                
                // Reload connections after status update
                await actions.loadConnections({
                    page: 0,
                    size: 10,
                    sortBy: '',
                    sortDirection: 'asc',
                    filters: {}
                });
                
                setState(prev => ({ ...prev, loading: false }));
            } catch (error) {
                setState(prev => ({ 
                    ...prev, 
                    error: error.message,
                    loading: false 
                }));
                throw error;
            }
        },

        deleteConnection: async (connectionId) => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            try {
                await connectionService.deleteConnection(connectionId);
                
                // Reload connections after delete
                await actions.loadConnections({
                    page: 0,
                    size: 10,
                    sortBy: '',
                    sortDirection: 'asc',
                    filters: {}
                });
                
                setState(prev => ({ ...prev, loading: false }));
            } catch (error) {
                setState(prev => ({ 
                    ...prev, 
                    error: error.message,
                    loading: false 
                }));
                throw error;
            }
        },

        clearError: () => {
            setState(prev => ({ ...prev, error: null }));
        }
    };

    return { ...state, actions };
};
