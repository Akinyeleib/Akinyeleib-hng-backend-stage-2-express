const app = require('./app')
const request = requi../appupertest')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { describe, expect, test } = require('@jest/globals')

describe('Auth Endpoints', () => {
    afterAll(async () => {
        await prisma.user.deleteMany({});
        await prisma.organisation.deleteMany({});
        await prisma.$disconnect();
    });

    test('should register user successfully with default organisation', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'johnnys.doe@example.com',
                phone: '1234567890',
                password: 'password123'
            });

        expect(response.status).toBe(201);
        expect(response.body.data.userId).toBeDefined();
        expect(response.body.data.accessToken).toBeDefined();

        const user = await prisma.user.findUnique({ where: { email: 'johnnys.doe@example.com' } });
        expect(user).not.toBeNull();

        const organisation = await prisma.organisation.findFirst({ where: { users: { some: { userId: user.userId } } } });
        expect(organisation).not.toBeNull();
        expect(organisation.name).toBe("John's Organisation");
    });

    test('should log the user in successfully', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'johnnys.doe@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).toBeDefined();
        expect(response.body.data.user.email).toBe('johnnys.doe@example.com');
    });

    test('should fail if required fields are missing', async () => {
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

    test('should fail if there is a duplicate email', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'johnnys.doe@example.com',
                phone: '1234567891',
                password: 'password123'
            });

        expect(response.status).toBe(422);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([{ field: 'email', message: 'Email in use' }])
        );
    });
});

describe("POST /auth/register", () => {

    describe("all required values", () => {

        test("schould respond with 201", async () => {
            const response = await request(app).post("/auth/register").send({
                "firstName": "hng",
                "lastName": "intern",
                "email": "hng-intern2@gmail.com",
                "password": "dayo"
            })
            expect(response.statusCode).toBe(201)
        })

    })

})

/*
describe('Organisation Access Control', () => {
    test('should not allow access to organisations user does not belong to', async () => {
        const userToken = 'your_mocked_token'; // Mock token for a user not belonging to the organisation
        const response = await request(app)
            .get('/api/organisations/some_org_id')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("User doesn't belong to any organisation with the specified id");
    });
});

*/
