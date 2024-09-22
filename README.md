# Bitecho: Custom Git Implementation

**Bitecho** is a custom version control system (VCS) built using **Node.js** and **JavaScript**. This project mimics the core functionalities of Git, enabling efficient tracking of file changes, maintaining project history, and offering a command-line interface (CLI) for seamless version control operations.

## Features

- **Version Control System**:
  - Implemented key Git-like commands such as:
    - `init`: Initialize a new Bitecho repository.
    - `add`: Stage files for the next commit.
    - `commit`: Save changes to the repository.
    - `log`: Display a history of commits made to the project.

- **File Tracking & Integrity**:
  - Utilized **SHA-1 hashing** to track file contents securely and manage file versions.
  - Ensured reliable and consistent file tracking by leveraging a scalable **staging area (INDEX)**.

- **Storage Mechanism**:
  - Designed a robust file storage system with **parent-child relationships** to efficiently manage file changes between commits.
  - Optimized storage space using hashed file contents to avoid redundant data.

- **Command-Line Interface (CLI)**:
  - Developed a user-friendly CLI to interact with the version control system, enabling developers to easily manage and track project changes.

## Technologies Used

- **JavaScript**: Primary programming language for the version control system logic.
- **Node.js**: Server-side runtime for building and running the custom VCS.
