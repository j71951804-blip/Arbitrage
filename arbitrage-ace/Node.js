# Create backend directory
mkdir arbitrage-ace-backend
cd arbitrage-ace-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv axios mongoose bcryptjs jsonwebtoken
npm install -D nodemon @types/node typescript ts-node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken

# Initialize TypeScript
npx tsc --init
