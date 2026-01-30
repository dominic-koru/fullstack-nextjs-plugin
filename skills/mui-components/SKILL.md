# MUI Components Skill (v6)

This skill provides comprehensive patterns for building Material UI v6 components in this Next.js 16 project.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Internationalization (i18n)](#internationalization-i18n)
3. [Theme Integration](#theme-integration)
4. [Dialog Patterns (Forms)](#dialog-patterns-forms)
5. [Page Patterns (Tables & CRUD)](#page-patterns-tables--crud)
6. [Form Components](#form-components)
7. [Shared Components](#shared-components)
8. [Common Pitfalls](#common-pitfalls)
9. [Quick Reference](#quick-reference)

## Core Principles

### MUI v6 Specifics

- **CSS Variables**: This project uses `cssVariables: true` in theme configuration
- **Color Schemes**: Built-in light/dark mode support via `colorSchemes`
- **TypeScript**: All components use strict TypeScript with proper MUI type imports
- **'use client'**: All interactive MUI components must be client components
- **i18n REQUIRED**: ALL user-facing strings must use `useTranslation` hook (NEVER hardcode strings)

### Component Structure

```typescript
'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // REQUIRED for i18n
import { Button, Box } from '@mui/material'; // Named imports
import type { SomeType } from '@/types'; // Type imports separate

export function MyComponent({ prop }: MyComponentProps) {
  const { t } = useTranslation(['feature', 'common']); // Load namespaces
  const [state, setState] = useState('');

  return (
    <Box sx={{ p: 2 }}> {/* Use sx prop for styling */}
      <Button variant="contained">{t('common:actions.save')}</Button>
    </Box>
  );
}
```

**Key Patterns**:

- **ALWAYS import and use `useTranslation`** - NEVER hardcode strings
- Always use named imports from `@mui/material`
- Use `sx` prop for styling (supports theme values)
- Separate type imports from component imports
- Use TypeScript interfaces for props

## Internationalization (i18n)

**CRITICAL**: ALL user-facing strings MUST be translated using react-i18next. NEVER use hardcoded strings.

### Basic Usage

```typescript
'use client';

import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

export function MyComponent() {
  const { t } = useTranslation(['organisations', 'common']);

  return (
    <Typography>{t('organisations:title')}</Typography>
  );
}
```

### Common Translation Patterns

#### Buttons and Actions

```typescript
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Simple button
<Button>{t('common:actions.create')}</Button>

// With loading state
<Button disabled={loading}>
  {loading ? t('common:actions.saving') : t('common:actions.save')}
</Button>

// Dialog actions
<DialogActions>
  <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
  <Button type="submit">{t('common:actions.save')}</Button>
</DialogActions>
```

#### Form Fields

```typescript
<TextField
  label={t('organisations:fields.name')}
  placeholder={t('organisations:placeholders.name')}
  helperText={t('organisations:messages.slugHelperText')}
/>

<FormControl>
  <InputLabel>{t('common:labels.role')}</InputLabel>
  <Select value={role} label={t('common:labels.role')}>
    <MenuItem value="owner">{t('common:roles.owner')}</MenuItem>
    <MenuItem value="admin">{t('common:roles.admin')}</MenuItem>
    <MenuItem value="member">{t('common:roles.member')}</MenuItem>
  </Select>
</FormControl>
```

#### Table Headers

```typescript
<TableHead>
  <TableRow>
    <TableCell>{t('common:labels.name')}</TableCell>
    <TableCell>{t('common:labels.email')}</TableCell>
    <TableCell align="right">{t('common:labels.actions')}</TableCell>
  </TableRow>
</TableHead>
```

#### Empty States

```typescript
{items.length === 0 && (
  <Typography color="text.secondary">
    {searchQuery
      ? t('organisations:messages.noSearchResults')
      : t('organisations:messages.noOrganisations')}
  </Typography>
)}
```

#### Interpolation (Dynamic Values)

```typescript
// With variables
<Typography>
  {t('common:pagination.showing', {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, total),
    total: total,
  })}
</Typography>

// In confirmation dialogs
<DialogContentText>
  {t('organisations:messages.deleteConfirm', { name: entity.name })}
</DialogContentText>

// With count
<Typography>
  {t('organisations:fields.currentMembers', { count: members.length })}
</Typography>
```

#### Dialog Titles

```typescript
<DialogTitle>
  {isEdit ? t('organisations:edit') : t('organisations:create')}
</DialogTitle>
```

### Adding New Translations

When creating new components:

1. **Add translation keys FIRST** to `src/lib/i18n/locales/en/[feature].json`:

```json
{
  "title": "My Feature",
  "create": "Create Item",
  "fields": {
    "name": "Item Name"
  },
  "messages": {
    "noItems": "No items yet",
    "deleteConfirm": "Delete \"{{name}}\"?"
  }
}
```

2. **Import namespace** in i18n config (`src/lib/i18n/config.ts`)
3. **Use in component** with `useTranslation(['myFeature', 'common'])`

### Type Safety

TypeScript will check translation keys:

```typescript
// ✅ Valid
t('common:actions.create');

// ❌ Invalid - TypeScript error
t('common:actions.doesNotExist');
```

## Theme Integration

### Accessing Theme Values

```typescript
import { Box, Typography, useTheme } from '@mui/material';

export function ThemedComponent() {
  const theme = useTheme();

  return (
    <Box sx={{
      bgcolor: 'background.default', // Theme color
      color: 'text.primary',          // Theme text color
      p: 2,                           // Theme spacing (2 * 8px = 16px)
      borderRadius: 1,                // Theme shape.borderRadius
    }}>
      <Typography variant="h1">Themed Content</Typography>
    </Box>
  );
}
```

### Common Theme Values

```typescript
// Spacing (multiplied by 8px)
sx={{ p: 2 }}           // padding: 16px
sx={{ m: 3 }}           // margin: 24px
sx={{ mt: 1 }}          // margin-top: 8px
sx={{ gap: 2 }}         // gap: 16px

// Colors (automatic light/dark mode)
sx={{ bgcolor: 'background.paper' }}
sx={{ color: 'text.primary' }}
sx={{ color: 'text.secondary' }}
sx={{ color: 'primary.main' }}
sx={{ color: 'error.main' }}

// Layout
sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}

// Border Radius (from theme.shape.borderRadius)
sx={{ borderRadius: 1 }}  // Uses theme borderRadius (8px in this project)
```

> **Theme Reference**: See `references/theme-patterns.md` for comprehensive theme usage patterns.

## Dialog Patterns (Forms)

### Create/Edit Dialog Pattern

The standard pattern for CRUD dialogs (used in OrganisationDialog, UserDialog):

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

interface EntityDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entity?: Entity | null; // null/undefined = create, object = edit
}

export function EntityDialog({ open, onClose, onSuccess, entity }: EntityDialogProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!entity;

  // Reset form when dialog opens/closes or entity changes
  useEffect(() => {
    if (entity) {
      setName(entity.name);
    } else {
      setName('');
    }
    setError(null);
  }, [entity, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await updateEntity(entity.id, { name });
      } else {
        await createEntity({ name });
      }
      onSuccess(); // Parent reloads data
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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

**Critical Dialog Patterns**:

1. **Props interface**: `open`, `onClose`, `onSuccess`, `entity?` (optional for edit)
2. **isEdit detection**: `const isEdit = !!entity`
3. **Form reset**: useEffect with `[entity, open]` dependencies
4. **Error handling**: Local error state with Alert component
5. **Loading state**: Disable inputs and buttons while saving
6. **Form submission**: Wrap in `<form onSubmit={handleSubmit}>`
7. **onSuccess callback**: Parent reloads data, dialog doesn't manage parent state

> **Dialog Reference**: See `references/form-patterns.md` for advanced dialog patterns including multi-step forms, autocomplete, and relationship management.

## Page Patterns (Tables & CRUD)

### Standard CRUD Page Pattern

```typescript
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { EntityDialog } from '@/components/entities/EntityDialog';
import { fetchEntities, deleteEntity } from '@/lib/api/entities';

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Search and pagination
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  const loadEntities = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchEntities({ page, limit, search: searchQuery });
      setEntities(result.data || []);
      setTotalPages(result.pagination?.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search (300ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset to first page
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    loadEntities();
  }, [page, limit, searchQuery]);

  const handleCreateClick = () => {
    setSelectedEntity(null);
    setDialogOpen(true);
  };

  const handleEditClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setDialogOpen(true);
  };

  const handleDialogSuccess = async () => {
    await loadEntities(); // Reload after create/update
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h1">Entities</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
            Create Entity
          </Button>
        </Box>

        {/* Error Alert */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search..."
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entities.map((entity) => (
                <TableRow key={entity.id} hover>
                  <TableCell>{entity.name}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditClick(entity)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>

        {/* Dialog */}
        <EntityDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleDialogSuccess}
          entity={selectedEntity}
        />
      </Box>
    </Container>
  );
}
```

**Critical Page Patterns**:

1. **Container + Box**: `<Container maxWidth="lg"><Box sx={{ my: 4 }}>`
2. **Header layout**: Flex row with space-between for title + action button
3. **Loading state**: Show loading message or skeleton
4. **Error handling**: Alert component at top of page
5. **Search debouncing**: 300ms delay before API call
6. **Pagination**: Reset to page 1 when search/limit changes
7. **Dialog integration**: Single dialog for create/edit, controlled by state

> **Table Reference**: See `references/table-patterns.md` for advanced table patterns including sorting, filtering, row selection, and empty states.

## Form Components

### TextField Pattern

```typescript
<TextField
  label="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  fullWidth
  autoFocus                  // For first field in dialog
  disabled={loading}
  helperText="Helper text"   // Optional guidance
  error={!!nameError}        // Boolean for error state
  helperText={nameError}     // Error message
/>
```

### Select Pattern

```typescript
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

<FormControl fullWidth>
  <InputLabel>Role</InputLabel>
  <Select
    value={role}
    label="Role"  // Must match InputLabel for outline
    onChange={(e) => setRole(e.target.value)}
  >
    <MenuItem value="owner">Owner</MenuItem>
    <MenuItem value="admin">Admin</MenuItem>
    <MenuItem value="member">Member</MenuItem>
  </Select>
</FormControl>
```

### Autocomplete Pattern

```typescript
import { Autocomplete, TextField } from '@mui/material';

<Autocomplete
  multiple                    // For multi-select
  options={allUsers}
  getOptionLabel={(user) => `${user.name} (${user.email})`}
  value={selectedUsers}
  onChange={(_, users) => setSelectedUsers(users)}
  disabled={loading}
  renderInput={(params) => (
    <TextField {...params} placeholder="Select users..." />
  )}
/>
```

### DatePicker Pattern

```typescript
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

<LocalizationProvider dateAdapter={AdapterDateFns}>
  <DatePicker
    label="Start Date"
    value={date}
    onChange={(newDate) => setDate(newDate)}
    slotProps={{
      textField: { fullWidth: true }
    }}
  />
</LocalizationProvider>
```

> **Form Reference**: See `references/form-patterns.md` for comprehensive form patterns including validation, file uploads, and complex nested forms.

## Shared Components

### Creating Reusable Components

Pattern from `RoleSelector.tsx`:

```typescript
'use client';

import { Select, MenuItem, FormControl, type SelectChangeEvent } from '@mui/material';
import type { Role } from '@/db/schema';

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export function RoleSelector({
  value,
  onChange,
  disabled = false,
  size = 'small',
}: RoleSelectorProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as Role);
  };

  return (
    <FormControl size={size} disabled={disabled}>
      <Select value={value} onChange={handleChange} sx={{ minWidth: 100 }}>
        <MenuItem value="owner">Owner</MenuItem>
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="member">Member</MenuItem>
      </Select>
    </FormControl>
  );
}
```

**Shared Component Principles**:

1. **Props interface**: Clear, typed interface
2. **Default values**: Provide sensible defaults
3. **Event handlers**: Wrap MUI events, expose simple callbacks
4. **TypeScript**: Use strict typing for values (Role type, not string)
5. **Flexibility**: Accept common MUI props (size, disabled)
6. **Location**: Place in `src/components/shared/`

## Common Pitfalls

### ❌ Don't: Forget 'use client'

```typescript
// ❌ This will fail at runtime (hooks in server component)
import { useState } from 'react';
import { Button } from '@mui/material';

export function MyButton() {
  const [count, setCount] = useState(0); // Error!
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
}
```

```typescript
// ✅ Do: Add 'use client' directive
'use client';

import { useState } from 'react';
import { Button } from '@mui/material';

export function MyButton() {
  const [count, setCount] = useState(0); // Works!
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
}
```

### ❌ Don't: Use inline styles

```typescript
// ❌ Doesn't support theme values or responsive design
<Box style={{ padding: '16px', color: '#1976d2' }}>Content</Box>
```

```typescript
// ✅ Do: Use sx prop with theme values
<Box sx={{ p: 2, color: 'primary.main' }}>Content</Box>
```

### ❌ Don't: Mutate props directly

```typescript
// ❌ Mutating prop
function MyDialog({ entity }: { entity: Entity }) {
  const handleChange = (value: string) => {
    entity.name = value; // Mutation!
  };
}
```

```typescript
// ✅ Do: Use local state
function MyDialog({ entity }: { entity: Entity }) {
  const [name, setName] = useState(entity?.name || '');

  const handleChange = (value: string) => {
    setName(value); // Controlled state
  };
}
```

### ❌ Don't: Miss form submission handling

```typescript
// ❌ Button click only (misses Enter key)
<Dialog>
  <DialogContent>
    <TextField />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleSave}>Save</Button>
  </DialogActions>
</Dialog>
```

```typescript
// ✅ Do: Wrap in form with onSubmit
<Dialog>
  <form onSubmit={handleSubmit}>
    <DialogContent>
      <TextField />
    </DialogContent>
    <DialogActions>
      <Button type="submit">Save</Button>
    </DialogActions>
  </form>
</Dialog>
```

### ❌ Don't: Forget to reset dialog state

```typescript
// ❌ State persists between opens
function MyDialog({ open, entity }: DialogProps) {
  const [name, setName] = useState('');
  // State never resets!
}
```

```typescript
// ✅ Do: Reset with useEffect
function MyDialog({ open, entity }: DialogProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (entity) {
      setName(entity.name);
    } else {
      setName('');
    }
  }, [entity, open]); // Reset when entity or open changes
}
```

## Quick Reference

### Common Imports

```typescript
// Layout
import { Container, Box, Stack, Grid } from '@mui/material';

// Typography
import { Typography } from '@mui/material';

// Buttons
import { Button, IconButton, ButtonGroup } from '@mui/material';

// Inputs
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Checkbox,
  Switch,
  Radio,
  RadioGroup,
} from '@mui/material';

// Feedback
import { Alert, Snackbar, CircularProgress, LinearProgress, Skeleton } from '@mui/material';

// Surfaces
import {
  Paper,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// Navigation
import { Tabs, Tab, Breadcrumbs, Link } from '@mui/material';

// Data Display
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Badge,
  Avatar,
  Tooltip,
} from '@mui/material';

// Dialog
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

// Lists
import { List, ListItem, ListItemText, ListItemIcon, ListItemButton, Divider } from '@mui/material';

// Icons (separate package)
import {
  Add,
  Edit,
  Delete,
  Search,
  Menu,
  Close,
  ArrowBack,
  ArrowForward,
  Info,
  Warning,
  Error,
  Check,
} from '@mui/icons-material';

// Hooks
import { useTheme, useMediaQuery } from '@mui/material';
```

### Common Layouts

```typescript
// Flex column with gap
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

// Flex row with space between
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

// Centered content
<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>

// Grid layout
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>Content</Grid>
  <Grid item xs={12} md={6}>Content</Grid>
</Grid>

// Stack (vertical by default)
<Stack spacing={2}>
  <Item />
  <Item />
</Stack>

// Stack horizontal
<Stack direction="row" spacing={2}>
  <Item />
  <Item />
</Stack>
```

### Common Button Patterns

```typescript
// Primary action
<Button variant="contained" onClick={handleClick}>Save</Button>

// Secondary action
<Button variant="outlined" onClick={handleClick}>Cancel</Button>

// Text button (low emphasis)
<Button onClick={handleClick}>Learn More</Button>

// With icon
<Button startIcon={<AddIcon />} variant="contained">Create</Button>

// Loading state
<Button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</Button>

// Icon button
<IconButton size="small" onClick={handleClick}>
  <EditIcon />
</IconButton>
```

### Common Table Patterns

```typescript
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Column 1</TableCell>
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.length === 0 ? (
        <TableRow>
          <TableCell colSpan={2} align="center">
            <Typography color="text.secondary">No items found</Typography>
          </TableCell>
        </TableRow>
      ) : (
        items.map((item) => (
          <TableRow key={item.id} hover>
            <TableCell>{item.name}</TableCell>
            <TableCell align="right">
              <IconButton size="small">
                <EditIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</TableContainer>
```

## Related Documentation

- **Theme Patterns**: `references/theme-patterns.md` - Comprehensive theme customization
- **Form Patterns**: `references/form-patterns.md` - Advanced form patterns and validation
- **Table Patterns**: `references/table-patterns.md` - Sorting, filtering, selection patterns

## Templates

- **Dialog Template**: `assets/dialog-template.tsx` - Production-ready create/edit dialog
- **Page Template**: `assets/page-template.tsx` - Complete CRUD page with search and pagination
