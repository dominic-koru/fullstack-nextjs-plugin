/**
 * Entity Page Template
 *
 * Production-ready CRUD page template for MUI v6 with search and pagination.
 *
 * USAGE:
 * 1. Copy this file to your app directory
 * 2. Replace "Entity"/"Entities" with your entity name
 * 3. Update the table columns to match your schema
 * 4. Import your API functions and dialog component
 * 5. Update the TypeScript types to match your schema
 *
 * FEATURES:
 * - Server-side search with debouncing
 * - Pagination with items per page selector
 * - Create/Edit/Delete operations
 * - Loading and empty states
 * - Error handling
 * - Responsive design
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  TextField,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// TODO: Import your entity type
// import type { Entity } from '@/db/schema';

// TODO: Import your API functions
// import { fetchEntities, deleteEntity } from '@/lib/api/entities';

// TODO: Import your dialog component
// import { EntityDialog } from '@/components/entities/EntityDialog';

// TODO: Import Redux hooks if using Redux
// import { useAppDispatch } from '@/store/hooks';
// import { setEntities } from '@/store/slices/entitiesSlice';

// TODO: Update type to match your entity
interface Entity {
  id: string;
  name: string;
  createdAt: Date;
  // Add your fields here
}

export default function EntitiesPage() {
  // TODO: Uncomment if using Redux
  // const dispatch = useAppDispatch();

  // ==================== Data State ====================
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== Dialog State ====================
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // ==================== Delete Dialog State ====================
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null);

  // ==================== Search & Pagination State ====================
  const [searchInput, setSearchInput] = useState(''); // Immediate input value
  const [searchQuery, setSearchQuery] = useState(''); // Debounced value for API
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ==================== Load Data ====================
  const loadEntities = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with your actual API call
      // const result = await fetchEntities({ page, limit, search: searchQuery });
      // setEntities(result.data || []);
      // setTotalPages(result.pagination?.pages || 1);
      // setTotalItems(result.pagination?.total || 0);
      // dispatch(setEntities(result.data || [])); // If using Redux

      // Mock data for template
      console.log('Loading entities:', { page, limit, searchQuery });
      setEntities([]);
      setTotalPages(1);
      setTotalItems(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entities');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Debounce Search ====================
  // Debounce search input (300ms delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // ==================== Load on Mount & Dependencies ====================
  useEffect(() => {
    loadEntities();
  }, [page, limit, searchQuery]);

  // ==================== CRUD Handlers ====================
  const handleCreateClick = () => {
    setSelectedEntity(null);
    setDialogOpen(true);
  };

  const handleEditClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setDialogOpen(true);
  };

  const handleDeleteClick = (entity: Entity) => {
    setEntityToDelete(entity);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entityToDelete) return;

    try {
      // TODO: Replace with your actual API call
      // await deleteEntity(entityToDelete.id);
      console.log('Delete:', entityToDelete.id);

      setDeleteDialogOpen(false);
      setEntityToDelete(null);
      await loadEntities(); // Reload list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entity');
    }
  };

  const handleDialogSuccess = async () => {
    await loadEntities(); // Reload list after create/update
  };

  // ==================== Loading State ====================
  if (loading && entities.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography>Loading entities...</Typography>
        </Box>
      </Container>
    );
  }

  // ==================== Render ====================
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h1" component="h1">
            Entities
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
            Create Entity
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search entities..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
                {/* TODO: Add your columns */}
              </TableRow>
            </TableHead>
            <TableBody>
              {entities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchQuery
                        ? 'No entities found matching your search.'
                        : 'No entities yet. Create your first one!'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entities.map((entity) => (
                  <TableRow key={entity.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {entity.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(entity.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(entity)}
                        aria-label="edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(entity)}
                        aria-label="delete"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Showing {entities.length === 0 ? 0 : (page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, totalItems)} of {totalItems} items
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Items per page selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Items per page</InputLabel>
              <Select
                value={limit}
                label="Items per page"
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1); // Reset to first page when changing limit
                }}
              >
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>

            {/* Page selector */}
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>

        {/* Create/Edit Dialog */}
        {/* TODO: Uncomment and use your actual dialog component */}
        {/* <EntityDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleDialogSuccess}
          entity={selectedEntity}
        /> */}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Entity</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{entityToDelete?.name}"? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

/**
 * CHECKLIST:
 * [ ] Replaced "Entity"/"Entities" with actual entity name
 * [ ] Updated import statements (types, API functions, dialog)
 * [ ] Updated table columns to match schema
 * [ ] Implemented actual API calls
 * [ ] Uncommented dialog component
 * [ ] Tested create functionality
 * [ ] Tested edit functionality
 * [ ] Tested delete functionality
 * [ ] Tested search functionality
 * [ ] Tested pagination
 * [ ] Removed TODO comments
 */
