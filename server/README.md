# 🌙 Dreamio Server - Dream Journal API

Express.js backend server providing AI-powered dream analysis capabilities for the Dream Journal mobile application. Integrates with Ollama for local AI model processing and provides robust error handling with fallbacks.

![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18%2B-lightgrey?style=for-the-badge&logo=express)
![Ollama](https://img.shields.io/badge/Ollama-Latest-blue?style=for-the-badge)

## 🚀 Features

- **Dream Mood Analysis**: AI-powered emotional categorization
- **Dream Interpretation**: Intelligent analysis and insights
- **Health Monitoring**: Service status and availability checks
- **Error Handling**: Comprehensive error responses with fallbacks
- **CORS Support**: Cross-origin request handling
- **Rate Limiting**: Protection against abuse
- **Timeout Management**: Request timeout handling

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🛠️ Installation

### Prerequisites

- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)
- **Ollama** (for AI model processing)

### Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install and start Ollama**
   ```bash
   # Install Ollama (macOS/Linux)
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama service
   ollama serve
   
   # Install required model
   ollama pull mistral
   ```

4. **Create environment file** (optional)
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_MODEL=mistral

# Request Configuration
REQUEST_TIMEOUT=120000
HEALTH_CHECK_TIMEOUT=5000

# CORS Configuration
CORS_ORIGIN=*
```

### Ollama Models

Supported models for dream analysis:

- **mistral** (default) - Fast and accurate
- **llama2** - Good general purpose model
- **codellama** - Alternative option
- **neural-chat** - Conversational model

Install additional models:
```bash
ollama pull llama2
ollama pull neural-chat
```

## 🔌 API Endpoints

### Health Checks

#### `GET /health`
Basic server health check.

**Response:**
```json
{
  "status": "OK",
  "message": "Dream Journal API is running"
}
```

#### `GET /health/ollama`
Ollama service health check with model information.

**Response:**
```json
{
  "status": "OK",
  "message": "Ollama is running",
  "models": [
    {
      "name": "mistral:latest",
      "size": 4109363061
    }
  ]
}
```

### AI Processing

#### `POST /api/generate`
General AI text generation endpoint.

**Request Body:**
```json
{
  "prompt": "Your prompt text here",
  "model": "mistral" // optional
}
```

**Response:**
```json
{
  "response": "AI generated response text"
}
```

#### `POST /api/mood`
Dream mood analysis endpoint.

**Request Body:**
```json
{
  "dreamText": "I had a wonderful dream about flying through clouds..."
}
```

**Response:**
```json
{
  "mood": "joyful"
}
```

**Available Mood Tags:**
- `peaceful`, `joyful`, `exciting`, `curious`, `hopeful`
- `scary`, `anxious`, `sad`, `angry`, `confused`
- `mysterious`, `surreal`, `bizarre`, `overwhelming`
- `calm`, `neutral`, `mixed`

#### `POST /api/analyze`
Comprehensive dream analysis endpoint.

**Request Body:**
```json
{
  "dreamText": "Dream content to analyze",
  "dreamHistory": [
    {
      "title": "Previous Dream",
      "text": "Previous dream content...",
      "mood": "joyful"
    }
  ]
}
```

**Response:**
```json
{
  "analysis": "Detailed dream interpretation and insights..."
}
```

#### `POST /api/help`
Contextual help and assistance endpoint.

**Request Body:**
```json
{
  "question": "What does flying in dreams mean?",
  "dreamData": [
    {
      "title": "Flying Dream",
      "text": "I was flying over a city...",
      "mood": "exciting"
    }
  ]
}
```

**Response:**
```json
{
  "response": "Flying in dreams often represents..."
}
```

## 🚨 Error Handling

The API provides comprehensive error handling with appropriate HTTP status codes:

### Status Codes

- **200** - Success
- **400** - Bad Request (missing parameters)
- **408** - Request Timeout
- **503** - Service Unavailable (Ollama down)
- **500** - Internal Server Error

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "fallback": "Default response when applicable"
}
```

### Common Errors

#### Ollama Connection Issues
```json
{
  "error": "AI service unavailable",
  "message": "Ollama is not running. Please start Ollama or check your connection.",
  "fallback": "Unable to process request at this time."
}
```

#### Request Timeouts
```json
{
  "error": "Request timeout",
  "message": "AI service took too long to respond.",
  "fallback": "Unable to process request at this time."
}
```

## 🧪 Development

### Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Health checks
npm run health
npm run health:ollama

# Testing
npm test
npm run test:watch

# Code quality
npm run lint
npm run lint:fix
```

### Development Workflow

1. **Start Ollama** service
2. **Install models** you want to use
3. **Start development** server: `npm run dev`
4. **Test endpoints** using curl or Postman
5. **Monitor logs** for errors and performance

### API Testing

Test endpoints using curl:

```bash
# Test server health
curl http://localhost:3000/health

# Test Ollama health
curl http://localhost:3000/health/ollama

# Test mood analysis
curl -X POST http://localhost:3000/api/mood \
  -H "Content-Type: application/json" \
  -d '{"dreamText": "I had a scary nightmare about monsters"}'

# Test dream analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"dreamText": "I dreamed I was flying over mountains"}'
```

## 📊 Testing

### Unit Tests

Run the test suite:

```bash
npm test
```

### Coverage Report

Generate test coverage:

```bash
npm test -- --coverage
```

### Manual Testing

Use the included Postman collection or test with curl commands above.

## 🚀 Deployment

### Production Setup

1. **Install dependencies**
   ```bash
   npm ci --production
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

3. **Start with process manager**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "dreamio-server"
   
   # Using systemd
   sudo systemctl start dreamio-server
   ```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t dreamio-server .
docker run -p 3000:3000 dreamio-server
```

### Environment Considerations

- **Memory**: Minimum 512MB RAM
- **CPU**: 1+ cores recommended
- **Storage**: 2GB+ for models
- **Network**: Outbound access for model downloads

## 🔧 Troubleshooting

### Common Issues

#### Ollama Not Starting
```bash
# Check if Ollama is installed
ollama --version

# Start Ollama service
ollama serve

# Check if models are available
ollama list
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

#### Model Not Found
```bash
# Pull required model
ollama pull mistral

# Verify model is available
ollama list
```

#### High Memory Usage
- Consider using smaller models
- Limit concurrent requests
- Monitor system resources

### Logging

Enable debug logging:

```bash
DEBUG=dreamio:* npm start
```

View logs:

```bash
# Development
tail -f logs/development.log

# Production
tail -f logs/production.log
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using Node.js and Express**

*Powering AI-driven dream analysis for the Dreamio mobile application.* 