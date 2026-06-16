# Secure Full-Stack Lobby Visitor Management Kiosk

A modern, production-styled, enterprise-grade Lobby Visitor Management application designed to handle operational facility security logs. Built using a decoupled full-stack architecture, this application automates the entire visitor lifecycle (Arrival → Real-Time Analytics → Administrative Management → Departure → Audit Logging) while strictly enforcing corporate data privacy.

---

## 🚀 Key Features

* **Public Check-In Kiosk UI:** A streamlined, highly responsive data-ingestion form complete with animated focus rings and real-time validation for client entry.
* **Secure Access Control Wall:** The administrative dashboard, metrics bars, and raw visitor histories are entirely restricted behind a client-side passcode-guarded wall to eliminate public data visibility and protect corporate privacy.
* **Real-Time Analytics Dashboard:** Aggregates live database inputs on the fly using in-memory array streams to compute key performance indicators (KPIs) including *Total Visitor Traffic Volume*, *Active Lobby Occupancy*, and *Average Visit Duration (Minutes Elapsed)*.
* **Instant Case-Insensitive Search:** A cross-property query engine that filters database lists dynamically as a staff member types, matching entries against both names and specific visit purposes.
* **State-Driven Lifecycle Mutators:** Allows administrators to process departure timestamps with a single click. Completed rows visually scale down in opacity, update temporal logs, and replace interactive states with semantic green "Completed" status badges.
* **Dynamic Data Exporter (CSV Download):** Compiles live frontend datasets into formal, spreadsheet-ready CSV downloads via programmatic browser-blob serialization. It seamlessly inherits current search criteria to enable context-aware data audit reporting.

---

## 🛠️ Tech Stack & System Architecture

The system utilizes a modern, decoupled architecture communicating across asynchronous network boundaries:

* **Frontend Client:** React, HTML5, CSS3 (Component-driven style separation layout), JavaScript (ES6+), Native Fetch API.
* **Backend API Layer:** Node.js, Express.js framework, Cross-Origin Resource Sharing (`cors`) middleware.
* **Database Engine:** PostgreSQL (Relational management with sanitized parameterized queries to eliminate SQL Injection vulnerabilities).

---

## 📁 Repository Structure

```text
Lobby_Login_App/
├── backend/
│   ├── server.js          # Express server configuration & API routing boundaries
│   ├── package.json       # Node dependencies & execution scripts
│   └── .env               # Local system environment connection variables (Secret)
├── frontend/
│   ├── src/
│   │   ├── App.js         # Unified React layout, client states, and analytics algorithms
│   │   └── App.css        # Extracted enterprise layout design sheets
│   └── package.json       # React dependencies & build configurations
└── README.md              # Documentation manual