import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDCK04kh06aX0xqPCTMFEENBZWlEktY9Xs",
    authDomain: "studentsathi-web.firebaseapp.com",
    projectId: "studentsathi-web",
    storageBucket: "studentsathi-web.firebasestorage.app",
    messagingSenderId: "261128024418",
    appId: "1:261128024418:web:db6def1b5e696143c93c3b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export instances for other files to use if they import app.js
export { auth, db, storage };

window.signup = async function() {
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const fieldOfStudy = document.getElementById("signup-class").value;
    const institution = document.getElementById("signup-institution").value;
    const errorEl = document.getElementById("error");

    if (!name || !email || !password || !fieldOfStudy) {
        errorEl.innerText = "Please fill all required fields.";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Save extra student info to Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            fieldOfStudy: fieldOfStudy,
            institution: institution,
            uid: user.uid,
            createdAt: serverTimestamp()
        });

        window.location = "dashboard.html";
    } catch (e) {
        errorEl.innerText = e.message;
    }
}

window.login = function() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location = "dashboard.html";
        })
        .catch(e => {
            document.getElementById("error").innerText = e.message;
        });
}

window.googleLogin = function() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const user = result.user;
            // Check if user exists in Firestore, if not create basic profile
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    name: user.displayName,
                    email: user.email,
                    uid: user.uid,
                    createdAt: serverTimestamp(),
                    fieldOfStudy: 'Not specified',
                    institution: 'Not specified'
                });
            }
            window.location = "dashboard.html";
        })
        .catch(e => {
            document.getElementById("error").innerText = e.message;
        });
}

window.logout = function() {
    signOut(auth)
        .then(() => {
            window.location = "index.html";
        })
}

onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    const isPublicPage = path.endsWith("index.html") || path === "/";

    if (!user && !isPublicPage) {
        window.location = "index.html";
    } else if (user && isPublicPage) {
        window.location = "dashboard.html";
    }
});
