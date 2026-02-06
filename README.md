# Cricket Scorer Mobile App

A React Native mobile application for cricket scoring with real-time match tracking, player statistics, and role-based dashboards.

## ✨ Features

### Authentication
- Email/Password authentication
- Google OAuth Sign-In
- Role-based access (Player/Scorer)
- Secure session management with Supabase

### For Players
- **Dashboard**: View upcoming matches and live scores
- **Live Match View**: Real-time score updates during matches
- **Statistics**: Personal batting/bowling stats with visualizations
- **Match History**: View past match performances
- **Profile Management**: Update profile and preferences
- **Guest Mode**: Browse live matches without login

### For Scorers
- **Match Creation**: Set up individual or team matches
- **Match Setup**: Configure teams, players, overs, and match details
- **Live Scoring**: Real-time ball-by-ball scoring interface
  - Track runs, wickets, extras, boundaries
  - Bowler/batsman management
  - Over-by-over tracking
- **Match Summary**: View completed match results
- **Dashboard**: Manage ongoing and past matches

### Onboarding
- Guided setup for new players and scorers
- Role-specific welcome flows

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/cricket-scorer-mobile.git
cd cricket-scorer-mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your Supabase credentials
```

4. **Start the development server**
```bash
npm start
```

5. **Run on your device**
```bash
# iOS
npm run ios

# Android
npm run android

# Or scan QR code with Expo Go app
```

## 📁 Project Structure

```
cricket-scorer-mobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Card.js
│   ├── screens/             # 20+ screen components
│   │   ├── Auth screens (Login, SignUp, RoleSelection)
│   │   ├── Player screens (Dashboard, Stats, History, LiveMatch)
│   │   ├── Scorer screens (Dashboard, CreateMatch, MatchSetup, LiveScoring)
│   │   ├── Onboarding screens
│   │   └── Shared screens (Splash, Profile, MatchSummary, Guest)
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── PlayerTabNavigator.js
│   │   └── ScorerTabNavigator.js
│   ├── services/            # API services
│   │   ├── authService.js
│   │   ├── userService.js
│   │   └── matchService.js
│   ├── contexts/            # React Context for state
│   │   └── AuthContext.js
│   ├── config/              # App configuration
│   │   └── supabase.js
│   └── theme/              # Design system
│       ├── colors.js
│       ├── typography.js
│       ├── spacing.js
│       ├── shadows.js
│       └── index.js
├── assets/                  # Images, fonts, icons
├── .env.example            # Environment variables template
├── App.js                  # Root component
└── package.json
```

## 🎨 Design System

### Color Palette
- **Primary**: Navy Blue (#1A3A52)
- **Accent**: Orange (#F59E0B)
- **Background**: Light Gray (#F5F5F5)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)

### Components
- **Button**: 4 variants (primary, secondary, outline, text) with loading states
- **Input**: With labels, icons, error states, and focus handling
- **Card**: Selectable cards with elevation and press effects

## 🛠️ Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Backend**: Supabase (Auth, Database, Real-time)
- **Styling**: React Native StyleSheet
- **Icons**: @expo/vector-icons (Ionicons)
- **OAuth**: expo-auth-session, expo-web-browser

## 🗄️ Database

The app uses Supabase PostgreSQL with the following main tables:
- `profiles` - User profiles with roles
- `matches` - Match information
- `match_players` - Player-match associations
- `innings` - Innings data
- `overs` - Over-by-over tracking
- `balls` - Ball-by-ball data

## 🔐 Environment Variables

Required variables in `.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `.env.example` for template.

## 📱 Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

### iOS (requires Apple Developer account)
```bash
eas build --platform ios --profile preview
```

## 🧪 Testing

Currently using manual testing. Run the app and test:
- Authentication flows (email, Google)
- Role-based navigation
- Match creation and scoring
- Real-time updates

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Sai Kranth K

## 🐛 Known Issues

- Google OAuth requires native build (doesn't work in Expo Go)
- Consider building with `eas build` for full OAuth testing

## 🚧 Future Enhancements

- Team match scoring (currently supports individual matches)
- Push notifications for match updates
- Social features (share matches, add friends)
- Advanced statistics and analytics
- Tournament management
