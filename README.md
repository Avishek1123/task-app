# NQT Daily — TCS NQT Prime plans (Android)

The day-by-day plans from the desktop Prime planner:

- **28-Day Revision** — for someone who already knows arrays, strings, two pointers, sliding window, hash maps, stacks and recursion
- **30-Day Sprint**
- **45-Day Focus** — complete enough to clear Prime on its own
- **60-Day Steady**
- **90-Day Mastery**

Each day has the real focus, study notes and task checkboxes. After a plan ends you can add extension weeks (coding sprint, aptitude, reasoning and verbal, weak-topic surgery, a full mock, review, light day). Progress stays on the phone. The daily reminder names that day's topic.

## Get the APK (about 5 minutes, no Android Studio needed)
1. Push this folder to GitHub (keep the `.github` folder).
2. Open the repo's **Actions** tab → **Build APK** → wait for the green tick (about 4–6 min). You can also press "Run workflow".
3. Open the finished run → **Artifacts** → download **NQT-Daily-APK** → unzip → `app-debug.apk`.
4. Copy it to your phone and install (allow "Install unknown apps"). Open the app → Settings → Enable reminders.

## Or build locally
`npm install && npx cap add android && npx cap sync android && cd android && ./gradlew assembleDebug`
Add `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM` permissions to `AndroidManifest.xml` (the workflow does this automatically).

## Content
The plans live in `www/plans.js` (28, 30, 45, 60, 90 days, the extension-week template, and the exam guide).
