To create unit and end-to-end tests for your application using Jest and Supertest, you need to ensure that each endpoint behaves as expected under various scenarios. Below is a set of test cases that cover the given requirements.

1. *Unit Tests for Token Generation and Organisation Access Control*

2. *End-to-End Tests for the Registration and Login Endpoints*

First, install the necessary dependencies if you haven't already:
bash
npm install --save-dev jest supertest


### Unit Tests

*Token Generation Test*
javascript
// tests/token.spec.js

const jwt = require("jsonwebtoken");
const { generateToken } = require('../path_to_your_code'); // adjust the path
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Token Generation', () => {
    it('should generate a token with correct expiry and user details', () => {
        const user = { userId: '123', email: 'test@example.com' };
        const token = generateToken(user);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.userId).toBe(user.userId);
        expect(decoded.email).toBe(user.email);
        expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
});


*Organisation Access Control Test*
javascript
// tests/organisation.spec.js

const request = require('supertest');
const app = require('../path_to_your_app'); // adjust the path

describe('Organisation Access Control', () => {
    it('should not allow access to organisations user does not belong to', async () => {
        const userToken = 'your_mocked_token'; // Mock token for a user not belonging to the organisation
        const response = await request(app)
            .get('/api/organisations/some_org_id')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User doesn't belong to any organisation with the specified id");
    });
});


### End-to-End Tests

*Registration and Login Test*
javascript
// tests/auth.spec.js

const request = require('supertest');
const app = require('../path_to_your_app'); // adjust the path
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
    afterAll(async () => {
        await prisma.user.deleteMany({});
        await prisma.organisation.deleteMany({});
        await prisma.$disconnect();
    });

    it('should register user successfully with default organisation', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '1234567890',
                password: 'password123'
            });

        expect(response.status).toBe(201);
        expect(response.body.data.userId).toBeDefined();
        expect(response.body.data.accessToken).toBeDefined();

        const user = await prisma.user.findUnique({ where: { email: 'john.doe@example.com' } });
        expect(user).not.toBeNull();

        const organisation = await prisma.organisation.findFirst({ where: { users: { some: { userId: user.userId } } } });
        expect(organisation).not.toBeNull();
        expect(organisation.name).toBe("John's Organisation");
    });

    it('should log the user in successfully', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'john.doe@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).toBeDefined();
        expect(response.body.data.user.email).toBe('john.doe@example.com');
    });

    it('should fail if required fields are missing', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                lastName: 'Doe',
                email: 'missing.fields@example.com',
                phone: '1234567890',
                password: 'password123'
            });

        expect(response.status).toBe(422);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([{ field: 'firstName', message: 'firstName is a required field' }])
        );
    });

    it('should fail if there is a duplicate email', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '1234567891',
                password: 'password123'
            });

        expect(response.status).toBe(422);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([{ field: 'email', message: 'Email in use' }])
        );
    });
});


### Setting up Jest and Supertest
Ensure your package.json has the following script to run the tests:
json
"scripts": {
  "test": "jest"
}


Then, you can run your tests using:
bash
npm test