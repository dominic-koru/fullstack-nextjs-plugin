# Theme Patterns Reference

Comprehensive guide to using MUI v6 themes with CSS variables in this project.

## Table of Contents

1. [Theme Configuration](#theme-configuration)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Breakpoints & Responsive Design](#breakpoints--responsive-design)
6. [Dark Mode](#dark-mode)
7. [Custom Theme Values](#custom-theme-values)
8. [Theme Hooks](#theme-hooks)

## Theme Configuration

### Project Theme Setup

Located in `src/theme/index.ts`:

```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: true, // Enable CSS variables
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#90caf9',
        },
        secondary: {
          main: '#f48fb1',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});
```

**Key Features**:

- **CSS Variables**: `cssVariables: true` enables runtime theming
- **Color Schemes**: Separate light/dark palettes
- **Typography**: Custom font sizes and weights
- **Shape**: Global border radius

### Theme Provider Setup

Located in `src/components/providers/ThemeProvider.tsx`:

```typescript
'use client';

import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme } from '@/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
```

**Important**:

- `CssBaseline` resets browser styles for consistency
- Wrap root layout with `<ThemeProvider>`
- Must be a client component (`'use client'`)

## Color System

### Palette Colors

All colors automatically support light/dark mode:

```typescript
// Primary colors
sx={{ color: 'primary.main' }}        // Main brand color
sx={{ color: 'primary.light' }}       // Lighter shade
sx={{ color: 'primary.dark' }}        // Darker shade
sx={{ color: 'primary.contrastText' }} // Text on primary background

// Secondary colors
sx={{ color: 'secondary.main' }}
sx={{ color: 'secondary.light' }}
sx={{ color: 'secondary.dark' }}

// Error, Warning, Info, Success
sx={{ color: 'error.main' }}
sx={{ color: 'warning.main' }}
sx={{ color: 'info.main' }}
sx={{ color: 'success.main' }}
```

### Background Colors

```typescript
// Page background
sx={{ bgcolor: 'background.default' }}  // Main page background

// Surface background (cards, paper)
sx={{ bgcolor: 'background.paper' }}    // Elevated surface

// Example: Card component
<Paper sx={{ bgcolor: 'background.paper', p: 2 }}>
  <Typography>Card content</Typography>
</Paper>
```

### Text Colors

```typescript
// Primary text (headings, main content)
sx={{ color: 'text.primary' }}

// Secondary text (less emphasis)
sx={{ color: 'text.secondary' }}

// Disabled text
sx={{ color: 'text.disabled' }}

// Example: Typography hierarchy
<Typography variant="h1" color="text.primary">Heading</Typography>
<Typography variant="body2" color="text.secondary">Subtitle</Typography>
```

### Divider Colors

```typescript
sx={{ borderColor: 'divider' }}

// Example: Custom divider
<Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
  Content above divider
</Box>
```

### Action Colors

```typescript
// Interactive elements
sx={{ color: 'action.active' }}      // Active icons
sx={{ color: 'action.hover' }}       // Hover state
sx={{ color: 'action.selected' }}    // Selected state
sx={{ color: 'action.disabled' }}    // Disabled state
sx={{ color: 'action.disabledBackground' }} // Disabled background
```

## Typography

### Variant System

```typescript
<Typography variant="h1">Main Heading (2.5rem)</Typography>
<Typography variant="h2">Sub Heading (2rem)</Typography>
<Typography variant="h3">Section Heading</Typography>
<Typography variant="h4">Subsection Heading</Typography>
<Typography variant="h5">Card Heading</Typography>
<Typography variant="h6">Small Heading</Typography>

<Typography variant="subtitle1">Large Subtitle</Typography>
<Typography variant="subtitle2">Small Subtitle</Typography>

<Typography variant="body1">Regular paragraph text (default)</Typography>
<Typography variant="body2">Smaller body text</Typography>

<Typography variant="button">BUTTON TEXT</Typography>
<Typography variant="caption">Small caption text</Typography>
<Typography variant="overline">OVERLINE TEXT</Typography>
```

### Typography Props

```typescript
// Font weight
<Typography fontWeight="bold">Bold text</Typography>
<Typography fontWeight={500}>Medium weight</Typography>
<Typography fontWeight="light">Light text</Typography>

// Font style
<Typography fontStyle="italic">Italic text</Typography>

// Text alignment
<Typography align="center">Centered</Typography>
<Typography align="right">Right aligned</Typography>

// Text transform
<Typography textTransform="uppercase">Uppercase</Typography>
<Typography textTransform="capitalize">Capitalized</Typography>

// Color
<Typography color="primary">Primary color</Typography>
<Typography color="error">Error color</Typography>
<Typography color="text.secondary">Secondary text</Typography>

// Gutters (bottom margin)
<Typography gutterBottom>Text with margin below</Typography>

// No wrap (ellipsis on overflow)
<Typography noWrap>This text will truncate with ellipsis...</Typography>
```

### Custom Typography in sx

```typescript
<Box sx={{
  fontSize: '1.2rem',
  fontWeight: 600,
  lineHeight: 1.5,
  letterSpacing: '0.02em',
  textAlign: 'center',
}}>
  Custom styled text
</Box>
```

## Spacing

### Spacing Scale

MUI uses an 8px spacing scale. The theme spacing function multiplies by 8:

```typescript
sx={{ p: 1 }}   // padding: 8px
sx={{ p: 2 }}   // padding: 16px
sx={{ p: 3 }}   // padding: 24px
sx={{ p: 4 }}   // padding: 32px
```

### Padding Shorthands

```typescript
// All sides
sx={{ p: 2 }}           // padding: 16px

// Individual sides
sx={{ pt: 2 }}          // padding-top: 16px
sx={{ pr: 2 }}          // padding-right: 16px
sx={{ pb: 2 }}          // padding-bottom: 16px
sx={{ pl: 2 }}          // padding-left: 16px

// Axis shorthands
sx={{ px: 2 }}          // padding-left: 16px, padding-right: 16px
sx={{ py: 2 }}          // padding-top: 16px, padding-bottom: 16px

// Combined
sx={{ pt: 1, px: 2, pb: 3 }}
```

### Margin Shorthands

```typescript
// Same pattern as padding
sx={{ m: 2 }}           // margin: 16px
sx={{ mt: 2 }}          // margin-top: 16px
sx={{ mx: 2 }}          // margin-left: 16px, margin-right: 16px
sx={{ my: 4 }}          // margin-top: 32px, margin-bottom: 32px

// Negative margins
sx={{ mt: -1 }}         // margin-top: -8px
```

### Gap (Flexbox/Grid)

```typescript
// Flex gap
<Box sx={{ display: 'flex', gap: 2 }}>
  <Item />
  <Item />
</Box>

// Column gap (horizontal)
sx={{ columnGap: 2 }}

// Row gap (vertical)
sx={{ rowGap: 2 }}

// Combined
sx={{ display: 'flex', flexDirection: 'column', rowGap: 1, columnGap: 2 }}
```

### Common Spacing Patterns

```typescript
// Page container
<Container maxWidth="lg">
  <Box sx={{ my: 4 }}>  {/* 32px top/bottom margin */}
    Page content
  </Box>
</Container>

// Card padding
<Paper sx={{ p: 2 }}>  {/* 16px padding all sides */}
  Card content
</Paper>

// Section spacing
<Box sx={{ mb: 3 }}>  {/* 24px bottom margin */}
  <Typography variant="h2" gutterBottom>Section Title</Typography>
  <Typography>Section content</Typography>
</Box>

// Flex container with gap
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  <Item />
  <Item />
  <Item />
</Box>
```

## Breakpoints & Responsive Design

### Breakpoint System

```typescript
// Default breakpoints
xs: 0px     // Extra small (mobile)
sm: 600px   // Small (tablet portrait)
md: 900px   // Medium (tablet landscape)
lg: 1200px  // Large (desktop)
xl: 1536px  // Extra large (large desktop)
```

### Responsive Values in sx

```typescript
// Different values per breakpoint
<Box sx={{
  width: { xs: '100%', md: '50%' },  // 100% on mobile, 50% on desktop
  p: { xs: 1, sm: 2, md: 3 },         // 8px mobile, 16px tablet, 24px desktop
}}>
  Responsive content
</Box>

// Complex responsive layout
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },  // Stack on mobile, row on desktop
  gap: { xs: 1, md: 2 },
  alignItems: { xs: 'stretch', md: 'center' },
}}>
  <Item />
  <Item />
</Box>
```

### useMediaQuery Hook

```typescript
import { useMediaQuery, useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </Box>
  );
}
```

### Breakpoint Helpers

```typescript
// Up (greater than or equal)
theme.breakpoints.up('sm'); // >= 600px
theme.breakpoints.up('md'); // >= 900px

// Down (less than)
theme.breakpoints.down('sm'); // < 600px
theme.breakpoints.down('md'); // < 900px

// Between
theme.breakpoints.between('sm', 'md'); // 600px - 900px

// Only
theme.breakpoints.only('md'); // 900px - 1200px
```

### Grid System

```typescript
import { Grid } from '@mui/material';

<Grid container spacing={2}>
  {/* Full width on mobile, half on tablet, third on desktop */}
  <Grid item xs={12} sm={6} md={4}>
    <Card>Content</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Content</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Content</Card>
  </Grid>
</Grid>
```

## Dark Mode

### Color Scheme Toggle

This project uses CSS variables, so dark mode is automatic based on system preference. To manually toggle:

```typescript
import { useColorScheme } from '@mui/material';

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();

  return (
    <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
      Toggle Theme ({mode})
    </Button>
  );
}
```

### System Preference

By default, theme follows system preference. To force a mode:

```typescript
// Force dark mode
setMode('dark');

// Force light mode
setMode('light');

// Follow system preference
setMode('system');
```

### Dark Mode Best Practices

```typescript
// ✅ Do: Use theme colors (automatic dark mode)
<Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
  Content
</Box>

// ❌ Don't: Use hardcoded colors
<Box sx={{ bgcolor: '#ffffff', color: '#000000' }}>
  Content (breaks in dark mode!)
</Box>
```

## Custom Theme Values

### Adding Custom Colors

```typescript
// src/theme/index.ts
export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#1976d2',
        },
        // Add custom color
        tertiary: {
          main: '#4caf50',
          light: '#81c784',
          dark: '#388e3c',
          contrastText: '#fff',
        },
      },
    },
  },
});

// Usage
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

<Box sx={{ color: 'tertiary.main' }}>Custom color</Box>
```

### Custom Spacing

```typescript
export const theme = createTheme({
  spacing: 8, // Default (can change to 4, 10, etc.)
});

// Or function-based
export const theme = createTheme({
  spacing: (factor: number) => `${0.5 * factor}rem`,
});
```

### Custom Breakpoints

```typescript
export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960, // Changed from 900
      lg: 1280, // Changed from 1200
      xl: 1920, // Changed from 1536
    },
  },
});
```

## Theme Hooks

### useTheme

```typescript
import { useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box sx={{
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
    }}>
      Direct theme access
    </Box>
  );
}
```

### useColorScheme

```typescript
import { useColorScheme } from '@mui/material';

function MyComponent() {
  const { mode, setMode, systemMode } = useColorScheme();

  return (
    <Box>
      <p>Current mode: {mode}</p>
      <p>System mode: {systemMode}</p>
      <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        Toggle
      </Button>
    </Box>
  );
}
```

### useMediaQuery

```typescript
import { useMediaQuery, useTheme } from '@mui/material';

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </Box>
  );
}
```

## Common Theme Patterns

### Elevation & Shadows

```typescript
// Paper with elevation
<Paper elevation={1}>Slight shadow</Paper>
<Paper elevation={3}>Medium shadow (default)</Paper>
<Paper elevation={8}>Deep shadow</Paper>

// Custom box shadow
<Box sx={{ boxShadow: 1 }}>Light shadow</Box>
<Box sx={{ boxShadow: 3 }}>Medium shadow</Box>
<Box sx={{ boxShadow: 24 }}>Deep shadow (dialog)</Box>
```

### Transitions

```typescript
// Theme transitions
<Box sx={{
  transition: 'all 0.3s',
  '&:hover': {
    bgcolor: 'primary.main',
  },
}}>
  Smooth transition
</Box>

// Using theme transition helper
<Box sx={{
  transition: (theme) =>
    theme.transitions.create(['background-color', 'transform'], {
      duration: theme.transitions.duration.short,
    }),
}}>
  Advanced transition
</Box>
```

### Z-Index

```typescript
// Theme z-index values
sx={{ zIndex: 'appBar' }}       // 1100
sx={{ zIndex: 'drawer' }}       // 1200
sx={{ zIndex: 'modal' }}        // 1300
sx={{ zIndex: 'snackbar' }}     // 1400
sx={{ zIndex: 'tooltip' }}      // 1500

// Custom z-index
sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
```

## Best Practices

1. **Always use theme values** instead of hardcoded values
2. **Use sx prop** instead of inline styles
3. **Test both light and dark modes**
4. **Use responsive values** for mobile-first design
5. **Leverage theme spacing** for consistent layouts
6. **Use semantic colors** (primary, error, etc.) not specific shades
7. **Follow accessibility guidelines** (contrast ratios, text sizes)
8. **Extend theme** for custom values instead of hardcoding
