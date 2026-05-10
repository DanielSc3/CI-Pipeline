import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('GET /health', () => {
  it('returns status ok with uptime and environment', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.environment).toBe('string');
    expect(typeof res.body.version).toBe('string');
  });
});

describe('GET /updates', () => {
  it('returns an array', async () => {
    const res = await request(app).get('/updates');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /updates — feature flag enabled', () => {
  beforeEach(() => {
    process.env.FEATURE_NEW_UPDATES = 'true';
  });

  afterEach(() => {
    delete process.env.FEATURE_NEW_UPDATES;
  });

  it('creates a new update and returns 201', async () => {
    const res = await request(app)
      .post('/updates')
      .send({ title: 'Maintenance window', message: 'Scheduled downtime at 2am' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Maintenance window',
      message: 'Scheduled downtime at 2am',
    });
    expect(typeof res.body.id).toBe('number');
    expect(typeof res.body.createdAt).toBe('string');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/updates')
      .send({ message: 'No title here' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title and message are required' });
  });

  it('returns 400 when message is missing', async () => {
    const res = await request(app)
      .post('/updates')
      .send({ title: 'No message here' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title and message are required' });
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/updates').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title and message are required' });
  });
});

describe('POST /updates — feature flag disabled', () => {
  beforeEach(() => {
    process.env.FEATURE_NEW_UPDATES = 'false';
  });

  afterEach(() => {
    delete process.env.FEATURE_NEW_UPDATES;
  });

  it('returns 503 when feature flag is off', async () => {
    const res = await request(app)
      .post('/updates')
      .send({ title: 'Test', message: 'Should be blocked' });

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'Publishing updates is currently disabled' });
  });
});
