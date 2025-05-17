import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { ensureStorageDirs } from "./file-storage"

// Define user types
export type UserRole = "user" | "admin"

export interface User {
  id: string
  name: string
  email: string
  password: string // In a real app, this would be hashed
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserWithoutPassword {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

// Path to the users data file
const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")

// Ensure the data directory exists
export function ensureDataDir() {
  ensureStorageDirs()

  if (!fs.existsSync(USERS_FILE)) {
    // Create initial users file with default admin
    const initialUsers: User[] = [
      {
        id: uuidv4(),
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123", // In a real app, use bcrypt to hash passwords
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Regular User",
        email: "user@example.com",
        password: "user123",
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2))
  }
}

// Get all users
export function getAllUsers(): User[] {
  ensureDataDir()
  const data = fs.readFileSync(USERS_FILE, "utf8")
  return JSON.parse(data)
}

// Get all users without passwords
export function getAllUsersWithoutPasswords(): UserWithoutPassword[] {
  const users = getAllUsers()
  return users.map(({ password, ...user }) => user)
}

// Get user by email
export function getUserByEmail(email: string): User | undefined {
  const users = getAllUsers()
  return users.find((user) => user.email === email)
}

// Get user by ID
export function getUserById(id: string): User | undefined {
  const users = getAllUsers()
  return users.find((user) => user.id === id)
}

// Add a new user
export function addUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): User {
  const users = getAllUsers()

  // Check if email already exists
  if (users.some((user) => user.email === userData.email)) {
    throw new Error("Email already exists")
  }

  const newUser: User = {
    ...userData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users.push(newUser)
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))

  return newUser
}

// Update a user
export function updateUser(id: string, userData: Partial<Omit<User, "id" | "createdAt">>): User {
  const users = getAllUsers()
  const userIndex = users.findIndex((user) => user.id === id)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // If updating email, check if it already exists for another user
  if (userData.email && userData.email !== users[userIndex].email) {
    if (users.some((user) => user.email === userData.email && user.id !== id)) {
      throw new Error("Email already exists")
    }
  }

  users[userIndex] = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date().toISOString(),
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))

  return users[userIndex]
}

// Delete a user
export function deleteUser(id: string): void {
  const users = getAllUsers()
  const filteredUsers = users.filter((user) => user.id !== id)

  if (filteredUsers.length === users.length) {
    throw new Error("User not found")
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(filteredUsers, null, 2))
}

// Change user role
export function changeUserRole(id: string, role: UserRole): User {
  return updateUser(id, { role })
}
