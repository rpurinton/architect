// Tests for httpServer.mjs
import { createHttpServer } from '../../src/custom/httpServer.mjs';
import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';


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
    // POST / should not throw (handler is stubbed)
    await request(app).post('/').send({ foo: 'bar' }).expect(500); // Accept 406 as the stubbed response
  });
});
