const firebaseConfig = {
    apiKey: "AIzaSyCptj_sJ76kGvgKNGA3AkHodRqTLF7YpyW",
    authDomain: "students-platform-d3b22.firebaseapp.com",
    projectId: "students-platform-d3b22",
    storageBucket: "students-platform-d3b22.firebasestorage.app",
    messagingSenderId: "569423259531",
    appId: "1:569423259531:web:8cacc08b1f903de174f18e",
    measurementId: "G-6YDCYNT2PY"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();