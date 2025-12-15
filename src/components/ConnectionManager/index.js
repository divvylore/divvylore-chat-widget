// ConnectionManager/index.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { 
    CloudIcon, 
    EditIcon, 
    DeleteIcon, 
    PlayArrowIcon, 
    PauseIcon,
    SecurityIcon 
} from '@mui/icons-material';
import { StandardTileView } from '../StandardComponents/StandardTileView';
import { StandardDataTable } from '../StandardComponents/StandardDataTable';
import { StandardStepperForm } from '../StandardComponents/StandardStepperForm';
import { useConnections } from '../../hooks/useConnections';
import { connectionFormConfig, authenticationTypes } from './connectionFormConfig';

const ConnectionManager = () => {
    const { connections, loading, error, actions } = useConnections();
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'tiles'
    const [formState, setFormState] = useState({
        open: false,
        mode: 'create', // 'create' or 'edit'
        initialData: null
    });

    // Load connections on component mount
    useEffect(() => {
        actions.loadConnections({
            page: 0,
            size: 10,
            sortBy: '',
            sortDirection: 'asc',
            filters: {}
        });
    }, []);

    // Table configuration following Credential Manager pattern
    const headers = ['Name', 'Type', 'Description', 'Authority', 'Status'];
    const dataKeys = ['name', 'authenticationType', 'description', 'authorityAddress', 'status'];

    const tableData = connections.map(connection => ({
        // Custom rendering for each column
        name: (
            <Box display="flex" alignItems="center">
                <CloudIcon style={{ marginRight: 8, fontSize: 16, color: '#666' }} />
                {connection.name}
            </Box>
        ),
        authenticationType: (
            <Chip 
                label={authenticationTypes.find(t => t.value === connection.authenticationType)?.label || connection.authenticationType} 
                size="small" 
                variant="outlined"
                style={{ backgroundColor: '#f5f5f5' }}
            />
        ),
        description: connection.description || '-',
        authorityAddress: (
            <Tooltip title={connection.authorityAddress || ''}>
                <Typography variant="body2" noWrap style={{ maxWidth: 200 }}>
                    {connection.authorityAddress || '-'}
                </Typography>
            </Tooltip>
        ),
        status: (() => {
            const status = connection.status;
            const isValidConfig = connection.isValidConfiguration;
            
            let label, backgroundColor, color;
            
            if (!isValidConfig) {
                // Red for invalid configuration
                label = 'Invalid Config';
                backgroundColor = '#ffebee';
                color = '#d32f2f';
            } else if (status) {
                // Green for active connections
                label = 'Active';
                backgroundColor = '#e8f5e8';
                color = '#2e7d32';
            } else {
                // Gray for inactive connections
                label = 'Inactive';
                backgroundColor = '#f5f5f5';
                color = '#616161';
            }
            
            return (
                <Chip
                    label={label}
                    size="small"
                    style={{
                        backgroundColor,
                        color,
                        fontWeight: 500,
                        border: `1px solid ${color}20`
                    }}
                />
            );
        })(),
        // Preserve original connection data for actions
        ...connection
    }));

    // Action handlers
    const handleCreate = () => {
        setFormState({
            open: true,
            mode: 'create',
            initialData: connectionFormConfig.initialData
        });
    };

    const handleEdit = (connection) => {
        setFormState({
            open: true,
            mode: 'edit',
            initialData: connection
        });
    };

    const handleDelete = async (connection) => {
        if (window.confirm(`Are you sure you want to delete connection "${connection.name}"?`)) {
            try {
                await actions.deleteConnection(connection.id);
            } catch (error) {
                console.error('Failed to delete connection:', error);
            }
        }
    };

    const handleToggleStatus = async (connection) => {
        try {
            await actions.updateConnectionStatus(connection.id, !connection.status);
        } catch (error) {
            console.error('Failed to update connection status:', error);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            await actions.saveConnection(formData);
            setFormState(prev => ({ ...prev, open: false }));
        } catch (error) {
            console.error('Failed to save connection:', error);
            throw error;
        }
    };

    const handleFormClose = () => {
        setFormState(prev => ({ ...prev, open: false }));
    };

    // Custom toolbar for connections
    const ConnectionToolbar = () => (
        <Box display="flex" gap={1}>
            <Tooltip title="Create Connection">
                <IconButton onClick={handleCreate} color="primary">
                    <SecurityIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

    // Connection card component for tile view
    const ConnectionCard = ({ connection }) => (
        <Box
            sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: 'white',
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box display="flex" alignItems="center">
                    <CloudIcon style={{ marginRight: 8, color: '#666' }} />
                    <Typography variant="h6" component="div">
                        {connection.name}
                    </Typography>
                </Box>
                <Box display="flex" gap={0.5}>
                    <IconButton size="small" onClick={() => handleEdit(connection)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleToggleStatus(connection)}>
                        {connection.status ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(connection)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" mb={2}>
                {connection.description || 'No description'}
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Chip
                    label={authenticationTypes.find(t => t.value === connection.authenticationType)?.label || connection.authenticationType}
                    size="small"
                    variant="outlined"
                />
                <Chip
                    label={connection.status ? 'Active' : 'Inactive'}
                    size="small"
                    color={connection.status ? 'success' : 'default'}
                />
            </Box>
        </Box>
    );

    return (
        <Box>
            {/* Error Display */}
            {error && (
                <Box mb={2} p={2} bgcolor="error.light" color="error.contrastText" borderRadius={1}>
                    <Typography variant="body2">{error}</Typography>
                </Box>
            )}

            {/* Tile View */}
            {viewMode === 'tiles' && (
                <StandardTileView
                    title="Connections"
                    data={connections}
                    onAdd={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    renderCard={ConnectionCard}
                    customToolbar={<ConnectionToolbar />}
                    loading={loading}
                />
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <StandardDataTable
                    title="Connections"
                    headers={headers}
                    dataKeys={dataKeys}
                    data={tableData}
                    loading={loading}
                    onAdd={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    customToolbar={<ConnectionToolbar />}
                    pagination={true}
                    sortable={true}
                    filterable={true}
                />
            )}

            {/* Connection Form Dialog */}
            <StandardStepperForm
                open={formState.open}
                config={connectionFormConfig}
                onSubmit={handleFormSubmit}
                onClose={handleFormClose}
                initialData={formState.initialData}
                title={formState.mode === 'create' ? 'Create Connection' : 'Edit Connection'}
            />
        </Box>
    );
};

export default ConnectionManager;
