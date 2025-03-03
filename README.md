# 💰 Money Manager Frontend (Vite + Vue 3)

This is the **frontend** of the **Money Manager** application, built with **Vue 3**, **Vite**, **Pinia**, and **Tailwind CSS**. It allows users to track transactions, manage expenses, and categorize income/expenses.

## 🚀 Features
- User Authentication (Login, Signup)
- Manage Income & Expenses
- Category-based Transactions
- Group-based Management
- File Upload (Proof of Transactions)
- Dashboard & Analytics
- Responsive UI (Tailwind CSS)
- REST API Integration with Laravel Backend

## 🏗️ Tech Stack
- **Vue 3** (Composition API, Script Setup)
- **Vite** (Fast Development Server)
- **Pinia** (State Management)
- **Tailwind CSS** (Styling)
- **Axios** (API Calls)
- **Vue Router** (Navigation)
- **Laravel API Backend** (Separate Repository)

---

## 📦 Installation
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/yourusername/money-manager-frontend.git
cd money-manager-frontend
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Create .env File
Create a .env file in the project root and set up your backend API URL:
```ini
VITE_API_URL=http://your-backend-api-url/api
```

### 4️⃣ Run Development Server
```sh
npm run dev
```
The frontend will be available at `http://localhost:5173/`.

## 🛠 Build for Production
To generate the optimized production build:
```sh
npm run build
```

## 🔗 API Configuration
The frontend communicates with the Laravel backend. Update `VITE_API_URL` in `.env` to point to your backend URL.
Example:
```sh
VITE_API_URL=http://12.34.5.67/api
```

## 🔧 Project Structure
```php
├── src
│   ├── assets          # Static assets
│   ├── components      # Reusable Vue components
│   ├── views           # Page-level Vue components
│   ├── stores          # Pinia state management
│   ├── services        # API service (Axios)
│   ├── router          # Vue Router configuration
│   ├── main.js         # Main Vue app entry
│   ├── App.vue         # Root Vue component
│   └── styles.css      # Global styles
├── public              # Static files
├── vite.config.js      # Vite configuration
└── package.json        # Project dependencies
```

## 🤝 Contributing
Fork the repository.
Create a new branch (`git checkout -b feature-branch`).
Commit changes (`git commit -m "Add new feature"`).
Push the branch (`git push origin feature-branch`).
Open a Pull Request.

## 📝 License
This project is licensed under the MIT License.