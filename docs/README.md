# Project Documentation

This directory contains detailed technical docs and references.

## 📚 Document List

### Architecture & Design

#### [ARCHITECTURE.md](./ARCHITECTURE.md)

Project architecture overview, including:

- Tech stack
- Directory structure
- Layered architecture (API → Repository → Data sources)
- Data flow
- Key design decisions

**Good for**:

- New contributors learning architecture
- Preparing refactors or large features
- Understanding design philosophy

---

#### [REPOSITORY.md](./REPOSITORY.md)

Repository pattern details, including:

- Principles
- Application in this project
- How to add new repositories
- Best practices and anti‑patterns

**Good for**:

- Adding new data access layers
- Understanding how DB operations are organized
- Learning to separate business logic from data access

---

### Development Guides

#### [DEVELOPMENT.md](./DEVELOPMENT.md)

Complete development guide, including:

- Environment setup
- Commands explained
- Code quality & best practices
- Debugging tips
- Troubleshooting

**Good for**:

- Day‑to‑day development reference
- Fixing local env issues
- Learning project standards

---

#### [MIGRATIONS.md](./MIGRATIONS.md)

Database migrations guide, including:

- Wrangler migration system
- Creating migration files
- Naming conventions
- Multi‑environment management
- Rollback strategy

**Good for**:

- Modifying database schema
- Investigating migration issues
- Preparing releases with DB changes

---

### Deployment & Operations

#### [DEPLOYMENT.md](./DEPLOYMENT.md)

Deployment workflow and configuration, including:

- CI/CD pipelines
- Multi‑environment setup (dev/test/prod)
- Pre‑deploy checklist
- Troubleshooting
- Rollback

**Good for**:

- Configuring CI/CD
- Preparing prod deployment
- Investigating deployment failures

---

#### [ENVIRONMENTS.md](./ENVIRONMENTS.md)

Bindings and secrets, including:

- Wrangler config differences across environments
- D1, R2, KV binding names
- GitHub secrets and branches
- Seeding script usage

**Good for**:

- Creating or validating Cloudflare resources
- Troubleshooting binding mismatches
- Explaining deploy preparation to the team

---

## 📖 Organization

### Root vs docs/

**Root docs** (high‑traffic, core):

- `README.md` - Project overview
- `QUICKSTART.md` - Quick Start guide
- `CHANGELOG.md` - Changelog

**docs/** (in‑depth, detailed references):

- Architecture documents
- Detailed development guides
- Deployment manual
- Specialized feature docs

### Module docs

Some modules have their own README.md:

- `types/README.md` - Type definitions usage
- Others can be added as needed

---

## 🗺️ Reading Paths

### New contributor onboarding

1. [../README.md](../README.md) - Project overview
2. [../QUICKSTART.md](../QUICKSTART.md) - Set up development environment
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand overall architecture
4. [DEVELOPMENT.md](./DEVELOPMENT.md) - Start developing

### Adding new features

1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Decide which layer to implement
2. [REPOSITORY.md](./REPOSITORY.md) - If it involves DB operations
3. [MIGRATIONS.md](./MIGRATIONS.md) - If schema changes are required
4. [DEVELOPMENT.md](./DEVELOPMENT.md) - Development standards reference

### Preparing a release

1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Pre‑deploy checklist
2. [../CHANGELOG.md](../CHANGELOG.md) - Review generated changelog

---

## 📝 Maintenance

### When to update docs

- ✅ Add new features → update related technical docs
- ✅ Architecture changes → update ARCHITECTURE.md
- ✅ Deployment process changes → update DEPLOYMENT.md
- ✅ Found documentation errors → fix immediately

### Writing guidelines

1. **Use clear heading levels**
   - H1 (`#`) - Document title
   - H2 (`##`) - Main sections
   - H3 (`###`) - Subsections

2. **Provide code examples**

   ```typescript
   // Good docs include runnable examples
   const example = 'like this';
   ```

3. **Use tables and lists**
   - Easy to scan
   - Improves readability

4. **Add links**
   - Cross‑reference related docs
   - Link to external resources

---

## 🔍 Quick Find

### I want to...

- **Understand architecture** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Start developing** → [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Change database** → [MIGRATIONS.md](./MIGRATIONS.md)
- **Learn Repository pattern** → [REPOSITORY.md](./REPOSITORY.md)
- **Deploy to production** → [DEPLOYMENT.md](./DEPLOYMENT.md)

### Troubleshooting

- **Local dev issues** → [DEVELOPMENT.md#troubleshooting](./DEVELOPMENT.md#troubleshooting)
- **Deploy failures** → [DEPLOYMENT.md#troubleshooting](./DEPLOYMENT.md#troubleshooting)
- **Migration errors** → [MIGRATIONS.md](./MIGRATIONS.md)

---

## 🤝 Contributing to Docs

Found issues or have improvements?

1. Open an issue explaining the problem
2. Or submit a PR with changes
3. Follow the existing structure and style

---

Tip: Start from root [README.md](../README.md) to browse project docs.
