# MediQueue Server

Backend server for the MediQueue Tutor Booking System.

## 🌐 Live API
🔗 [Server URL Here](https://mediqueue-server-umber.vercel.app)

---

## 🚀 Features

- JWT token verification
- Tutor management API
- Booking management API
- MongoDB database integration
- Protected private routes
- Search and filter functionality

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- JOSE
- dotenv
- cors

---


## 🔑 API Endpoints

### Tutors
- `GET /tutors`
- `GET /tutors/:id`
- `POST /tutors`
- `PATCH /tutors/:id/decrease-slot`
- `DELETE /remove-my-tutor/:id`

### Bookings
- `POST /bookings`
- `GET /bookings/:id`
- `PATCH /update-status/:id`

---

## 🔐 Authentication

Protected routes use JWT token verification with Authorization headers.

Example:
```bash
Authorization: Bearer YOUR_TOKEN
```

---

## 👨‍💻 Developer

Minhaj