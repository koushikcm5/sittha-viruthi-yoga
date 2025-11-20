========================================
REACT NATIVE AUTH APP - QUICK START
========================================

IMPORTANT: The app is NOT running because MySQL password is not configured!

FOLLOW THESE STEPS IN ORDER:

1. RUN: TEST-SETUP.bat
   - This checks if all requirements are installed

2. RUN: FIX-MYSQL-PASSWORD.bat
   - This configures MySQL password
   - Choose option 1 if you know your password
   - Choose option 2 to remove password (dev only)

3. RUN: START-BACKEND.bat
   - This starts the backend server on port 9000
   - Wait until you see "Started YogaAttendanceApplication"

4. RUN: RUN-APP.bat
   - This starts the React Native app
   - Press 'a' for Android or 'i' for iOS

5. LOGIN:
   - Username: admin
   - Password: admin123

========================================
TROUBLESHOOTING
========================================

If backend fails to start:
- Check MySQL is running
- Verify password in backend\src\main\resources\application.properties
- Check COMPLETE-SETUP.md for detailed instructions

If frontend can't connect:
- Make sure backend is running (check port 9000)
- Update API URL in src\services\api.js based on your device:
  * Physical device: http://10.64.49.108:9000/api
  * Android emulator: http://10.0.2.2:9000/api
  * iOS simulator: http://localhost:9000/api

========================================
CURRENT STATUS
========================================

✓ Frontend code: Ready
✓ Backend code: Ready
✓ Security fixes: Applied
✗ MySQL password: NOT CONFIGURED
✗ Backend: NOT RUNNING
✗ Frontend: NOT RUNNING

Run TEST-SETUP.bat to begin!
