import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCH8Q4JMSQRk2VqsJrFRAK8sIhOqAh7mqc",
    authDomain: "foodapp-3ca76.firebaseapp.com",
    projectId: "foodapp-3ca76",
    storageBucket: "foodapp-3ca76.firebasestorage.app",
    messagingSenderId: "699157366762",
    appId: "1:699157366762:web:de1848967754ed1edc1493",
    measurementId: "G-65E0N6X3LG"
};
// const firebaseConfig = {
//     apiKey: "AIzaSyBMNfO_77a-3ljhKXcfFN7oSoUCfRze3Zg",
//     authDomain: "laptopstore-fd462.firebaseapp.com",
//     projectId: "laptopstore-fd462",
//     storageBucket: "laptopstore-fd462.firebasestorage.app",
//     messagingSenderId: "566339147821",
//     appId: "1:566339147821:web:b237ac137fe2cc130fc0a4",
//     measurementId: "G-KB4DNKQ6EJ"
// };

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Export các biến để trang Login có thể dùng
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

