import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/chat — validation', () => {
  it('returns 400 when prompt is missing', async () => {
    const res = await request(app).post('/api/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El prompt es requerido y debe ser un texto no vacío.');
  });

  it('returns 400 when prompt is empty', async () => {
    const res = await request(app).post('/api/chat').send({ prompt: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when prompt exceeds max length', async () => {
    const res = await request(app).post('/api/chat').send({ prompt: 'x'.repeat(1001) });
    expect(res.status).toBe(400);
  });

  it('returns error in English when lang is en', async () => {
    const res = await request(app).post('/api/chat').send({ lang: 'en' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Prompt is required and must be a non-empty string.');
  });
});

describe('POST /api/competitive — validation', () => {
  it('returns 400 when pokemon is missing', async () => {
    const res = await request(app).post('/api/competitive').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El campo "pokemon" es requerido y debe ser un texto no vacío.');
  });

  it('returns 400 when pokemon is empty', async () => {
    const res = await request(app).post('/api/competitive').send({ pokemon: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when pokemon exceeds max length', async () => {
    const res = await request(app).post('/api/competitive').send({ pokemon: 'x'.repeat(1001) });
    expect(res.status).toBe(400);
  });
});

describe('CORS', () => {
  it('sets Access-Control-Allow-Origin header', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
