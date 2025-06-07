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
  });

  it('should create an express app and server instance', () => {
    const { app, httpInstance } = createHttpServer({ log });
    expect(app).toBeInstanceOf(express.application.constructor);
    expect(httpInstance).toBeDefined();
  });

  it('should log HTTP requests and responses', async () => {
    const { app } = createHttpServer({ log });
    app.get('/test', (req, res) => res.send('ok'));
    await request(app).get('/test').expect(200, 'ok');
    expect(log.debug).toHaveBeenCalled();
  });

  it('should handle / GET and POST endpoints', async () => {
    const { app } = createHttpServer({ log });
    await request(app).get('/').expect(200);
    await request(app).post('/').send({ foo: 'bar' }).expect(401);
    await request(app)
      .post('/')
      .set('Authorization', `Bearer ${process.env.MCP_TOKEN}`)
      .send({ foo: 'bar' })
      .expect(500);
    await request(app)
      .post('/')
      .set('Authorization', 'Bearer invalid-token')
      .send({ foo: 'bar' })
      .expect(401);
  });
});
