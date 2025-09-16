# 🐾 PetCarePlus

PetCarePlus is a **React Native + Firebase** mobile app designed to help pet owners manage their pets' **medical records, reminders, and personal details** in one place.  
Built with **Expo**, **Firebase Auth/Firestore**, and **Cloudinary** for file uploads.

---

## 🚀 Features

✅ **Authentication**
- User login & signup  
- Password change & account deletion  
- Profile editing with photo upload  

✅ **Pet Management**
- Add / Edit / Delete pets  
- Upload pet profile pictures (via Cloudinary)  
- Auto-delete pet’s reminders & records when pet is removed  

✅ **Medical Records**
- Add / Edit / Delete medical records  
- File upload support (images, PDFs)  
- Record export feature  

✅ **Reminders**
- Add / Edit / Delete reminders  
- Push notifications for daily, weekly, or one-time reminders  

✅ **Settings**
- Dark/Light mode toggle  
- Profile & password management  
- Notifications toggle  

✅ **UI/UX**
- Modern, clean interface with **Toast alerts**  
- Consistent theming across screens  
- Floating Action Buttons & Grid layouts  

---

## 🛠️ Tech Stack
- **Frontend:** React Native (Expo)  
- **Backend:** Firebase Firestore + Firebase Auth  
- **File Storage:** Cloudinary  
- **Notifications:** Expo Notifications  
- **State Management:** React Context API  

---

## 📸 Screenshots
(Add your screenshots here)  
- Login & Register  
- Dashboard  
- Pets Management  
- Records & Reminders  
- Settings  

---

## 📦 Installation

Clone the repo:

```bash
git clone https://github.com/your-username/PetCarePlus.git
cd PetCarePlus

# install dependencies
npm install

# start expo project
npx expo start

## ▶️ Running the App

- **Android:** Scan the QR code in Expo Go or run `npx expo run:android`  
- **iOS:** Run `npx expo run:ios` (macOS required)  
- **Web:** Run `npx expo start --web`
```

## 📲 APK Download
👉 [Download APK here](#) <!-- replace with your APK link -->


## 🎥 Demo Video
👉 [Watch on YouTube](#) <!-- replace with your YouTube demo link -->

## 📚 Documentation

- **Firestore Collections:**
  - `users` → user data, notifications settings  
  - `pets` → pet profiles  
  - `records` → medical records (with file URLs from Cloudinary)  
  - `reminders` → scheduled reminders  

- **Media Uploads:** Images/PDFs uploaded to Cloudinary → stored as secure URLs in Firestore.  
- **Notifications:** Scheduled using Expo Notifications for one-time, daily, or weekly triggers.  

## 👨‍💻 Author
**Shewmi Nehara Peiris**  
- 🌐 [Portfolio](https://nehara.dev)  
- 💼 [LinkedIn](https://linkedin.com/in/nehara-peiris-485361280)  
- 📂 [GitHub](https://github.com/nehara-peiris)

---
This project was built as part of the **AMD Coursework** at **IJSE**.

