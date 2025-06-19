# 📚 Abhyasalay Backend

Abhyasalay is an educational platform designed to streamline student assessments, performance tracking, and teacher-student interactions. This repository contains the backend codebase developed using **Node.js**, **Express**, and **MongoDB**, and deployed via **Google IDX**.

---

## 🚀 Features

- 👨‍🏫 **User Roles**: Teacher & Student
- 📋 **Student Management**: CRUD operations on student profiles
- 🧪 **Test Management**: Assign tests, view history, and track performance
- 💬 **Feedback System**: Students can receive and view teacher feedback
- 📅 **Upcoming Deadlines**: Automatically highlight upcoming test deadlines
- ☁️ **Cloudinary Integration**: Upload PDF/image test documents
- 🔐 **Authentication**: JWT-based login system
- 📦 **REST API**: Modular routes for each resource

---

## 🗂️ Project Structure

/controllers → Route logic (auth, tests, students, etc.)
/models → Mongoose models (Student, Teacher, Class, etc.)
/middlewares → JWT auth & Cloudinary file upload
/routers → Express routers
/utils → Database connection helper
/public → Public assets (e.g. CSS for custom frontend if needed)
index.js → Entry point (Express app configuration)

---

## 🛠️ Technologies Used

- **Node.js** & **Express.js**
- **MongoDB** with **Mongoose**
- **Cloudinary** for media uploads (PDFs/images)
- **JWT** for authentication
- **Google IDX** for cloud-based development
- **Git & GitHub** for version control and collaboration

---

## 🧑‍💻 Developer Setup

### ✅ Prerequisites

- Node.js (v18+)
- MongoDB Atlas URI
- Cloudinary credentials
- Git + GitHub account

### ⚙️ Installation

```bash
git clone git@github.com:GadeArjun/Abhyasalay-Backend.git
cd Abhyasalay-Backend
npm install


```
