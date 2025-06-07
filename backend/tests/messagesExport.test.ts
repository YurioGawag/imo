import express from 'express';
import request from 'supertest';
import { Message } from '../src/models/message.model';
import { Meldung } from '../src/models/meldung.model';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../src/middleware/auth.middleware', () => ({
  roleCheck: () => (req: any, _res: any, next: any) => {
    req.user = { userId: 'u1', role: 'mieter' };
    next();
  }
}));

jest.mock('../src/models/message.model');
jest.mock('../src/models/meldung.model');

let app: express.Express;

describe('GET /:meldungId/export', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    app = express();
    app.use(express.json());
  });

  const id = '507f191e810c19729de860ab';

  it('returns 403 for unauthorized users', async () => {
    (Meldung.findById as any).mockReturnValue({
      populate: () => ({ populate: () => ({ populate: () => Promise.resolve({
        reporter: { _id: 'other', firstName: 'X', lastName: 'Y' },
        assignedTo: undefined,
        unit: { property: { owner: { _id: 'other' } } }
      }) }) })
    });

    const router = require('../src/routes/messages.routes').default;
    app.use('/', router);

    const res = await request(app).get(`/${id}/export`);
    expect(res.status).toBe(403);
  });

  it('returns pdf for authorized users', async () => {
    (Message.find as any).mockReturnValue({
      populate: () => ({ sort: () => Promise.resolve([{
        sender: { firstName: 'John', lastName: 'Doe' },
        createdAt: new Date(),
        content: 'Hello',
        attachments: []
      }]) })
    });
    (Meldung.findById as any).mockReturnValue({
      populate: () => ({ populate: () => ({ populate: () => Promise.resolve({
        title: 'Title',
        reporter: { _id: 'u1', firstName: 'R', lastName: 'T' },
        unit: {
          unitNumber: '1',
          property: {
            address: { street: 'S', city: 'C', postalCode: 'P', country: 'Country' },
            owner: { _id: 'owner' }
          }
        }
      }) }) })
    });

    const router = require('../src/routes/messages.routes').default;
    app.use('/', router);

    const res = await request(app).get(`/${id}/export`);
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/pdf');
  });
});
