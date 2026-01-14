# Firebase Setup for Message Persistence

To make messages persist across devices and show on the official site, follow these steps:

## 1. Create a Firebase Project
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" and sign in with Google
3. Create a new project called "liefje-birthday"
4. Enable Realtime Database

## 2. Get Your Firebase Config
After creating the database, you'll get a config object. Copy it.

## 3. Add Firebase to the Website
Add this to `index.html` before the closing `</body>` tag:

```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js"></script>
<script>
  // Replace with your Firebase config
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  firebase.initializeApp(firebaseConfig);
  window.firebaseDb = firebase.database();
</script>
```

## 4. Enable Anonymous Authentication
- In Firebase Console → Authentication → Sign-in method
- Enable "Anonymous"

## 5. Set Database Rules
In Firebase Console → Realtime Database → Rules, replace with:

```json
{
  "rules": {
    "messages": {
      ".read": true,
      ".write": true,
      "$uid": {
        ".validate": "newData.hasChildren(['name', 'text', 'time'])"
      }
    }
  }
}
```

## 6. Enable Firebase in main.js
Uncomment the Firebase sync line in the `initMessages()` function in `assets/js/main.js`.

That's it! Messages will now sync to Firebase and be visible everywhere.
