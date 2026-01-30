# Form & Dialog Patterns Reference

Comprehensive guide to building forms and dialogs with MUI v6 in this project.

## Table of Contents

1. [Dialog Basics](#dialog-basics)
2. [Create/Edit Dialog Pattern](#createedit-dialog-pattern)
3. [Form State Management](#form-state-management)
4. [Form Validation](#form-validation)
5. [Complex Forms (Relationships)](#complex-forms-relationships)
6. [Confirmation Dialogs](#confirmation-dialogs)
7. [Multi-Step Forms](#multi-step-forms)
8. [Form Best Practices](#form-best-practices)

## Dialog Basics

### Simple Dialog

```typescript
'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SimpleDialog({ open, onClose }: SimpleDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        Dialog content goes here
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
```

###Dialog Props

```typescript
// Size control
<Dialog maxWidth="xs">Tiny dialog (444px)</Dialog>
<Dialog maxWidth="sm">Small dialog (600px)</Dialog>
<Dialog maxWidth="md">Medium dialog (900px)</Dialog>
<Dialog maxWidth="lg">Large dialog (1200px)</Dialog>
<Dialog maxWidth="xl">Extra large dialog (1536px)</Dialog>
<Dialog maxWidth={false}>No max width constraint</Dialog>

// Full width (within maxWidth constraint)
<Dialog fullWidth maxWidth="md">Responsive dialog</Dialog>

// Full screen (mobile-friendly)
<Dialog fullScreen>Full screen on all devices</Dialog>

// Disable backdrop click close
<Dialog disableEscapeKeyDown onClose={onClose}>
  Can only close via button
</Dialog>
```

## Create/Edit Dialog Pattern

### Standard Implementation

This is the pattern used in `OrganisationDialog.tsx` and `UserDialog.tsx`:

```typescript
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
import { createEntity, updateEntity } from '@/lib/api/entities';
import type { Entity } from '@/db/schema';

interface EntityDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entity?: Entity | null; // null/undefined = create mode, object = edit mode
}

export function EntityDialog({ open, onClose, onSuccess, entity }: EntityDialogProps) {
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine mode
  const isEdit = !!entity;

  // Reset form when dialog opens/closes or entity changes
  useEffect(() => {
    if (entity) {
      // Edit mode: populate from entity
      setName(entity.name);
      setEmail(entity.email || '');
    } else {
      // Create mode: reset to empty
      setName('');
      setEmail('');
    }
    setError(null); // Clear errors
  }, [entity, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await updateEntity(entity.id, { name, email });
      } else {
        await createEntity({ name, email });
      }

      onSuccess(); // Parent reloads data
      onClose();   // Close dialog
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit' : 'Create'} Entity</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={loading}
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              disabled={loading}
            />
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
```

**Critical Pattern Elements**:

1. **Props**: `open`, `onClose`, `onSuccess`, `entity?` (optional for edit)
2. **Mode detection**: `const isEdit = !!entity`
3. **Form state**: Separate useState for each field
4. **UI state**: `loading`, `error`
5. **Reset effect**: useEffect with `[entity, open]` dependencies
6. **Form wrapper**: `<form onSubmit={handleSubmit}>`
7. **Loading states**: Disable inputs and show "Saving..."
8. **Error display**: Alert component above form
9. **Callbacks**: `onSuccess()` then `onClose()`

## Form State Management

### Single Field

```typescript
const [name, setName] = useState('');

<TextField
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### Multiple Fields (Object)

```typescript
interface FormData {
  name: string;
  email: string;
  age: number;
}

const [formData, setFormData] = useState<FormData>({
  name: '',
  email: '',
  age: 0,
});

const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [field]: e.target.value,
  }));
};

<TextField value={formData.name} onChange={handleChange('name')} />
<TextField value={formData.email} onChange={handleChange('email')} />
```

### Checkbox/Switch

```typescript
const [accepted, setAccepted] = useState(false);

<Checkbox
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
/>

<Switch
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
/>
```

### Select

```typescript
const [role, setRole] = useState<Role>('member');

<FormControl fullWidth>
  <InputLabel>Role</InputLabel>
  <Select
    value={role}
    label="Role"
    onChange={(e) => setRole(e.target.value as Role)}
  >
    <MenuItem value="owner">Owner</MenuItem>
    <MenuItem value="admin">Admin</MenuItem>
    <MenuItem value="member">Member</MenuItem>
  </Select>
</FormControl>
```

### Autocomplete (Single)

```typescript
const [selectedUser, setSelectedUser] = useState<User | null>(null);

<Autocomplete
  options={allUsers}
  value={selectedUser}
  onChange={(_, user) => setSelectedUser(user)}
  getOptionLabel={(user) => user.name}
  renderInput={(params) => <TextField {...params} label="User" />}
/>
```

### Autocomplete (Multiple)

```typescript
const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

<Autocomplete
  multiple
  options={allUsers}
  value={selectedUsers}
  onChange={(_, users) => setSelectedUsers(users)}
  getOptionLabel={(user) => `${user.name} (${user.email})`}
  renderInput={(params) => <TextField {...params} label="Users" />}
/>
```

## Form Validation

### Client-Side Validation (HTML5)

```typescript
<TextField
  label="Email"
  type="email"         // Built-in email validation
  required             // Required field
  inputProps={{
    minLength: 3,      // Minimum length
    maxLength: 255,    // Maximum length
    pattern: '[a-z]+', // Regex pattern
  }}
/>
```

### Custom Validation State

```typescript
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState<string | null>(null);

const validateEmail = (value: string) => {
  if (!value) {
    setEmailError('Email is required');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setEmailError('Invalid email format');
    return false;
  }
  setEmailError(null);
  return true;
};

<TextField
  label="Email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  }}
  error={!!emailError}
  helperText={emailError || 'Enter your email address'}
/>
```

### Validation on Submit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate all fields
  const isEmailValid = validateEmail(email);
  const isNameValid = validateName(name);

  if (!isEmailValid || !isNameValid) {
    setError('Please fix the errors above');
    return;
  }

  // Proceed with submission
  setLoading(true);
  try {
    await createEntity({ name, email });
    onSuccess();
    onClose();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Using Zod for Validation

```typescript
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof formSchema>;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const result = formSchema.safeParse({ name, email });

  if (!result.success) {
    // Extract first error message
    const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0];
    setError(firstError || 'Validation failed');
    return;
  }

  // result.data is typed as FormData
  await createEntity(result.data);
};
```

## Complex Forms (Relationships)

### Managing Related Entities

Pattern from `OrganisationDialog.tsx`:

```typescript
interface UserToAdd {
  user: User;
  role: Role;
}

export function OrganisationDialog({ entity }: DialogProps) {
  // Fetch available users
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Current members (edit mode only)
  const [currentMembers, setCurrentMembers] = useState<OrganisationUser[]>([]);

  // New members to add
  const [usersToAdd, setUsersToAdd] = useState<UserToAdd[]>([]);

  // Members to remove (edit mode)
  const [membersToRemove, setMembersToRemove] = useState<Set<string>>(new Set());

  // Role changes for existing members
  const [roleChanges, setRoleChanges] = useState<Map<string, Role>>(new Map());

  // Load users on open
  useEffect(() => {
    if (open) {
      loadUsers();
      if (isEdit) {
        loadCurrentMembers();
      }
    }
  }, [open, isEdit]);

  // Filter out already assigned/added users
  const getAvailableUsers = () => {
    const assignedIds = new Set(currentMembers.map(m => m.userId));
    const toAddIds = new Set(usersToAdd.map(u => u.user.id));
    return allUsers.filter(u => !assignedIds.has(u.id) && !toAddIds.has(u.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create/update main entity
      const entityId = isEdit
        ? entity.id
        : (await createEntity({ name })).id;

      // 2. Remove members (edit mode)
      for (const userId of membersToRemove) {
        await removeUserFromOrganisation(entityId, userId);
      }

      // 3. Update roles (edit mode)
      for (const [userId, role] of roleChanges) {
        if (!membersToRemove.has(userId)) {
          await updateRole(entityId, userId, role);
        }
      }

      // 4. Add new members
      for (const { user, role } of usersToAdd) {
        await addUserToOrganisation(entityId, user.id, role);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Main entity fields */}
            <TextField label="Name" value={name} onChange={e => setName(e.target.value)} />

            <Divider sx={{ my: 1 }} />

            {/* Current members (edit mode) */}
            {isEdit && currentMembers.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Current Members
                </Typography>
                <List dense>
                  {currentMembers.map(member => (
                    <ListItem
                      key={member.userId}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <RoleSelector
                            value={getCurrentRole(member.userId)}
                            onChange={role => handleRoleChange(member.userId, role)}
                          />
                          <IconButton onClick={() => handleRemove(member.userId)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText primary={member.user.name} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Add new members */}
            <Autocomplete
              multiple
              options={getAvailableUsers()}
              value={usersToAdd.map(u => u.user)}
              onChange={(_, users) => setUsersToAdd(users.map(u => ({ user: u, role: 'member' })))}
              getOptionLabel={u => `${u.name} (${u.email})`}
              renderInput={params => <TextField {...params} label="Add Members" />}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

**Key Patterns for Relationships**:

1. **Separate state** for current/add/remove/changes
2. **Filter available options** to prevent duplicates
3. **Sequential operations** in handleSubmit (create/update entity, then relationships)
4. **List display** with role selectors and remove buttons
5. **Undo functionality** for better UX

## Confirmation Dialogs

### Delete Confirmation

Pattern from `organisations/page.tsx`:

```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null);

const handleDeleteClick = (entity: Entity) => {
  setEntityToDelete(entity);
  setDeleteDialogOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!entityToDelete) return;

  try {
    await deleteEntity(entityToDelete.id);
    setDeleteDialogOpen(false);
    setEntityToDelete(null);
    await loadEntities(); // Reload list
  } catch (err) {
    setError(err.message);
  }
};

<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
  <DialogTitle>Delete Entity</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete "{entityToDelete?.name}"?
      This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
      Delete
    </Button>
  </DialogActions>
</Dialog>
```

## Multi-Step Forms

### Stepper Pattern

```typescript
import { useState } from 'react';
import { Stepper, Step, StepLabel, Box, Button } from '@mui/material';

const steps = ['Basic Info', 'Details', 'Review'];

export function MultiStepDialog({ open, onClose }: DialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    details: '',
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    await createEntity(formData);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Entity</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </Box>
        )}

        {activeStep === 1 && (
          <TextField
            label="Details"
            multiline
            rows={4}
            value={formData.details}
            onChange={e => setFormData(prev => ({ ...prev, details: e.target.value }))}
          />
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6">Review</Typography>
            <Typography>Name: {formData.name}</Typography>
            <Typography>Email: {formData.email}</Typography>
            <Typography>Details: {formData.details}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

## Form Best Practices

1. **Always wrap in `<form>` with `onSubmit`** - Enables Enter key submission
2. **Reset state on dialog open/close** - Use useEffect with `[entity, open]`
3. **Show loading state** - Disable inputs and buttons while saving
4. **Display errors** - Alert component above form
5. **Use autoFocus on first field** - Better UX
6. **Validate before submit** - Client-side + server-side
7. **Type button correctly** - `type="submit"` vs `type="button"`
8. **Clear errors on retry** - Reset error state before new submission
9. **Handle async errors** - Try/catch around API calls
10. **Close on success** - Call `onSuccess()` then `onClose()`
11. **Disable close during save** - Prevent closing mid-operation
12. **Use fullWidth on TextFields** - Consistent width
13. **Gap between fields** - `gap: 2` in container
14. **Margin top on DialogContent** - `mt: 1` for spacing
