# Home Safety & Surveillance App

A mobile application for home surveillance that monitors predefined boundaries within camera views. The app detects human movement, sends alerts, and provides real-time video streaming with activity logging.

## Features

- User Authentication (Sign Up/Login)
- Real-time Video Streaming
- AI-powered Human Detection
- Activity Logging
- Alert System

## Tech Stack

- Frontend: React Native with TypeScript
- Backend/Database: Supabase
- UI Framework: React Native Paper
- AI Processing: DeepSeek

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd HomeSafetyApp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm start
```

5. Run on your device:
- iOS: Press 'i' in the terminal or scan the QR code with your iPhone camera
- Android: Press 'a' in the terminal or scan the QR code with the Expo Go app

## Project Structure

```
HomeSafetyApp/
├── app/                    # Main application screens
│   ├── index.tsx          # Welcome screen
│   └── auth/              # Authentication screens
│       ├── login.tsx      # Login screen
│       └── signup.tsx     # Sign up screen
├── lib/                   # Utility functions and configurations
│   └── supabase.ts       # Supabase client configuration
├── assets/               # Static assets (images, fonts, etc.)
└── .env                  # Environment variables
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 