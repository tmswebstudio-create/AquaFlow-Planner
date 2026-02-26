# **App Name**: AquaFlow Planner

## Core Features:

- Daily Active Schedule Definition: Users set their wake-up and sleep times, which dynamically define their daily active period.
- Task Creation and Input: Users can add tasks with a required title, an optional link, a specified date, and an optional time, ensuring no empty titles are allowed.
- Dynamic Task Display & Filtering: Tasks are automatically grouped and displayed by their assigned date, with today's date highlighted. Users can filter tasks by status (All, Completed, Incomplete).
- Task Interaction & Visual Feedback: Each task card features an 'Open Link' button to external resources and a 'Complete' toggle that applies strikethrough text and a faded appearance upon completion.
- Local Data Persistence: All user-defined schedules and task data are seamlessly stored and retrieved from the browser's localStorage, requiring no backend.

## Style Guidelines:

- Primary color: A clear, calming blue (`#3386D9`) representing focus and organization. (HSL: 215, 60%, 50%)
- Background color: A very light, desaturated blue (`#E6ECF2`) to maintain a clean and airy feel. (HSL: 215, 20%, 95%)
- Accent color: A deep, refreshing teal (`#2999A7`) to highlight interactive elements and provide contrast. (HSL: 185, 60%, 40%)
- Headline and body font: 'Inter', a grotesque sans-serif, chosen for its modern, clean, and highly readable qualities, supporting a minimalistic aesthetic.
- Utilize a minimal set of outlined vector icons, consistent in style, to enhance clarity without cluttering the interface.
- Implement a fully responsive, card-based layout for tasks, ensuring optimal display and usability across all device sizes (mobile and desktop).
- Incorporate smooth, subtle hover effects and transition animations on interactive elements and task updates to provide an engaging user experience.