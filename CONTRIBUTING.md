# Contributing to HarvestIQ

Thank you for your interest in contributing to HarvestIQ! We welcome contributions from the community and are grateful for every pull request, issue report, and feature suggestion.

---

## 🚀 How to Contribute

### 1. Report Bugs
If you find a bug, please:
- Check if the issue already exists
- Provide a clear description of the bug
- Include steps to reproduce
- Share screenshots if applicable
- Mention your environment (OS, Node version, Python version, etc.)

### 2. Suggest Features
Great ideas are always welcome! Please:
- Check if the feature was already requested
- Describe the feature and its use case
- Explain the expected behavior
- Add links to related issues or discussions

### 3. Submit Code Changes

#### Fork & Clone
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/yourusername/HarvestIQ.git
cd HarvestIQ
```

#### Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/bug-description
```

#### Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Don't modify unrelated files

#### Test Your Changes
```bash
# Frontend
npm run lint --workspace=frontend
npm run build --workspace=frontend

# Backend
cd backend && npm run test

# Python
cd Pymodel && python -m pytest
```

#### Commit Changes
```bash
git add .
git commit -m "feat: Add meaningful description of changes"
```

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code refactoring
- `test:` for tests
- `chore:` for maintenance

#### Push & Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:
- Clear title & description
- Link to related issues
- Screenshots for UI changes
- Testing notes

---

## 📋 Code Style Guidelines

### Frontend (React/JavaScript)
```javascript
// Use const/let, not var
const myVariable = 'value';

// Use arrow functions
const myFunction = () => {
  // function body
};

// Use descriptive names
const getUserProfile = () => { /* ... */ };

// Add JSDoc comments for complex functions
/**
 * Fetches user predictions from the API
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of predictions
 */
const fetchUserPredictions = (userId) => { /* ... */ };
```

### Backend (Express/Node.js)
```javascript
// Use consistent naming for routes
app.post('/api/predictions', authMiddleware, createPrediction);

// Handle errors consistently
try {
  // operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

// Validate inputs
const { error, value } = predictionSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details });
}
```

### Python (FastAPI)
```python
# Use type hints
from typing import List, Optional

def calculate_yield(
    soil_data: dict, 
    weather_data: dict
) -> float:
    """Calculate crop yield based on soil and weather data."""
    # implementation
    return yield_estimate

# Use docstrings
def predict_crop_yield(crop_type: str) -> PredictionResult:
    """
    Predict crop yield for the given crop type.
    
    Args:
        crop_type: Type of crop (e.g., 'maize', 'wheat')
    
    Returns:
        PredictionResult with yield and confidence
    """
    pass
```

---

## 📝 Documentation Standards

### Comments
- Explain the "why", not just the "what"
- Keep comments up-to-date with code changes
- Use TODO/FIXME for known issues

### README Updates
- Update relevant markdown files
- Add examples for new features
- Keep documentation in sync with code

### API Documentation
```javascript
/**
 * POST /api/predictions
 * Create a new prediction
 * 
 * @param {Object} body - Request body
 * @param {string} body.cropType - Type of crop
 * @param {Object} body.soilData - Soil parameters
 * @returns {Object} Prediction result with ID and yield estimate
 * @throws {400} Invalid input data
 * @throws {401} Unauthorized
 */
```

---

## 🧪 Testing

### Frontend Tests
```bash
# Run linting
npm run lint --workspace=frontend

# Build check
npm run build --workspace=frontend
```

### Backend Tests
```bash
cd backend
npm test
```

### Manual Testing
- Test on multiple browsers
- Test on mobile devices
- Test with different languages
- Verify error handling

---

## 🔍 Code Review Process

1. **Automated Checks**
   - Linting passes
   - Build succeeds
   - Tests pass (when available)

2. **Manual Review**
   - Code quality
   - Performance impact
   - Security considerations
   - Documentation

3. **Testing**
   - Functionality works as expected
   - No regressions introduced
   - Edge cases handled

---

## 📚 Development Setup

### Setup Development Environment
```bash
# Clone and install
git clone https://github.com/yourusername/HarvestIQ.git
cd HarvestIQ

# Install dependencies
npm install --workspace=frontend
npm install --workspace=backend
cd Pymodel && pip install -r requirements.txt

# Create .env files (see README.md for template)
cp backend/.env.example backend/.env
cp Pymodel/.env.example Pymodel/.env

# Start development
.\start-all.bat  # Windows
# or start services individually
```

### Useful Commands
```bash
# Frontend development with HMR
npm run dev --workspace=frontend

# Backend with auto-reload
npm run dev --workspace=backend

# Linting
npm run lint --workspace=frontend

# Build for production
npm run build --workspace=frontend
```

---

## 🐛 Bug Report Template

```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots/Logs
(if applicable)

## Environment
- OS: Windows/Mac/Linux
- Node version: v16.x
- Python version: 3.9.x
- Browser: Chrome/Firefox/Safari
```

---

## ✨ Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternative Solutions
Other approaches considered

## Additional Context
Screenshots, links, etc.
```

---

## ⚠️ Important Notes

### Before You Start
- Check existing issues and PRs to avoid duplicates
- Discuss major changes in an issue first
- Follow the code of conduct

### During Development
- Keep commits atomic and meaningful
- Don't commit debugging code or console.logs
- Test thoroughly before submitting
- Update related documentation

### Before Submitting PR
- Rebase on latest main branch
- Squash related commits if needed
- Write clear commit messages
- Add tests for new features
- Update documentation

---

## 💬 Communication

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an Issue with bug label
- **Features**: Create an Issue with enhancement label
- **Security**: Email security@harvestiq.com (don't open public issue)

---

## 🎯 Areas We Need Help

- [ ] Testing and bug reports
- [ ] Documentation improvements
- [ ] Translation to new languages
- [ ] Performance optimizations
- [ ] New features and algorithms
- [ ] UI/UX improvements
- [ ] DevOps and deployment
- [ ] Mobile app development

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You

Thank you for contributing to HarvestIQ! Together, we're building tools to help farmers worldwide. Your contributions, no matter how big or small, make a real difference.

**Happy coding! 🌾**
