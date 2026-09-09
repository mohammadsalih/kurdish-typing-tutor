⌨️ Kurdish (Sorani) Typing Tutor | فێربوونی تایپی کوردی

A modern, open-source web application designed to help users learn and master Kurdish (Sorani) touch typing. Whether you are a beginner memorizing the standard Sorani keyboard layout or a professional aiming to increase your Words Per Minute (WPM), this typing tutor offers a gamified, step-by-step curriculum.

✨ Key Features

Master the Sorani Layout: A comprehensive milestone-based curriculum that teaches the Kurdish keyboard step-by-step, starting from the home row anchors.

1-Minute WPM Speed Test (تاقیکردنەوەی خێرایی): Test your Kurdish typing speed and accuracy using a curated database of meaningful Sorani literature and poetry.

Interactive 3D Kurdish Keyboard: A fully mapped digital keyboard supporting all standard Windows Sorani shift-state modifiers (dynamically swapping keys like 'ل' to 'ڵ', 'س' to 'ش').

Optimized Kurdish Typography: Pixel-perfect font rendering tailored specifically for the Kurdish alphabet, ensuring clear visual distinctions between characters like the initial "he" (هـ) and the final "e" (ە).

Audio-Visual Feedback: Immersive glassmorphism UI with Right-to-Left (RTL) support, mechanical keystroke sound effects, and rewarding Kurdish voiceover hooks (e.g., "ئافەرین").

Secure Cloud Progression: Powered by Firebase Firestore to securely track highest unlocked levels, XP, and server-side daily learning streaks.

🛠️ Tech Stack

Frontend: React, Next.js, Tailwind CSS

Backend & Auth: Firebase Firestore, Firebase Authentication

Styling & Layout: CSS Modules, strict RTL directionality (dir="rtl", lang="ku")

Deployment: Ready for Netlify / Vercel

🚀 Getting Started

Prerequisites

Node.js (v18 or higher)

A Google Firebase project (Firestore and Authentication enabled)

Installation

Clone the repository:

git clone https://github.com/mohammadsalih/kurdish-typing-tutor.git
cd kurdish-typing-tutor

Install dependencies:

npm install

Configure Environment Variables:
Create a .env.local file in the root directory and add your Firebase credentials to connect to your database:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

Run the development server:

npm run dev

Open http://localhost:3000 in your browser to start typing.

🤝 Contributing

Contributions, issues, and feature requests are welcome! If you have suggestions for adding new Kurdish poems to the speed test or improving the keyboard layout, feel free to open a pull request.