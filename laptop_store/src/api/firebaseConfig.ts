import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCH8Q4JMSQRk2VqsJrFRAK8sIhOqAh7mqc",
    authDomain: "foodapp-3ca76.firebaseapp.com",
    projectId: "foodapp-3ca76",
    storageBucket: "foodapp-3ca76.firebasestorage.app",
    messagingSenderId: "699157366762",
    appId: "1:699157366762:web:de1848967754ed1edc1493",
    measurementId: "G-65E0N6X3LG"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Export các biến để trang Login có thể dùng
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

