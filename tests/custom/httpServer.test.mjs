// Tests for httpServer.mjs
import { createHttpServer } from '../../src/custom/httpServer.mjs';
import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';
import 'dotenv/config';


describe('createHttpServer', () => {
  let log;
  beforeEach(() => {
    log = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
    // No hardcoded MCP_TOKEN, use .env
  });

  it('should create an express app and server instance', () => {
    const { app, serverInstance } = createHttpServer({ log });
    expect(app).toBeInstanceOf(express.application.constructor);
    expect(serverInstance).toBeDefined();
  });

  it('should log HTTP requests and responses', async () => {
    const { app } = createHttpServer({ log });
    app.get('/test', (req, res) => res.send('ok'));
    await request(app).get('/test').expect(200, 'ok');
    expect(log.debug).toHaveBeenCalled();
  });

  it('should handle / GET and POST endpoints', async () => {
    // Use mock logger and disable auto-start of MCP server
    const { app } = createHttpServer({ log });
    await request(app).get('/').expect(200);
    // POST / should require bearer token and fail with 401 if missing
    await request(app).post('/').send({ foo: 'bar' }).expect(401);
    // POST / with correct bearer token should fail with 500 (stubbed handler)
    await request(app)
      .post('/')
      .set('Authorization', `Bearer ${process.env.MCP_TOKEN}`)
      .send({ foo: 'bar' })
      .expect(500); // Accept 500 as the stubbed response
    // POST / with incorrect bearer token should fail with 401
    await request(app)
      .post('/')
      .set('Authorization', 'Bearer invalid-token')
      .send({ foo: 'bar' })
      .expect(401);
  });
});
