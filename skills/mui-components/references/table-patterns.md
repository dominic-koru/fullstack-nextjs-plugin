# Table & Data Display Patterns Reference

Comprehensive guide to building data tables and lists with MUI v6.

## Table of Contents

1. [Basic Table Structure](#basic-table-structure)
2. [Empty States](#empty-states)
3. [Loading States](#loading-states)
4. [Search & Filtering](#search--filtering)
5. [Pagination](#pagination)
6. [Actions Column](#actions-column)
7. [Sorting](#sorting)
8. [Row Selection](#row-selection)
9. [Responsive Tables](#responsive-tables)
10. [Best Practices](#best-practices)

## Basic Table Structure

### Standard Table

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Email</TableCell>
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id} hover>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.email}</TableCell>
          <TableCell align="right">
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

**Key Props**:

- `hover` - Row highlight on hover
- `align="right"` - Right-align actions
- `component={Paper}` - Elevation and rounded corners

## Empty States

### No Data Message

Pattern from `organisations/page.tsx`:

```typescript
<TableBody>
  {items.length === 0 ? (
    <TableRow>
      <TableCell colSpan={3} align="center">
        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
          {searchQuery
            ? 'No items found matching your search.'
            : 'No items yet. Create your first one!'}
        </Typography>
      </TableCell>
    </TableRow>
  ) : (
    items.map((item) => (
      <TableRow key={item.id}>
        {/* Row content */}
      </TableRow>
    ))
  )}
</TableBody>
```

**Best Practices**:

- Use `colSpan` to span all columns
- Different messages for empty vs. no search results
- `py: 4` for vertical padding
- `text.secondary` for subtle color

## Loading States

### Skeleton Rows

```typescript
import { Skeleton } from '@mui/material';

<TableBody>
  {loading ? (
    Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
      </TableRow>
    ))
  ) : (
    items.map((item) => (
      <TableRow key={item.id}>
        {/* Row content */}
      </TableRow>
    ))
  )}
</TableBody>
```

### Simple Loading Message

```typescript
if (loading) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    </Container>
  );
}
```

## Search & Filtering

### Search TextField

Pattern from `organisations/page.tsx`:

```typescript
const [searchInput, setSearchInput] = useState('');
const [searchQuery, setSearchQuery] = useState('');

// Debounce search (300ms)
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setSearchQuery(searchInput);
    setPage(1); // Reset to first page
  }, 300);
  return () => clearTimeout(timeoutId);
}, [searchInput]);

<TextField
  fullWidth
  placeholder="Search items..."
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
```

**Pattern Explanation**:

1. **searchInput** - Immediate value (controlled input)
2. **searchQuery** - Debounced value (for API)
3. **300ms delay** - Wait for user to stop typing
4. **Reset page** - Go to page 1 on new search

## Pagination

### Standard Pagination

Pattern from `organisations/page.tsx`:

```typescript
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(50);
const [totalPages, setTotalPages] = useState(1);
const [totalItems, setTotalItems] = useState(0);

const loadItems = async () => {
  const result = await fetchItems({ page, limit, search: searchQuery });
  setItems(result.data);
  setTotalPages(result.pagination?.pages || 1);
  setTotalItems(result.pagination?.total || 0);
};

<Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  {/* Item count */}
  <Typography variant="body2" color="text.secondary">
    Showing {items.length === 0 ? 0 : (page - 1) * limit + 1} to{' '}
    {Math.min(page * limit, totalItems)} of {totalItems} items
  </Typography>

  {/* Pagination controls */}
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
    {/* Items per page selector */}
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Items per page</InputLabel>
      <Select
        value={limit}
        label="Items per page"
        onChange={(e) => {
          setLimit(Number(e.target.value));
          setPage(1); // Reset to page 1
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
```

## Actions Column

### Icon Buttons

```typescript
<TableCell align="right">
  <IconButton
    size="small"
    onClick={() => handleEdit(item)}
    aria-label="edit"
  >
    <EditIcon />
  </IconButton>
  <IconButton
    size="small"
    onClick={() => handleDelete(item)}
    aria-label="delete"
    color="error"
  >
    <DeleteIcon />
  </IconButton>
</TableCell>
```

### Dropdown Menu

```typescript
import { Menu, MenuItem, IconButton, MoreVertIcon } from '@mui/material';

function ActionsMenu({ item }: { item: Item }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { handleEdit(item); setAnchorEl(null); }}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { handleDelete(item); setAnchorEl(null); }}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
```

## Sorting

### Sortable Headers

```typescript
import { TableSortLabel } from '@mui/material';

type SortField = 'name' | 'email' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const [sortField, setSortField] = useState<SortField>('name');
const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

const handleSort = (field: SortField) => {
  const isAsc = sortField === field && sortDirection === 'asc';
  setSortDirection(isAsc ? 'desc' : 'asc');
  setSortField(field);
};

<TableHead>
  <TableRow>
    <TableCell>
      <TableSortLabel
        active={sortField === 'name'}
        direction={sortField === 'name' ? sortDirection : 'asc'}
        onClick={() => handleSort('name')}
      >
        Name
      </TableSortLabel>
    </TableCell>
    <TableCell>
      <TableSortLabel
        active={sortField === 'email'}
        direction={sortField === 'email' ? sortDirection : 'asc'}
        onClick={() => handleSort('email')}
      >
        Email
      </TableSortLabel>
    </TableCell>
  </TableRow>
</TableHead>
```

### Client-Side Sorting

```typescript
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });
}, [items, sortField, sortDirection]);

// Render sortedItems instead of items
```

## Row Selection

### Checkbox Selection

```typescript
const [selected, setSelected] = useState<Set<string>>(new Set());

const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.checked) {
    setSelected(new Set(items.map(item => item.id)));
  } else {
    setSelected(new Set());
  }
};

const handleSelectOne = (id: string) => {
  setSelected(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
};

<TableHead>
  <TableRow>
    <TableCell padding="checkbox">
      <Checkbox
        checked={selected.size === items.length && items.length > 0}
        indeterminate={selected.size > 0 && selected.size < items.length}
        onChange={handleSelectAll}
      />
    </TableCell>
    <TableCell>Name</TableCell>
  </TableRow>
</TableHead>

<TableBody>
  {items.map((item) => (
    <TableRow key={item.id} hover selected={selected.has(item.id)}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected.has(item.id)}
          onChange={() => handleSelectOne(item.id)}
        />
      </TableCell>
      <TableCell>{item.name}</TableCell>
    </TableRow>
  ))}
</TableBody>
```

## Responsive Tables

### Mobile Card View

```typescript
import { useMediaQuery, useTheme } from '@mui/material';

function ResponsiveTable({ items }: { items: Item[] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => (
          <Paper key={item.id} sx={{ p: 2 }}>
            <Typography variant="h6">{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.email}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<EditIcon />}>
                Edit
              </Button>
              <Button size="small" color="error" startIcon={<DeleteIcon />}>
                Delete
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      {/* Desktop table */}
    </TableContainer>
  );
}
```

## Best Practices

1. **Use hover prop** for better UX
2. **Align actions right** with `align="right"`
3. **Show empty states** with helpful messages
4. **Debounce search** (300ms) to reduce API calls
5. **Reset page on search** to page 1
6. **Use colSpan for empty rows** to span all columns
7. **Add aria-labels** to icon buttons for accessibility
8. **Show loading skeletons** instead of spinners
9. **Paginate server-side** for large datasets
10. **Include item count** for context
11. **Make headers sortable** when useful
12. **Use sticky headers** for long tables: `stickyHeader` prop
13. **Consider mobile view** for small screens
14. **Include quick actions** for common operations
