Markdown
# video-tube | Production-Ready Video Hosting Backend

A fully-featured, production-ready RESTful API backend for a video-sharing platform modeled after YouTube. Engineered with Node.js, Express.js, and MongoDB, this project focuses on robust system architecture, complex data aggregation, secure state handling, and high-performance querying.

---

## 🛠️ Tech Stack & Core Dependencies

* **Runtime Environment:** Node.js
* **Web Framework:** Express.js
* **Database & ODM:** MongoDB & Mongoose
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **Media Handling:** Multer (Multipart Form Processing) & Cloudinary API
* **Querying & Performance:** MongoDB Aggregation Pipelines

---

## 🏗️ Key Architecture & Engineering Highlights

* **Advanced Aggregation Pipelines:** Handled relational data operations natively in MongoDB using `$lookup`, `$match`, `$addFields`, `$project`, and `$first` operators to avoid excessive application-layer processing.
* **Optimized Search & Pagination:** Built dynamic search, sorting, and filter endpoints using custom skip/limit parameters and aggregation pagination.
* **Payload Sanitization & Security:** Integrated JWT authentication middlewares, fine-grained document ownership verifications, and defensive API payload response formatting.
* **Atomic State Toggles:** Designed clean subscription and like toggling logic to manage relationships with single-query updates.

---

## 📂 Project Architecture (MVC Pattern)

```text
src/
├── controllers/    # Request handling & business logic execution
├── db/             # MongoDB connection setup
├── middlewares/    # Authentication, file upload, & error management
├── models/         # Mongoose schemas (User, Video, Like, Comment, etc.)
├── routes/         # Express endpoint declarations
├── utils/          # ApiError, ApiResponse, and Cloudinary handlers
├── app.js          # Express app configuration
└── index.js        # Server execution & port listening

1. Clone & Install
Bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
npm install
2. Environment Setup
Create a .env file in the root directory and configure the variables:

Code snippet
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
3. Run Application
Bash
# Development Mode
npm run dev

# Production Mode
npm start



***
