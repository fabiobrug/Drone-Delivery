# Design System Documentation

## Overview

This document outlines the design system for the Drone Operations Management System (DroneOps), a comprehensive web application for managing drone delivery operations. The design system ensures consistency, accessibility, and maintainability across the entire application.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Icons](#icons)
6. [Animations](#animations)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Theme System](#theme-system)

## Color Palette

### Primary Colors

- **Primary Blue**: `#3B82F6` (blue-500) - Main brand color for buttons, links, and primary actions
- **Primary Dark**: `#1E40AF` (blue-700) - Darker variant for hover states and emphasis
- **Primary Light**: `#93C5FD` (blue-300) - Lighter variant for backgrounds and subtle elements

### Secondary Colors

- **Success Green**: `#10B981` (emerald-500) - Success states, completed operations
- **Warning Orange**: `#F59E0B` (amber-500) - Warning states, pending operations
- **Error Red**: `#EF4444` (red-500) - Error states, failed operations
- **Info Cyan**: `#06B6D4` (cyan-500) - Information states, neutral operations

### Neutral Colors

- **Background Dark**: `#111827` (gray-900) - Main background color
- **Background Light**: `#1F2937` (gray-800) - Secondary background
- **Surface**: `#374151` (gray-700) - Card and surface backgrounds
- **Border**: `#4B5563` (gray-600) - Borders and dividers
- **Text Primary**: `#F9FAFB` (gray-50) - Primary text color
- **Text Secondary**: `#9CA3AF` (gray-400) - Secondary text color
- **Text Muted**: `#6B7280` (gray-500) - Muted text color

### Status Colors

- **Drone Idle**: `#6B7280` (gray-500) - Gray for idle drones
- **Drone Loading**: `#F59E0B` (amber-500) - Orange for loading drones
- **Drone Flying**: `#3B82F6` (blue-500) - Blue for flying drones
- **Drone Returning**: `#8B5CF6` (violet-500) - Purple for returning drones

### Map Colors

- **Streets**: `#CBD5E1` (slate-300) - Light gray for streets
- **Commercial**: `#BFDBFE` (blue-200) - Light blue for commercial areas
- **Industrial**: `#475569` (slate-600) - Dark gray for industrial zones
- **Residential**: `#A7F3D0` (emerald-200) - Light green for residential areas
- **No-Fly Zone**: `#FECACA` (red-200) - Light red for restricted areas

## Typography

### Font Family

- **Primary**: System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Monospace**: `'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace`

### Font Sizes

- **xs**: `0.75rem` (12px) - Small labels, captions
- **sm**: `0.875rem` (14px) - Body text, form labels
- **base**: `1rem` (16px) - Default body text
- **lg**: `1.125rem` (18px) - Large body text
- **xl**: `1.25rem` (20px) - Small headings
- **2xl**: `1.5rem` (24px) - Medium headings
- **3xl**: `1.875rem` (30px) - Large headings
- **4xl**: `2.25rem` (36px) - Extra large headings

### Font Weights

- **Light**: `300` - Light text
- **Normal**: `400` - Regular text
- **Medium**: `500` - Medium emphasis
- **Semibold**: `600` - Strong emphasis
- **Bold**: `700` - Bold text

### Line Heights

- **Tight**: `1.25` - Headings
- **Normal**: `1.5` - Body text
- **Relaxed**: `1.75` - Large text blocks

## Spacing & Layout

### Spacing Scale

- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)
- **3xl**: `4rem` (64px)

### Grid System

- **Container**: Max width with responsive padding
- **Grid**: 12-column responsive grid system
- **Gutters**: Consistent spacing between grid items

### Layout Patterns

- **Sidebar Layout**: Fixed sidebar with main content area
- **Dashboard Layout**: Grid-based dashboard with cards
- **Modal Layout**: Centered modal with backdrop
- **Form Layout**: Vertical form with consistent spacing

## Components

### Buttons

#### Primary Button

```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Primary Action
</button>
```

#### Secondary Button

```jsx
<button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Secondary Action
</button>
```

#### Danger Button

```jsx
<button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Delete
</button>
```

### Cards

#### Basic Card

```jsx
<div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
  <h3 className="text-lg font-semibold text-white mb-2">Card Title</h3>
  <p className="text-gray-400">Card content goes here</p>
</div>
```

#### Stats Card

```jsx
<div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-400">Total Drones</p>
      <p className="text-2xl font-bold text-white">24</p>
    </div>
    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
      <DroneIcon className="w-5 h-5 text-white" />
    </div>
  </div>
</div>
```

### Forms

#### Input Field

```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
  <input
    type="text"
    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Enter value"
  />
</div>
```

#### Select Field

```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Select Option
  </label>
  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    <option value="">Choose an option</option>
    <option value="option1">Option 1</option>
  </select>
</div>
```

### Modals

#### Basic Modal

```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
    <h2 className="text-xl font-semibold text-white mb-4">Modal Title</h2>
    <p className="text-gray-400 mb-6">Modal content</p>
    <div className="flex justify-end space-x-3">
      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
        Cancel
      </button>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Tables

#### Data Table

```jsx
<div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-700">
      <tr>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
          Drone #001
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Active
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Status Indicators

#### Status Badge

```jsx
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
  Active
</span>
```

#### Status Dot

```jsx
<div className="flex items-center">
  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
  <span className="text-sm text-gray-300">Online</span>
</div>
```

## Icons

### Icon Library

The application uses Heroicons v2 for consistent iconography:

- **Outline Icons**: Used for navigation and general UI elements
- **Solid Icons**: Used for filled states and emphasis
- **Mini Icons**: Used for small spaces and inline elements

### Common Icons

- **Drone**: `DroneIcon` - Represents drones and drone operations
- **Map**: `MapIcon` - Represents mapping and location features
- **Settings**: `CogIcon` - Represents configuration and settings
- **Stats**: `ChartBarIcon` - Represents statistics and analytics
- **Orders**: `ShoppingBagIcon` - Represents orders and deliveries
- **Warning**: `ExclamationTriangleIcon` - Represents warnings and alerts
- **Success**: `CheckCircleIcon` - Represents success states
- **Error**: `XCircleIcon` - Represents error states

### Icon Usage Guidelines

- Use consistent sizing: `w-5 h-5` for standard icons, `w-6 h-6` for larger icons
- Maintain consistent stroke width: `stroke-2` for outline icons
- Use appropriate colors: white for dark backgrounds, gray for secondary elements
- Provide hover states for interactive icons

## Animations

### Transition Classes

- **Fast**: `transition-all duration-150` - Quick interactions
- **Normal**: `transition-all duration-300` - Standard interactions
- **Slow**: `transition-all duration-500` - Smooth, deliberate animations

### Hover Effects

- **Scale**: `hover:scale-105` - Subtle scale on hover
- **Opacity**: `hover:opacity-80` - Opacity change on hover
- **Color**: `hover:bg-blue-700` - Color change on hover

### Loading States

- **Spinner**: Rotating spinner for loading states
- **Skeleton**: Skeleton screens for content loading
- **Pulse**: Pulse animation for loading indicators

### Map Animations

- **Drone Movement**: Smooth interpolation between positions
- **Route Drawing**: Animated path drawing for delivery routes
- **Status Changes**: Smooth color transitions for status updates

## Responsive Design

### Breakpoints

- **sm**: `640px` - Small devices (phones)
- **md**: `768px` - Medium devices (tablets)
- **lg**: `1024px` - Large devices (laptops)
- **xl**: `1280px` - Extra large devices (desktops)
- **2xl**: `1536px` - 2X large devices (large desktops)

### Responsive Patterns

- **Mobile First**: Design for mobile, enhance for larger screens
- **Flexible Grid**: Responsive grid that adapts to screen size
- **Collapsible Sidebar**: Sidebar collapses on mobile devices
- **Stacked Layout**: Elements stack vertically on small screens

### Mobile Considerations

- **Touch Targets**: Minimum 44px touch targets
- **Swipe Gestures**: Support for swipe navigation
- **Viewport**: Proper viewport meta tag
- **Performance**: Optimized for mobile performance

## Accessibility

### Color Contrast

- **AA Standard**: Minimum 4.5:1 contrast ratio for normal text
- **AAA Standard**: Minimum 7:1 contrast ratio for enhanced accessibility
- **Large Text**: Minimum 3:1 contrast ratio for large text

### Keyboard Navigation

- **Tab Order**: Logical tab order through interactive elements
- **Focus Indicators**: Visible focus indicators for keyboard users
- **Skip Links**: Skip links for main content navigation
- **Keyboard Shortcuts**: Keyboard shortcuts for common actions

### Screen Readers

- **Semantic HTML**: Proper use of semantic HTML elements
- **ARIA Labels**: Descriptive ARIA labels for complex interactions
- **Alt Text**: Descriptive alt text for images
- **Live Regions**: Live regions for dynamic content updates

### Motion Preferences

- **Respect Preferences**: Honor `prefers-reduced-motion` setting
- **Essential Motion**: Only animate essential interactions
- **Alternative Indicators**: Provide alternative indicators for motion

## Theme System

### Dark Theme (Default)

The application uses a dark theme by default with:

- Dark backgrounds (`gray-900`, `gray-800`)
- Light text (`gray-50`, `gray-400`)
- High contrast for readability
- Reduced eye strain for extended use

### Theme Variables

```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-background: #111827;
  --color-surface: #1f2937;
  --color-text: #f9fafb;
  --color-text-secondary: #9ca3af;
}
```

### Theme Implementation

- **CSS Variables**: Use CSS custom properties for theme colors
- **Tailwind Classes**: Leverage Tailwind's dark mode classes
- **Component Props**: Allow theme customization through component props
- **Context Provider**: Theme context for global theme management

## Implementation Guidelines

### CSS Framework

- **Tailwind CSS**: Primary CSS framework for utility-first styling
- **Custom Components**: Reusable components with consistent styling
- **CSS Modules**: Scoped styles for component-specific styling

### Component Architecture

- **Atomic Design**: Build components using atomic design principles
- **Composition**: Compose complex components from simpler ones
- **Props Interface**: Consistent props interface across components
- **Default Values**: Sensible default values for all props

### Performance Considerations

- **Critical CSS**: Inline critical CSS for above-the-fold content
- **Lazy Loading**: Lazy load non-critical components
- **Tree Shaking**: Remove unused CSS and JavaScript
- **Image Optimization**: Optimize images for web delivery

### Maintenance

- **Documentation**: Keep component documentation up to date
- **Version Control**: Version control for design system changes
- **Testing**: Visual regression testing for component changes
- **Migration Guide**: Migration guides for breaking changes

## Conclusion

This design system provides a comprehensive foundation for building consistent, accessible, and maintainable user interfaces for the Drone Operations Management System. By following these guidelines, developers can create cohesive experiences that meet both user needs and technical requirements.

For questions or contributions to this design system, please refer to the project's contribution guidelines or contact the development team.
