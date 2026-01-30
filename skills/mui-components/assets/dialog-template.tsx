/**
 * Entity Dialog Template
 *
 * Production-ready create/edit dialog template for MUI v6.
 *
 * USAGE:
 * 1. Copy this file to your components directory
 * 2. Replace "Entity" with your entity name (e.g., "User", "Product")
 * 3. Update the form fields to match your schema
 * 4. Import your API functions (createEntity, updateEntity)
 * 5. Update the TypeScript types to match your schema
 *
 * FEATURES:
 * - Create and edit modes in single dialog
 * - Form validation
 * - Loading states
 * - Error handling
 * - Auto-reset on open/close
 * - Keyboard accessibility (Enter to submit)
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';

// TODO: Import your entity type
// import type { Entity } from '@/db/schema';

// TODO: Import your API functions
// import { createEntity, updateEntity } from '@/lib/api/entities';

// TODO: Update type to match your entity
interface Entity {
  id: string;
  name: string;
  // Add your fields here
}

interface EntityDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entity?: Entity | null; // null/undefined = create mode, object = edit mode
}

export function EntityDialog({ open, onClose, onSuccess, entity }: EntityDialogProps) {
  // ==================== Form Fields ====================
  // TODO: Add state for all your form fields
  const [name, setName] = useState('');
  // Add more fields: const [email, setEmail] = useState('');

  // ==================== UI State ====================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== Derived State ====================
  const isEdit = !!entity;

  // ==================== Reset Form ====================
  // Reset form when dialog opens/closes or entity changes
  useEffect(() => {
    if (entity) {
      // Edit mode: populate from entity
      setName(entity.name);
      // TODO: Set other fields from entity
    } else {
      // Create mode: reset to empty
      setName('');
      // TODO: Reset other fields to empty
    }
    setError(null); // Clear errors
  }, [entity, open]);

  // ==================== Form Submission ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with your actual API calls
      if (isEdit) {
        // await updateEntity(entity.id, { name /* add other fields */ });
        console.log('Update:', { id: entity.id, name });
      } else {
        // await createEntity({ name /* add other fields */ });
        console.log('Create:', { name });
      }

      onSuccess(); // Parent reloads data
      onClose(); // Close dialog
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Render ====================
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit' : 'Create'} Entity</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Error Alert */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Name Field */}
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={loading}
              helperText="Enter entity name"
            />

            {/* TODO: Add more fields */}
            {/* Example:
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              disabled={loading}
            />
            */}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

/**
 * CHECKLIST:
 * [ ] Replaced "Entity" with actual entity name
 * [ ] Updated import statements (types, API functions)
 * [ ] Added all necessary form fields
 * [ ] Updated form validation
 * [ ] Tested create mode
 * [ ] Tested edit mode
 * [ ] Tested error handling
 * [ ] Tested loading states
 * [ ] Removed TODO comments
 */
