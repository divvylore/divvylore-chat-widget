// connectionService.js
const API_BASE_URL = 'http://localhost:5001/account/connection';

export const connectionService = {
    async getConnections(tableState) {
        try {
            const response = await fetch(`${API_BASE_URL}/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tableState)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching connections:', error);
            throw error;
        }
    },

    async getConnection(connectionId) {
        try {
            const response = await fetch(`${API_BASE_URL}/entity?id=${connectionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching connection:', error);
            throw error;
        }
    },

    async createConnection(connectionData) {
        try {
            const response = await fetch(`${API_BASE_URL}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(connectionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating connection:', error);
            throw error;
        }
    },

    async updateConnection(connectionData) {
        try {
            const response = await fetch(`${API_BASE_URL}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(connectionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating connection:', error);
            throw error;
        }
    },

    async updateConnectionStatus(connectionId, isActive) {
        try {
            const response = await fetch(`${API_BASE_URL}/status/${connectionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isActive)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating connection status:', error);
            throw error;
        }
    },

    async deleteConnection(connectionId) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete/${connectionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting connection:', error);
            throw error;
        }
    },

    async getConnectionMetadata() {
        try {
            const response = await fetch(`${API_BASE_URL}/metadata`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching connection metadata:', error);
            throw error;
        }
    }
};
