# PERN + Apollo GraphQL + Knex + Docker

This is a modern, modular monorepo featuring an Express & Apollo Server backend, a React frontend powered by Axios, and an isolated testing pipeline.

## 🚀 Quick Start (Local Development)

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

---

### 1. Database Setup
Spin up the local PostgreSQL development container:
```bash
cd backend
docker-compose up -d
