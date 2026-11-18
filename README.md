# NQT Daily — TCS NQT Prime daily prep (Android)

Each day: 1 DSA question, 1 system design concept, and fresh aptitude, reasoning and verbal sets.
Light/dark theme with a lime accent. All progress is stored locally on the phone. A daily notification says "Today's DSA question is …".

## Get the APK (about 5 minutes, no Android Studio needed)
1. Create a new GitHub repository and upload everything in this folder (keep the `.github` folder).
2. Open the repo's **Actions** tab → **Build APK** → wait for the green tick (about 4–6 min). You can also press "Run workflow".
3. Open the finished run → **Artifacts** → download **NQT-Daily-APK** → unzip → `app-debug.apk`.
4. Copy it to your phone and install (allow "Install unknown apps"). Open the app → Settings → Enable reminders.

## Or build locally
`npm install && npx cap add android && npx cap sync android && cd android && ./gradlew assembleDebug`
Add `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM` permissions to `AndroidManifest.xml` (the workflow does this automatically).

## Content
Edit `www/data.js` to add DSA questions, system design concepts and verbal items. Aptitude and reasoning are generated daily in `www/gen.js`.
