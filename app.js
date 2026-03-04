import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

window.signup = function(){

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

createUserWithEmailAndPassword(auth,email,password)

.then(()=>{

window.location="dashboard.html";

})

.catch(e=>{

document.getElementById("error").innerText=e.message;

})

}

window.login=function(){

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

signInWithEmailAndPassword(auth,email,password)

.then(()=>{

window.location="dashboard.html";

})

.catch(e=>{

document.getElementById("error").innerText=e.message;

})

}

window.googleLogin=function(){

const provider=new GoogleAuthProvider();

signInWithPopup(auth,provider)

.then(()=>{

window.location="dashboard.html";

})

.catch(e=>{

document.getElementById("error").innerText=e.message;

})

}

window.logout=function(){

signOut(auth)

.then(()=>{

window.location="index.html";

})

}

onAuthStateChanged(auth,(user)=>{

if(!user && location.pathname.includes("dashboard")){

window.location="index.html";

}

});
