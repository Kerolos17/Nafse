# Project Structure

## File Organization

```
/
├── .kiro/
│   └── steering/          # AI assistant steering documents
├── index.html             # Complete single-page application
```

## Code Organization within index.html

The single HTML file is organized into distinct sections:

### 1. Head Section

- Meta tags and viewport configuration
- Google Fonts imports (Cairo, Tajawal)
- Tailwind CSS configuration
- Custom CSS variables and styling
- Component styles (cards, buttons, modals, etc.)

### 2. Body Structure

- Background decorative elements (orbs, grain texture)
- Setup screen (initial user onboarding)
- Main application container with:
  - Sticky header with navigation
  - Four main pages: Dashboard, Today, Plan, Progress
  - Modals for user interactions
  - Toast notification system

### 3. JavaScript State Management

- Global `state` object containing:
  - User profile (name, goal)
  - Start date
  - Habits array
  - Days object (keyed by ISO date)
  - Settings
- localStorage persistence layer

### 4. JavaScript Functions

Organized by feature area:

- **Init/Setup**: `init()`, `startJourney()`, `save()`
- **Navigation**: `showPage()`
- **Core Logic**: `getDayNumber()`, `calculateStreak()`, `getTodayCompletion()`
- **UI Updates**: `updateAll()`, `updateDashboard()`, `renderToday()`
- **Calendar**: `renderCalendar()`, `switchView()`
- **Habits**: `toggleHabit()`, `addHabit()`, `removeHabit()`
- **Timer**: `toggleTimer()`, `resetTimer()`, `updateTimerDisplay()`
- **Data**: `exportData()`

## Design Patterns

- **Single-page application (SPA)**: Page switching via CSS classes
- **State-driven UI**: All UI updates derive from central state object
- **Event-driven**: User interactions trigger state changes and re-renders
- **Local-first**: All data stored in browser localStorage
